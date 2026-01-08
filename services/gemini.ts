import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateStep1(screenshotBase64: string, templateBase64: string) {
    // Reverting to your specific model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = `Replace only the bright green screen area on the phone in the first image with the UI from the second screenshot. Keep the phone’s angle, edges, reflections, shadows, and blue background exactly the same. Do not change any other part of the first image; just composite the second image perfectly into the green screen area so it looks like the app is displayed on the phone screen, with clean edges and no distortion`;

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

export async function generateStep2(mockupBase64: string, stylePrompt: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = `Take the uploaded image and change only the blue background behind the phone. Replace that blue area with a modern vertical gradient that goes from rich near-black at the top to light neutral grey at the bottom. Keep the phone, whatever UI or content is shown on its screen, all reflections, shadows, and edges exactly the same. Do not modify the screen content, phone colors, or composition—only update the background to ${stylePrompt} with no visible banding or artifacts.`;

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
