
import { NextRequest, NextResponse } from "next/server";
import { addTextOverlay } from "@/services/typography";
import { auth } from "@/auth";
import prisma, { withRetry } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/security";
import { rateLimit } from "@/lib/ratelimit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    // Init Supabase inside handler to avoid build-time env var issues
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let userId: string | null = null;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        userId = session.user.id;

        // 1. Rate Limit
        const { success } = await rateLimit(`gen-step3:${userId}`, 10, 60);
        if (!success) {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }

        const body = await req.json();
        const { 
            image, 
            headline, 
            font, 
            color,
            style,
            backgroundId,
            token
        } = body;

        // 2. Security Check
        if (!token) {
            return NextResponse.json({ error: "Missing security token" }, { status: 403 });
        }
        const payload = await verifyToken(token);
        if (!payload || payload.userId !== userId || payload.step !== 2 || !payload.transactionId) {
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

        // 4. Add Text
        let finalImageBase64 = image;
        if (headline) {
            const cleanBase64 = image.split(',').pop();
            finalImageBase64 = await addTextOverlay(cleanBase64, headline, font, color);
        } else {
             finalImageBase64 = image.split(',').pop();
        }

        // 5. Upload to Supabase Storage
        const timestamp = Date.now();
        const finalFilename = `mockup-${timestamp}.png`;
        const buffer = Buffer.from(finalImageBase64, 'base64');

        const { error: uploadError } = await supabase
            .storage
            .from('outputs')
            .upload(finalFilename, buffer, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            console.error("Supabase Upload Error:", uploadError);
            throw new Error("Failed to upload image to storage");
        }

        // 6. Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('outputs')
            .getPublicUrl(finalFilename);

        // 7. Save to DB & Complete Transaction
        await withRetry(() => prisma.$transaction(async (tx) => {
            // Create Screenshot Record
            await tx.screenshot.create({
                data: {
                    userId: userId!,
                    url: publicUrl,
                    projectName: "Generated Mockup",
                    settings: {
                        style: style || 'Basic',
                        backgroundId: backgroundId || 'charcoal',
                        headline: headline || '',
                        font: font || 'standard',
                        color: color || 'white'
                    }
                }
            });

            // Mark Transaction as Completed
            // Assuming CreditTransaction model exists based on Step 1
            await tx.creditTransaction.update({
                where: { id: transactionId },
                data: { status: "COMPLETED" }
            });
        }));

        return NextResponse.json({ 
            image: `data:image/png;base64,${finalImageBase64}`,
            url: publicUrl,
            success: true 
        });

    } catch (error: unknown) {
        console.error("Step 3 Text Error:", error);
        
        // Refund Credit
        if (userId) {
            try {
                const body = await req.clone().json().catch(() => ({}));
                const token = body.token;
                const payload = token ? await verifyToken(token).catch(() => null) : null;
                const transactionId = payload?.transactionId;

                if (transactionId) {
                    await withRetry(() => prisma.$transaction([
                        prisma.user.update({
                            where: { id: userId },
                            data: { credits: { increment: 1 } }
                        }),
                        prisma.creditTransaction.update({
                            where: { id: transactionId },
                            data: { status: "FAILED" }
                        })
                    ])).catch(e => console.error("CRITICAL: Credit refund failed", e));
                }
            } catch(e) { console.error("Refund failed", e); }
        }
        
        const message = error instanceof Error ? error.message : "Text overlay failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
