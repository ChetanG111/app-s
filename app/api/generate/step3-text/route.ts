import { NextRequest, NextResponse } from "next/server";
import { addTextOverlay } from "@/services/typography";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/security";
import { rateLimit } from "@/lib/ratelimit";

// Init Supabase (Service Role for admin uploads)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        // 1. Rate Limit
        const { success } = await rateLimit(`gen-step3:${userId}`, 10, 60);
        if (!success) {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }

        const body = await req.json();
        const { 
            image, // base64
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

        if (!image) {
            return NextResponse.json({ error: "Missing image" }, { status: 400 });
        }

        // 3. Add Text
        let finalImageBase64 = image;
        if (headline) {
            const cleanBase64 = image.split(',').pop()!;
            finalImageBase64 = await addTextOverlay(cleanBase64, headline, font, color);
        } else {
             finalImageBase64 = image.split(',').pop()!;
        }

        // 4. Upload to Supabase Storage
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

        // 5. Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('outputs')
            .getPublicUrl(finalFilename);

        // 6. Save to DB & Complete Transaction
        await prisma.$transaction(async (tx) => {
            // Save Screenshot
            await tx.screenshot.create({
                data: {
                    userId: userId,
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
            await tx.creditTransaction.update({
                where: { id: payload.transactionId },
                data: { status: "COMPLETED" }
            });
        });

        return NextResponse.json({ 
            image: `data:image/png;base64,${finalImageBase64}`,
            url: publicUrl,
            success: true 
        });

    } catch (error: unknown) {
        console.error("Step 3 Text Error:", error);
        const message = error instanceof Error ? error.message : "Text overlay failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}