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
NEGATIVE_CONSTRAINTS: No extra objects, no watermarks, no blurry text, no shadows, no drop shadows,
no skin textures, no realistic human hands, no artifacts on the phone edges, 
no distortion of the UI screenshot, no banding in colors, no text on background.
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
    TASK: Replace ONLY the background area of this image. Style: "${stylePrompt}".
    
    CRITICAL RULES - READ CAREFULLY:
    1. The PHONE DEVICE is UNTOUCHABLE. Do NOT modify, alter, distort, or regenerate the phone in any way.
    2. The SCREEN CONTENT inside the phone is UNTOUCHABLE. Do NOT change any pixels on the phone's display.
    3. ONLY replace the area BEHIND and AROUND the phone (the background/empty space).
    4. Remove any placeholder text like "TEXT HERE" from the background area only.
    5. The phone must remain pixel-perfect - same position, same angle, same appearance.
    6. DO NOT ADD ANY TEXT TO THE BACKGROUND. No labels, no color codes, no hex values, no watermarks, no words of any kind.
    
    The style description is for your reference only - do NOT write it on the image.
    
    Think of it as: Cut out the phone, replace the wallpaper behind it, paste the phone back exactly as it was.
    
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