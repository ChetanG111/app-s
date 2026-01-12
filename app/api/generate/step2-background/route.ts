
import { NextRequest, NextResponse } from "next/server";
import { generateBackgroundStep as genBg } from "@/services/gemini";
import { auth } from "@/auth";
import { verifyToken, signToken } from "@/lib/security";
import { rateLimit } from "@/lib/ratelimit";
import crypto from "crypto";
import prisma, { withRetry } from "@/lib/prisma";

const BACKGROUND_STYLE_MAP: Record<string, string> = {
    'charcoal': 'modern Black to light grey gradient',
    'deep_indigo': 'deep indigo to purple vibrant gradient',
    'dark_slate': 'dark slate gray minimalist surface',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageBase64(result: any): string | null {
    const candidates = result.candidates;
    if (candidates?.[0]?.content?.parts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imagePart = candidates[0].content.parts.find((p: any) => p.inlineData);
        if (imagePart?.inlineData) {
            return imagePart.inlineData.data;
        }
    }
    return null;
}

export async function POST(req: NextRequest) {
    let userId: string | null = null;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        userId = session.user.id;

        // 1. Rate Limit
        const { success } = await rateLimit(`gen-step2:${userId}`, 10, 60);
        if (!success) {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }

        const body = await req.json();
        const { image, backgroundId, customBackground, skipBackground, token } = body;

        // 2. Security Check
        if (!token) {
            return NextResponse.json({ error: "Missing security token" }, { status: 403 });
        }
        const payload = await verifyToken(token);
        // Verify Step 1, User, Transaction
        if (!payload || payload.userId !== userId || payload.step !== 1 || !payload.transactionId) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
        }

        const transactionId = payload.transactionId;

        if (!image) {
            return NextResponse.json({ error: "Missing image" }, { status: 400 });
        }

        // 3. Image Hash Verification
        if (payload.imageHash) {
            const incomingHash = crypto.createHash('sha256').update(image).digest('hex');
            if (incomingHash !== payload.imageHash) {
                return NextResponse.json({ error: "Image integrity check failed" }, { status: 403 });
            }
        }

        // If skip, just return the image
        if (skipBackground) {
            // Keep same hash
            const incomingHash = crypto.createHash('sha256').update(image).digest('hex');
            const nextToken = await signToken({ userId, step: 2, transactionId, imageHash: incomingHash });
            return NextResponse.json({ image, token: nextToken, success: true });
        }

        const backgroundPrompt = backgroundId === 'custom'
            ? (customBackground?.trim() || 'modern minimalist background')
            : (BACKGROUND_STYLE_MAP[backgroundId] || BACKGROUND_STYLE_MAP['charcoal']);

        console.log(`Step 2: Generating background with prompt: "${backgroundPrompt}"`);

        const result = await genBg(image.split(',')[1] || image, backgroundPrompt);
        const newBase64 = extractImageBase64(result);

        if (!newBase64) {
            throw new Error("Gemini returned no image");
        }

        // Hash the output
        const outputHash = crypto.createHash('sha256').update(newBase64).digest('hex');

        const nextToken = await signToken({ userId, step: 2, transactionId, imageHash: outputHash });

        return NextResponse.json({
            image: newBase64,
            token: nextToken,
            success: true
        });

    } catch (error: unknown) {
        console.error("Step 2 Background Error:", error);

        // Attempt Refund if AI failed
        if (userId) {
            try {
                // Re-verify token locally in catch block if possible, or use transactionId if it was already set
                const body = await req.clone().json().catch(() => ({}));
                const token = body.token;
                const payload = token ? await verifyToken(token).catch(() => null) : null;
                const transactionId = payload?.transactionId;

                if (transactionId && userId) {
                    const uid = userId;
                    const tid = transactionId;
                    await withRetry(() => prisma.$transaction([
                        prisma.user.update({
                            where: { id: uid },
                            data: { credits: { increment: 1 } }
                        }),
                        prisma.creditTransaction.updateMany({
                            where: { id: tid, userId: uid },
                            data: { status: "FAILED" }
                        })
                    ])).catch(e => console.error("CRITICAL: Credit refund failed", e));
                }
            } catch (e) { console.error("Refund failed", e); }
        }

        const message = error instanceof Error ? error.message : "Background generation failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
