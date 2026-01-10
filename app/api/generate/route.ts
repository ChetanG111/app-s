import { NextRequest, NextResponse } from "next/server";
import { generateBackgroundStep } from "@/services/gemini";
import { addTextOverlay } from "@/services/typography";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { auth } from "@/auth";
import prisma, { withRetry } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";
import { spawn } from "child_process";

const BACKGROUND_STYLE_MAP: Record<string, string> = {
    'charcoal': 'modern Black to light grey gradient',
    'deep_indigo': 'deep indigo to purple vibrant gradient',
    'dark_slate': 'dark slate gray minimalist surface',
};

const GenerateRequestSchema = z.object({
    screenshot: z.string().min(1, "Screenshot is required"),
    style: z.enum(['Basic', 'Rotated', 'Rotated-left-facing']).default('Basic'),
    backgroundId: z.string().optional().default('charcoal'),
    customBackground: z.string().optional(),
    headline: z.string().max(100).optional(),
    font: z.string().optional(),
    color: z.string().optional(),
    skipBackground: z.boolean().optional(),
});

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

                // 0.1 Rate Limit (Safeguard)
                const limitResult = await rateLimit(`generate:${userId}`, 10, 60); // 10 reqs/min
                if (!limitResult.success) {
                    sendUpdate({ type: 'error', error: "Rate limit exceeded. Please wait." });
                    controller.close();
                    return;
                }

                // 0.2 Parse & Validate Body
                const rawBody = await req.json();

                // Payload Size Check (approx)
                if (JSON.stringify(rawBody).length > 6 * 1024 * 1024) {
                    sendUpdate({ type: 'error', error: "Payload too large. Use an image under 5MB." });
                    controller.close();
                    return;
                }

                const parseResult = GenerateRequestSchema.safeParse(rawBody);
                if (!parseResult.success) {
                    sendUpdate({ type: 'error', error: parseResult.error.issues[0].message });
                    controller.close();
                    return;
                }

                const {
                    screenshot,
                    style,
                    backgroundId,
                    customBackground,
                    headline,
                    font,
                    color,
                    skipBackground
                } = parseResult.data;

                // Deduct credit atomically and verify sufficiency
                const updateResult = await withRetry(() => prisma.user.updateMany({
                    where: {
                        id: userId!,
                        credits: { gt: 0 }
                    },
                    data: { credits: { decrement: 1 } }
                }));

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

                const timestamp = Date.now();
                const intermediateDir = path.join(process.cwd(), "public", "intermediate");
                if (!existsSync(intermediateDir)) {
                    await fs.mkdir(intermediateDir, { recursive: true });
                }

                // 2. STEP 1: Screen Replacement (Python)
                // Save incoming screenshot to temp file
                const tempInputPath = path.join(intermediateDir, `temp-input-${timestamp}.png`);
                const screenshotBuffer = Buffer.from(screenshot.split(",")[1], 'base64');
                await fs.writeFile(tempInputPath, screenshotBuffer);

                const step1OutputPath = path.join(intermediateDir, `step1-${timestamp}.png`);
                const layoutPath = path.join(process.cwd(), "coords", "layout.json");
                const runScriptPath = path.join(process.cwd(), "run.py");

                // Execute Python script
                // Adjust 'python' to 'python3' if needed for your environment, 
                // but 'python' is usually safe on Windows/Standard envs.
                const pythonCommand = process.platform === "win32" ? "python" : "python3"; 
                
                await new Promise<void>((resolve, reject) => {
                    const pyProcess = spawn(pythonCommand, [
                        runScriptPath,
                        '--screenshot', tempInputPath,
                        '--template', templatePath,
                        '--layout', layoutPath,
                        '--output', step1OutputPath
                    ]);

                    let stderrData = "";
                    pyProcess.stderr.on('data', (data) => {
                        stderrData += data.toString();
                    });

                    pyProcess.on('close', (code) => {
                        if (code !== 0) {
                            reject(new Error(`Python script failed with code ${code}: ${stderrData}`));
                        } else {
                            resolve();
                        }
                    });
                });

                // Read the output from Python
                if (!existsSync(step1OutputPath)) {
                    throw new Error("Python script did not generate output file.");
                }
                const step1Buffer = await fs.readFile(step1OutputPath);
                const step1Base64 = step1Buffer.toString('base64');

                // Clean up temp input
                await fs.unlink(tempInputPath).catch(() => {});

                // 4. STEP 2: Background (AI)
                let step2Base64 = step1Base64;
                if (!skipBackground) {
                    sendUpdate({ type: 'progress', step: "Generating background" });
                    const backgroundPrompt = backgroundId === 'custom'
                        ? (customBackground?.trim() || 'modern minimalist background')
                        : (BACKGROUND_STYLE_MAP[backgroundId] || BACKGROUND_STYLE_MAP['charcoal']);

                    console.log(`Generating with background prompt: "${backgroundPrompt}"`);

                    const step2Result = await generateBackgroundStep(step1Base64, backgroundPrompt);
                    const extractedBase64 = extractImageBase64(step2Result);

                    if (extractedBase64) {
                        step2Base64 = extractedBase64;
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
                await withRetry(() => prisma.screenshot.create({
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
                }));

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
                        await withRetry(() => prisma.user.update({
                            where: { id: userId! },
                            data: { credits: { increment: 1 } }
                        }));
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