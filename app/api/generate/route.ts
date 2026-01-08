import { NextRequest, NextResponse } from "next/server";
import { generateStep1, generateStep2 } from "@/services/gemini";
import fs from "fs";
import path from "path";

const BACKGROUND_STYLE_MAP: Record<string, string> = {
    'charcoal': 'modern Black to light grey gradient',
    'deep_indigo': 'deep indigo to purple vibrant gradient',
    'dark_slate': 'dark slate gray minimalist surface',
};

function extractImageBase64(result: any): string | null {
    const candidates = result.candidates;
    if (candidates?.[0]?.content?.parts) {
        const imagePart = candidates[0].content.parts.find((p: any) => p.inlineData);
        if (imagePart) {
            return imagePart.inlineData.data;
        }
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const {
            screenshot,
            style = 'Basic',
            backgroundId = 'charcoal',
            customBackground = '',
            skipBackground = false
        } = await req.json();

        if (!screenshot) {
            return NextResponse.json({ error: "Screenshot is required" }, { status: 400 });
        }

        // Read the template image from public folder
        const templatePath = path.join(process.cwd(), "public", "templates", "layouts", `${style}.png`);
        if (!fs.existsSync(templatePath)) {
            return NextResponse.json({ error: `Template style '${style}' not found` }, { status: 404 });
        }

        const templateBuffer = fs.readFileSync(templatePath);
        const templateBase64 = `data:image/png;base64,${templateBuffer.toString("base64")}`;

        // STEP 1: Generate mockup on plain white background
        console.log("Generating Step 1: Mockup on white...");
        const step1Result = await generateStep1(screenshot, templateBase64);
        const mockupBase64 = extractImageBase64(step1Result);

        if (!mockupBase64) {
            return NextResponse.json({
                error: "Step 1 failed: Model did not return an image.",
                raw: step1Result
            }, { status: 500 });
        }

        // Save Step 1 intermediate result to disk
        const step1Buffer = Buffer.from(mockupBase64, 'base64');
        const timestamp = Date.now();
        const step1Filename = `step1-${timestamp}.png`;
        const intermediateDir = path.join(process.cwd(), "public", "intermediate");

        if (!fs.existsSync(intermediateDir)) {
            fs.mkdirSync(intermediateDir, { recursive: true });
        }
        fs.writeFileSync(path.join(intermediateDir, step1Filename), step1Buffer);

        let finalImageBase64 = mockupBase64;
        let finalFilename = `mockup-${timestamp}.png`;

        if (!skipBackground) {
            // Determine background prompt
            const backgroundPrompt = backgroundId === 'custom'
                ? customBackground
                : (BACKGROUND_STYLE_MAP[backgroundId] || BACKGROUND_STYLE_MAP['charcoal']);

            // STEP 2: Generate background for the mockup
            console.log(`Generating Step 2: Background with style '${backgroundId}'...`);
            const finalResult = await generateStep2(mockupBase64, backgroundPrompt);
            const extractedBase64 = extractImageBase64(finalResult);

            if (!extractedBase64) {
                return NextResponse.json({
                    error: "Step 2 failed: Model did not return an image.",
                    raw: finalResult
                }, { status: 500 });
            }
            finalImageBase64 = extractedBase64;
        } else {
            console.log("Skipping Step 2 as requested.");
        }

        // Save final image to disk
        const outputDir = path.join(process.cwd(), "public", "outputs");

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(path.join(outputDir, finalFilename), Buffer.from(finalImageBase64, 'base64'));

        return NextResponse.json({
            image: `/outputs/${finalFilename}`,
            intermediate: `/intermediate/${step1Filename}`
        });

    } catch (error: any) {
        // Log the full error to the console for debugging
        console.error("CRITICAL GENERATION ERROR:", error);

        let userMessage = "Something went wrong during generation. Please try again.";
        let statusCode = 500;

        // Handle specific Gemini/Google AI errors
        const errorMsg = error.message || "";
        const status = error.status || (error.response?.status);

        if (status === 503 || errorMsg.includes("503") || errorMsg.includes("overloaded")) {
            userMessage = "The AI is currently under high load and is taking a breather. Please wait 10-20 seconds and try again.";
            statusCode = 503;
        } else if (status === 429 || errorMsg.includes("429") || errorMsg.includes("quota")) {
            userMessage = "Slow down! You've hit the generation limit. Please wait a minute before trying again.";
            statusCode = 429;
        } else if (status === 400 && errorMsg.includes("safety")) {
            userMessage = "The AI filters blocked this generation. Try using a different screenshot or a simpler background prompt.";
            statusCode = 400;
        } else if (errorMsg.includes("API key")) {
            userMessage = "Invalid API configuration. Please check your Gemini API key.";
            statusCode = 401;
        }

        return NextResponse.json({
            error: userMessage,
            rawError: process.env.NODE_ENV === 'development' ? errorMsg : undefined
        }, { status: statusCode });
    }
}
