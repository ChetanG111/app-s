import { NextRequest, NextResponse } from "next/server";
import { generateScreenStep, generateTextStep, generateBackgroundStep } from "@/services/gemini";
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
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendUpdate = (data: any) => {
                controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
            };

            try {
                const {
                    screenshot,
                    style = 'Basic',
                    backgroundId = 'charcoal',
                    customBackground = '',
                    headline = '',
                    font = 'standard',
                    color = 'white',
                    skipBackground = false
                } = await req.json();

                if (!screenshot) {
                    sendUpdate({ error: "Screenshot is required" });
                    controller.close();
                    return;
                }

                // Read the template image from public folder
                const templatePath = path.join(process.cwd(), "public", "templates", "layouts", `${style}.png`);
                if (!fs.existsSync(templatePath)) {
                    sendUpdate({ error: `Template style '${style}' not found` });
                    controller.close();
                    return;
                }

                const templateBuffer = fs.readFileSync(templatePath);
                const templateBase64 = `data:image/png;base64,${templateBuffer.toString("base64")}`;

                const timestamp = Date.now();
                const intermediateDir = path.join(process.cwd(), "public", "intermediate");
                if (!fs.existsSync(intermediateDir)) {
                    fs.mkdirSync(intermediateDir, { recursive: true });
                }

                // STEP 1: Generate mockup on plain white background (Screen Overlay)
                console.log("Generating Step 1: Screen Overlay...");
                sendUpdate({ step: 'overlaying', status: 'started' });
                const step1Result = await generateScreenStep(screenshot, templateBase64);
                const step1Base64 = extractImageBase64(step1Result);

                if (!step1Base64) {
                    sendUpdate({ error: "Step 1 failed: Model did not return an image." });
                    controller.close();
                    return;
                }
                fs.writeFileSync(path.join(intermediateDir, `step1-${timestamp}.png`), Buffer.from(step1Base64, 'base64'));

                // STEP 2: Generate Text Overlay
                let step2Base64 = step1Base64;
                if (headline) {
                    console.log("Generating Step 2: Text Overlay...");
                    sendUpdate({ step: 'text', status: 'started' });
                    const step2Result = await generateTextStep(step1Base64, headline, font, color);
                    const extractedStep2 = extractImageBase64(step2Result);

                    if (!extractedStep2) {
                        sendUpdate({ error: "Step 2 failed: Model did not return an image." });
                        controller.close();
                        return;
                    }
                    step2Base64 = extractedStep2;
                    fs.writeFileSync(path.join(intermediateDir, `step2-${timestamp}.png`), Buffer.from(step2Base64, 'base64'));
                }

                // STEP 3: Generate background
                let finalImageBase64 = step2Base64;
                const finalFilename = `mockup-${timestamp}.png`;

                if (!skipBackground) {
                    const backgroundPrompt = backgroundId === 'custom'
                        ? customBackground
                        : (BACKGROUND_STYLE_MAP[backgroundId] || BACKGROUND_STYLE_MAP['charcoal']);

                    console.log(`Generating Step 3: Background with style '${backgroundId}'...`);
                    sendUpdate({ step: 'background', status: 'started' });
                    const finalResult = await generateBackgroundStep(step2Base64, backgroundPrompt);
                    const extractedBase64 = extractImageBase64(finalResult);

                    if (!extractedBase64) {
                        sendUpdate({ error: "Step 3 failed: Model did not return an image." });
                        controller.close();
                        return;
                    }
                    finalImageBase64 = extractedBase64;
                }

                // Save final image
                const outputDir = path.join(process.cwd(), "public", "outputs");
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                fs.writeFileSync(path.join(outputDir, finalFilename), Buffer.from(finalImageBase64, 'base64'));

                // Send final result
                sendUpdate({
                    done: true,
                    result: {
                        image: `/outputs/${finalFilename}`,
                        step1: `/intermediate/step1-${timestamp}.png`,
                        step2: headline ? `/intermediate/step2-${timestamp}.png` : null
                    }
                });
                controller.close();

            } catch (error: any) {
                console.error("CRITICAL GENERATION ERROR:", error);
                sendUpdate({ error: error.message || "Internal server error" });
                controller.close();
            }
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson',
            'Cache-Control': 'no-cache',
        },
    });
}
