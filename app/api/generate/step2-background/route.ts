import { NextRequest, NextResponse } from "next/server";
import { generateBackgroundStep } from "@/services/gemini";
import { auth } from "@/auth";
import { verifyToken, signToken } from "@/lib/security";
import { rateLimit } from "@/lib/ratelimit";

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
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

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
        if (!payload || payload.userId !== userId || payload.step !== 1 || !payload.transactionId) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
        }

        if (!image) {
            return NextResponse.json({ error: "Missing image" }, { status: 400 });
        }

        // Generate NEXT Token (Step 2)
        const nextToken = await signToken({ userId, step: 2, transactionId: payload.transactionId });

        // If skip, just return the image
        if (skipBackground) {
            return NextResponse.json({ image, token: nextToken, success: true });
        }

        const backgroundPrompt = backgroundId === 'custom'
            ? (customBackground?.trim() || 'modern minimalist background')
            : (BACKGROUND_STYLE_MAP[backgroundId] || BACKGROUND_STYLE_MAP['charcoal']);

        console.log(`Step 2: Generating background with prompt: "${backgroundPrompt}"`);

        const result = await generateBackgroundStep(image.split(',')[1] || image, backgroundPrompt);
        const newBase64 = extractImageBase64(result);

        if (!newBase64) {
             throw new Error("Gemini returned no image");
        }

        return NextResponse.json({ 
            image: newBase64, 
            token: nextToken,
            success: true 
        });

    } catch (error: unknown) {
        console.error("Step 2 Background Error:", error);
        const message = error instanceof Error ? error.message : "Background generation failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}