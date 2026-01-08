import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateMockup(screenshotBase64: string, templateBase64: string) {
    // Initialize the model
    // Using gemini-2.5-flash-image as per user list for fast editing
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = `combine these two images by putting the 2nd screenshot onto the green layer of the 1st one.`;

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

    const response = await result.response;
    // Note: The structure of image return might vary based on specific model behavior 
    // for generation vs text response. In standard Gemini API, you get text.
    // If it's a generation model, it returns image parts.

    return response;
}
