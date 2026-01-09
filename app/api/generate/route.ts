import { NextRequest, NextResponse } from "next/server";
import { generateScreenStep, generateBackgroundStep, verifyImage } from "@/services/gemini";
import { addTextOverlay } from "@/services/typography";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const BACKGROUND_STYLE_MAP: Record<string, string> = {
    'charcoal': 'modern Black to light grey gradient',
    'deep_indigo': 'deep indigo to purple vibrant gradient',
    'dark_slate': 'dark slate gray minimalist surface',
};

interface CandidatePart {
    inlineData?: {
        data: string;
    };
}

interface GenerationCandidate {
    content?: {
        parts?: CandidatePart[];
    };
}

interface GenerationResult {
    candidates?: GenerationCandidate[];
}

function extractImageBase64(result: GenerationResult): string | null {
    const candidates = result.candidates;
    if (candidates?.[0]?.content?.parts) {
        const imagePart = candidates[0].content.parts.find((p) => p.inlineData);
        if (imagePart?.inlineData) {
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
            const sendUpdate = (data: Record<string, unknown>) => {
                controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
            };

            let creditsDeducted = false;
            let userId: string | null = null;

            try {
                // 0. Check Auth & Credits
                const session = await auth();
                if (!session?.user?.id) {
                    sendUpdate({ type: 'error', error: "Unauthorized. Please log in." });
                    controller.close();
                    return;
                }
                userId = session.user.id;

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
                    throw new Error("Screenshot is required");
                }

                // Deduct credit atomically and verify sufficiency
                const updateResult = await prisma.user.updateMany({
                    where: { 
                        id: userId,
                        credits: { gt: 0 }
                    },
                    data: { credits: { decrement: 1 } }
                });

                if (updateResult.count === 0) {
                    sendUpdate({ type: 'error', error: "Insufficient credits" });
                    controller.close();
                    return;
                }
                creditsDeducted = true;

                // 1. Prepare Files
                sendUpdate({ type: 'progress', step: "Creating overlay" });
                const templatePath = path.join(process.cwd(), "public", "templates", "layouts", `${style}.png`);
                if (!existsSync(templatePath)) {
                    throw new Error(`Template style '${style}' not found`);
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
                    throw new Error("Step 1 failed: No image returned.");
                }

                // 3. Verification Step 1
                sendUpdate({ type: 'progress', step: "Verifying" });
                const verification = await verifyImage(step1Base64);
                if (!verification.passed) {
                    console.warn("Step 1 Validation Failed, retrying...");
                    step1Result = await generateScreenStep(screenshot, templateBase64);
                    step1Base64 = extractImageBase64(step1Result);
                    if (!step1Base64) {
                        throw new Error("Step 1 retry failed.");
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
                const outputDir = path.join(process.cwd(), "private", "outputs");
                if (!existsSync(outputDir)) {
                    await fs.mkdir(outputDir, { recursive: true });
                }
                await fs.writeFile(path.join(outputDir, finalFilename), Buffer.from(finalImageBase64, 'base64'));

                // Save to database
                await prisma.screenshot.create({
                    data: {
                        userId: userId!,
                        url: `/api/images/${finalFilename}`,
                        projectName: "Generated Mockup", // You can pass this from frontend later
                        settings: {
                            style,
                            backgroundId,
                            headline,
                            font,
                            color
                        }
                    }
                });

                sendUpdate({
                    type: 'final',
                    image: `/api/images/${finalFilename}`,
                    step1: `/intermediate/step1-${timestamp}.png`,
                    step2: `/intermediate/step2-${timestamp}.png`
                });

                controller.close();
            } catch (error) {
                console.error("GENERATION ERROR:", error);
                
                // Refund credit if we deducted it but failed
                if (creditsDeducted && userId) {
                    try {
                        await prisma.user.update({
                            where: { id: userId },
                            data: { credits: { increment: 1 } }
                        });
                        console.log("Credit refunded due to error");
                    } catch (refundError) {
                        console.error("CRITICAL: Failed to refund credit:", refundError);
                    }
                }

                const errorMessage = error instanceof Error ? error.message : "Processing failed";
                sendUpdate({ type: 'error', error: errorMessage });
                controller.close();
            }
        }
    });

    return new NextResponse(stream);
}