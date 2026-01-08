import { NextRequest, NextResponse } from "next/server";
import { generateMockup } from "@/services/gemini";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { screenshot, style = 'Basic' } = await req.json();

        if (!screenshot) {
            return NextResponse.json({ error: "Screenshot is required" }, { status: 400 });
        }

        // Read the template image from public folder
        const templatePath = path.join(process.cwd(), "public", "templates", "layouts", `${style}.png`);
        const templateBuffer = fs.readFileSync(templatePath);
        const templateBase64 = `data:image/png;base64,${templateBuffer.toString("base64")}`;

        const result = await generateMockup(screenshot, templateBase64);

        // Handling the response. In a real scenario with Imagen/Gemini Image, 
        // the response would contain the generated image bytes.
        // For now, we return the result text or data.

        // Caution: Standard Gemini models return Text. 
        // If gemini-2.5-flash-image returns an image part, we need to extract it.
        const candidates = (result as any).candidates;
        if (candidates?.[0]?.content?.parts) {
            const imagePart = candidates[0].content.parts.find((p: any) => p.inlineData);
            if (imagePart) {
                const base64Data = imagePart.inlineData.data;
                const buffer = Buffer.from(base64Data, 'base64');

                // Generate unique filename
                const filename = `mockup-${Date.now()}.png`;
                const outputPath = path.join(process.cwd(), "public", "outputs", filename);

                // Save to disk
                fs.writeFileSync(outputPath, buffer);

                return NextResponse.json({
                    image: `/outputs/${filename}`
                });
            }
        }

        return NextResponse.json({
            error: "Model did not return an image. Check prompt or model capabilities.",
            raw: result
        }, { status: 500 });

    } catch (error: any) {
        console.error("Generation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
