
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { success } = await rateLimit(`translate:${session.user.id}`, 10, 60);
        if (!success) {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }

        const body = await req.json();
        const { text, targetLanguage } = body;

        if (!text || !targetLanguage) {
            return NextResponse.json({ error: "Missing text or targetLanguage" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            return NextResponse.json({ error: "Translation service unavailable" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const modelsToTry = [
            "gemini-2.5-flash-lite",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        let translatedText = "";
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const prompt = `Translate the following short app headline into ${targetLanguage}. 
                Keep it punchy, short, and natural for an app screenshot. 
                Only return the translated text, nothing else.
                Text: "${text}"`;

                const result = await model.generateContent(prompt);
                translatedText = result.response.text().trim().replace(/^"|"$/g, '');

                if (translatedText) break;
            } catch (err) {
                console.warn(`Failed with model ${modelName}:`, err);
                lastError = err;
            }
        }

        if (!translatedText) {
            throw lastError || new Error("All translation models failed");
        }

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error("Translation Error:", error);
        return NextResponse.json({ error: "Translation failed" }, { status: 500 });
    }
}
