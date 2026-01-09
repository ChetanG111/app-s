import { NextRequest, NextResponse } from "next/server";
import { generateScreenStep, generateBackgroundStep, verifyImage } from "@/services/gemini";
import { addTextOverlay } from "@/services/typography";
import fs from "fs/promises";
import { existsSync } from "fs";
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

    // We'll use a ReadableStream so we can send progress updates
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
                    font = 'Sans-serif',
                    color = 'white',
                    skipBackground = false
                } = await req.json();

                if (!screenshot) {
                    sendUpdate({ type: 'error', error: "Screenshot is required" });
                    controller.close();
                    return;
                }

                // 1. Prepare Files
                sendUpdate({ type: 'progress', step: "Creating overlay" });
                const templatePath = path.join(process.cwd(), "public", "templates", "layouts", `${style}.png`);
                if (!existsSync(templatePath)) {
                    sendUpdate({ type: 'error', error: `Template style '${style}' not found` });
                    controller.close();
                    return;
                }
                const templateBuffer = await fs.readFile(templatePath);
                const templateBase64 = `data:image/png;base64,${templateBuffer.toString("base64")}`;

                const timestamp = Date.now();
                const intermediateDir = path.join(process.cwd(), "public", "intermediate");
                if (!existsSync(intermediateDir)) {
                    await fs.mkdir(intermediateDir, { recursive: true });
                }

                // 2. STEP 1: Screen Replacement (AI)
                let step1Result = await generateScreenStep(screenshot, templateBase64);
                let step1Base64 = extractImageBase64(step1Result);

                if (!step1Base64) {
                    sendUpdate({ type: 'error', error: "Step 1 failed: No image returned." });
                    controller.close();
                    return;
                }

                // 3. Verification Step 1
                sendUpdate({ type: 'progress', step: "Verifying" });
                const verification = await verifyImage(step1Base64);
                if (!verification.passed) {
                    console.warn("Step 1 Validation Failed, retrying...");
                    step1Result = await generateScreenStep(screenshot, templateBase64);
                    step1Base64 = extractImageBase64(step1Result);
                    if (!step1Base64) {
                        sendUpdate({ type: 'error', error: "Step 1 retry failed." });
                        controller.close();
                        return;
                    }
                }

                // Save Step 1
                await fs.writeFile(path.join(intermediateDir, `step1-${timestamp}.png`), Buffer.from(step1Base64, 'base64'));

                // 4. STEP 2: Background (AI)
                let step2Base64 = step1Base64;
                if (!skipBackground) {
                    sendUpdate({ type: 'progress', step: "Generating background" });
                    const backgroundPrompt = backgroundId === 'custom'
                        ? customBackground
                        : (BACKGROUND_STYLE_MAP[backgroundId] || BACKGROUND_STYLE_MAP['charcoal']);

                    const step2Result = await generateBackgroundStep(step1Base64, backgroundPrompt);
                    const extractedBase64 = extractImageBase64(step2Result);

                    if (extractedBase64) {
                        step2Base64 = extractedBase64;
                        // Verify Background
                        const bgVerification = await verifyImage(step2Base64);
                        if (!bgVerification.passed) {
                            const retryResult = await generateBackgroundStep(step1Base64, backgroundPrompt);
                            const retryBase64 = extractImageBase64(retryResult);
                            if (retryBase64) step2Base64 = retryBase64;
                        }
                    }
                }

                await fs.writeFile(path.join(intermediateDir, `step2-${timestamp}.png`), Buffer.from(step2Base64, 'base64'));

                // 5. STEP 3: Typography
                let finalImageBase64 = step2Base64;
                if (headline) {
                    sendUpdate({ type: 'progress', step: "Adding text" });
                    finalImageBase64 = await addTextOverlay(step2Base64, headline, font, color);
                }

                // 6. Cleanup & Final Save
                sendUpdate({ type: 'progress', step: "Cleaning up" });
                const finalFilename = `mockup-${timestamp}.png`;
                const outputDir = path.join(process.cwd(), "public", "outputs");
                if (!existsSync(outputDir)) {
                    await fs.mkdir(outputDir, { recursive: true });
                }
                await fs.writeFile(path.join(outputDir, finalFilename), Buffer.from(finalImageBase64, 'base64'));

                sendUpdate({
                    type: 'final',
                    image: `/outputs/${finalFilename}`,
                    step1: `/intermediate/step1-${timestamp}.png`,
                    step2: `/intermediate/step2-${timestamp}.png`
                });

                controller.close();
            } catch (error: any) {
                console.error("GENERATION ERROR:", error);
                sendUpdate({ type: 'error', error: error.message || "Processing failed" });
                controller.close();
            }
        }
    });

    return new NextResponse(stream);
}