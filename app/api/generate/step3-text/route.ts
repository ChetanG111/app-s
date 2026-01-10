
import { NextRequest, NextResponse } from "next/server";
import { addTextOverlay } from "@/services/typography";
import { auth } from "@/auth";
import prisma, { withRetry } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

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

        const body = await req.json();
        const { 
            image, // base64
            headline, 
            font, 
            color,
            style,
            backgroundId
        } = body;

        if (!image) {
            return NextResponse.json({ error: "Missing image" }, { status: 400 });
        }

        // 1. Add Text
        let finalImageBase64 = image;
        if (headline) {
            const cleanBase64 = image.split(',').pop();
            finalImageBase64 = await addTextOverlay(cleanBase64, headline, font, color);
        } else {
             finalImageBase64 = image.split(',').pop();
        }

        // 2. Upload to Supabase Storage
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

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('outputs')
            .getPublicUrl(finalFilename);

        // 4. Save to DB
        await withRetry(() => prisma.screenshot.create({
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
        }));

        return NextResponse.json({ 
            image: `data:image/png;base64,${finalImageBase64}`,
            url: publicUrl,
            success: true 
        });

    } catch (e: any) {
        console.error("Step 3 Text Error:", e);
        return NextResponse.json({ error: e.message || "Text overlay failed" }, { status: 500 });
    }
}
