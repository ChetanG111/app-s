import { NextRequest, NextResponse } from "next/server";
import { generateScreenStep, generateBackgroundStep, verifyImage } from "@/services/gemini";
import { addTextOverlay } from "@/services/typography";
import fs from "fs/promises"; // Use promises API
import { existsSync } from "fs"; // Keep sync exists for simple checks or use async access
import path from "path";

const BACKGROUND_STYLE_MAP: Record<string, string> = {
    'charcoal': 'modern Black to light grey gradient',
    'deep_indigo': 'deep indigo to purple vibrant gradient',
    'dark_slate': 'dark slate gray minimalist surface',
};

// ... (helper functions remain same) ...

// Helper to extract raw base64 from Gemini response
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
    // Trigger cleanup asynchronously (DISABLED for now)
    // cleanupOldFiles();

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
            return NextResponse.json({ error: "Screenshot is required" }, { status: 400 });
        }

        // 1. Prepare Files
        const templatePath = path.join(process.cwd(), "public", "templates", "layouts", `${style}.png`);
        
        // Use sync exists for simplicity in checking file presence, or try/catch read
        if (!existsSync(templatePath)) {
            return NextResponse.json({ error: `Template style '${style}' not found` }, { status: 404 });
        }
        const templateBuffer = await fs.readFile(templatePath);
        const templateBase64 = `data:image/png;base64,${templateBuffer.toString("base64")}`;

        const timestamp = Date.now();
        const intermediateDir = path.join(process.cwd(), "public", "intermediate");
        if (!existsSync(intermediateDir)) {
            await fs.mkdir(intermediateDir, { recursive: true });
        }

        // 2. STEP 1: Screen Replacement (AI)
        console.log("Generating Step 1: Screen Overlay...");
        let step1Result = await generateScreenStep(screenshot, templateBase64);
        let step1Base64 = extractImageBase64(step1Result);

        if (!step1Base64) {
             return NextResponse.json({ error: "Step 1 failed: No image returned." }, { status: 500 });
        }

        // 3. Verification Step 1
        console.log("Verifying Step 1...");
        const verification = await verifyImage(step1Base64);
        if (!verification.passed) {
            console.warn("Step 1 Validation Failed:", verification.reason, "- Retrying...");
            // Retry once
            step1Result = await generateScreenStep(screenshot, templateBase64);
            step1Base64 = extractImageBase64(step1Result);
            if (!step1Base64) {
                 return NextResponse.json({ error: "Step 1 Retry failed." }, { status: 500 });
            }
            
            // Verify the retry result too
            const retryVerification = await verifyImage(step1Base64);
            if (!retryVerification.passed) {
                console.warn("Step 1 Retry also failed validation:", retryVerification.reason);
                // We proceed anyway to avoid blocking the user, but log it.
            }
        }

        // Save Step 1
        await fs.writeFile(path.join(intermediateDir, `step1-${timestamp}.png`), Buffer.from(step1Base64, 'base64'));

        // 4. STEP 2: Background (AI)
        let step2Base64 = step1Base64;
        if (!skipBackground) {
            const backgroundPrompt = backgroundId === 'custom'
                ? customBackground
                : (BACKGROUND_STYLE_MAP[backgroundId] || BACKGROUND_STYLE_MAP['charcoal']);

            console.log(`Generating Step 2: Background (${backgroundId})...`);
            const step2Result = await generateBackgroundStep(step1Base64, backgroundPrompt);
            const extractedBase64 = extractImageBase64(step2Result);

            if (extractedBase64) {
                step2Base64 = extractedBase64;
                
                // Verify Background
                const bgVerification = await verifyImage(step2Base64);
                if (!bgVerification.passed) {
                     console.warn("Background Verification Failed:", bgVerification.reason, "- Retrying...");
                     const retryResult = await generateBackgroundStep(step1Base64, backgroundPrompt);
                     const retryBase64 = extractImageBase64(retryResult);
                     if (retryBase64) step2Base64 = retryBase64;
                }
            } else {
                console.warn("Background Step failed to return image, using Step 1 result.");
            }
        }
        
        // Save Step 2
        await fs.writeFile(path.join(intermediateDir, `step2-${timestamp}.png`), Buffer.from(step2Base64, 'base64'));

        // 5. STEP 3: Typography (Code/Sharp)
        let finalImageBase64 = step2Base64;
        if (headline) {
            console.log("Generating Step 3: Text Overlay (Sharp)...");
            // addTextOverlay returns base64 (raw)
            finalImageBase64 = await addTextOverlay(step2Base64, headline, font, color);
        }

        // 6. Save Final
        const finalFilename = `mockup-${timestamp}.png`;
        const outputDir = path.join(process.cwd(), "public", "outputs");
        if (!existsSync(outputDir)) {
            await fs.mkdir(outputDir, { recursive: true });
        }
        await fs.writeFile(path.join(outputDir, finalFilename), Buffer.from(finalImageBase64, 'base64'));

        return NextResponse.json({
            image: `/outputs/${finalFilename}`,
            step1: `/intermediate/step1-${timestamp}.png`,
            step2: `/intermediate/step2-${timestamp}.png`
        });

    } catch (error: any) {
        console.error("GENERATION ERROR:", error);
        return NextResponse.json({
            error: error.message || "Processing failed",
        }, { status: 500 });
    }
}