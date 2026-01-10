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
        if (imagePart?.inlineData) {
            return imagePart.inlineData.data;
        }
    }
    return null;
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