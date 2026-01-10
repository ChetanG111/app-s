
import { NextRequest, NextResponse } from "next/server";
import { generateBackgroundStep } from "@/services/gemini";

const BACKGROUND_STYLE_MAP: Record<string, string> = {
    'charcoal': 'modern Black to light grey gradient',
    'deep_indigo': 'deep indigo to purple vibrant gradient',
    'dark_slate': 'dark slate gray minimalist surface',
};

function extractImageBase64(result: any): string | null {
    const candidates = result.candidates;
    if (candidates?.[0]?.content?.parts) {
        const imagePart = candidates[0].content.parts.find((p: any) => p.inlineData);
        if (imagePart?.inlineData) {
            return imagePart.inlineData.data;
        }
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image, backgroundId, customBackground, skipBackground } = body;

        if (!image) {
            return NextResponse.json({ error: "Missing image" }, { status: 400 });
        }

        // If skip, just return the image
        if (skipBackground) {
            return NextResponse.json({ image, success: true });
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
            image: newBase64, // Usually raw base64 from Gemini
            success: true 
        });

    } catch (e: any) {
        console.error("Step 2 Background Error:", e);
        return NextResponse.json({ error: e.message || "Background generation failed" }, { status: 500 });
    }
}
