import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateStep1(screenshotBase64: string, templateBase64: string) {
    // Reverting to your specific model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = `Combine these two images by putting the 2nd screenshot onto the green layer of the 1st one.`;

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

    const prompt = `Replace the blue screen layer with a ${stylePrompt}. 
    Keep the phone and the screenshot exactly as they are. DO NOT change the phone or the screen content.
    Make it look professional, like an App Store screenshot.`;

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
