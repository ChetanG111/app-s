import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * STEP 1: Replace the green screen area with the uploaded screenshot.
 */
export async function generateScreenStep(screenshotBase64: string, templateBase64: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = `Replace only the bright green screen area on the phone in the first image with the UI from the second screenshot. 
    Keep the phone’s angle, edges, reflections, shadows, and blue background exactly the same. 
    Do not change any other part of the first image; just composite the second image perfectly into the green screen area so it looks like the app is displayed on the phone screen, with clean edges and no distortion`;

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
 * STEP 2: Replace the placeholder text with the user's headline, font, and color.
 */
export async function generateTextStep(mockupBase64: string, headline: string, font: string, color: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    // TEMPORARY PROMPT: User will provide the final version later.
    const prompt = `Take the uploaded image and replace the "TEXT HERE" at the top with this headline: "${headline}".
    Use a ${font} font style and make the text color ${color}.
    Ensure the text is perfectly centered and naturally composited into the image.
    Wrap the text and change the size (if needed) to fit the image but keep padding similar on both sides.
    Don't change the content of the text.
    Keep all other elements, including the phone and background, exactly the same.`;

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
 * STEP 3: Transform the background style.
 */
export async function generateBackgroundStep(mockupBase64: string, stylePrompt: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = `Take the uploaded image and change only the blue background behind the phone. 
    Replace that blue area with a modern vertical gradient that goes from rich near-black at the top to light neutral grey at the bottom. 
    Keep the phone, whatever UI or content is shown on its screen, all reflections, shadows, and edges exactly the same. 
    Do not modify the screen content, phone colors, or composition—only update the background to ${stylePrompt} with no visible banding or artifacts.`;

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
