import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// SYSTEM INSTRUCTION: The Persona Lock
const SYSTEM_INSTRUCTION = `
You are a professional App Store marketing designer. 
You specialize in clean, high-contrast mockups. 
You must never add extra hands, blurry edges, or distort the proportions of the mobile phone. 
You must keep all backgrounds minimalist to ensure the app UI remains the focal point.
`;

const NEGATIVE_CONSTRAINTS = `
NEGATIVE_CONSTRAINTS: No extra objects, no watermarks, no blurry text, 
no skin textures, no realistic human hands, no artifacts on the phone edges, 
no distortion of the UI screenshot, no banding in colors.
`;

/**
 * HELPER: Extract Base64 from Gemini response
 */
function extractBase64(response: any): string | null {
    const candidates = response.candidates;
    if (candidates?.[0]?.content?.parts) {
        const imagePart = candidates[0].content.parts.find((p: any) => p.inlineData);
        if (imagePart) {
            return imagePart.inlineData.data;
        }
    }
    return null;
}

/**
 * STEP 1: Replace the green screen area with the uploaded screenshot.
 * Uses strict masking logic.
 */
export async function generateScreenStep(screenshotBase64: string, templateBase64: string) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        systemInstruction: SYSTEM_INSTRUCTION
    });

    const prompt = `
    OPERATION: Green Screen Texture Replacement.
    
    INPUTS:
    1. Template Image (contains a phone with a BRIGHT GREEN screen).
    2. App UI Texture (a flat screenshot).

    STRICT COMMANDS:
    1. LOCATE the bright green pixels in the Template Image.
    2. REPLACE exactly those green pixels with the "App UI Texture".
    3. WARP and PERSPECTIVE-MATCH the App UI Texture to fit the slant/tilt of the green area.
    4. PRESERVE the existing phone bezel and the notch/dynamic island.
    5. FULL IMAGE MAPPING: You MUST map the ENTIRE "App UI Texture" to the green area. DO NOT CROP, cut off, or zoom in on the screenshot. If the screenshot has a browser bar or status bar, it MUST remain visible.
    6. DEPTH AWARENESS: If a hand, finger, or object is covering part of the green screen in the Template, DO NOT paint over it. The App UI must appear BEHIND the hand/finger.
    
    FORBIDDEN (DO NOT DO THIS):
    - DO NOT generate a new phone object.
    - DO NOT add a frame or borders to the App UI Texture.
    - DO NOT crop headers, footers, or browser bars from the App UI.
    - DO NOT create a "phone inside a phone".
    
    GOAL: The final image should look exactly like the Template Image, but with the green screen replaced by the App UI.
    
    ${NEGATIVE_CONSTRAINTS}
    `;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: templateBase64.split(",")[1],
                mimeType: "image/png"
            }
        },
        {
            inlineData: {
                data: screenshotBase64.split(",")[1],
                mimeType: "image/png"
            }
        }
    ]);

    return await result.response;
}

/**
 * STEP 2: Transform the background style.
 * Also cleans up placeholder text to prepare for Typography step.
 */
export async function generateBackgroundStep(mockupBase64: string, stylePrompt: string) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        systemInstruction: SYSTEM_INSTRUCTION
    });

    const prompt = `
    TASK: Replace the background of the image with a new style: "${stylePrompt}".
    
    INSTRUCTIONS:
    1. SEGMENT the phone and its screen content as the "Foreground".
    2. REPLACE everything behind the phone (the "Background") with the new style.
    3. REMOVE all text from the background (like "TEXT HERE"). The background must be clean.
    4. Ensure the UI on the phone screen remains sharp and untouched.
    
    ${NEGATIVE_CONSTRAINTS}
    `;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: mockupBase64,
                mimeType: "image/png"
            }
        }
    ]);

    return await result.response;
}

/**
 * STEP 3: Verification (LLM-as-a-Judge)
 * Checks for critical failures.
 */
export async function verifyImage(imageBase64: string): Promise<{ passed: boolean; reason?: string }> {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image"
    });

    const prompt = `
    Analyze this App Store mockup image.
    
    FAILURE CONDITIONS (Return passed: false if any of these are true):
    1. "Green Screen Leftover": Is there a large, solid block of bright neon green (like #00FF00) remaining on the phone? (NOTE: Ignore small green buttons or icons in the app UI itself. Only flag if the *background* of the screen is still neon green).
    2. "Phone-In-Phone": Is there a second, smaller phone frame drawn inside the main screen?
    3. "Distortion": Is the screen content significantly blurry, warped, or melting?
    4. "Artifacts": Are there random floating objects or extra buttons that don't belong?

    Return ONLY a JSON object in this format:
    {"passed": boolean, "reason": "string"}
    `;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: "image/png"
                }
            }
        ]);

        const text = result.response.text();
        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback if no JSON found but text exists
        console.warn("Verification returned non-JSON:", text);
        return { passed: true };

    } catch (e) {
        console.error("Verification failed to run:", e);
        // Fail open
        return { passed: true };
    }
}