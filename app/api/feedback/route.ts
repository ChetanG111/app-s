import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Assuming auth.ts is at root based on file list
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { message, type } = body;

    // Rate Limiting
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const identifier = session?.user?.id ? `feedback-user-${session.user.id}` : `feedback-ip-${ip}`;
    
    // Limit: 3 requests per hour (3600 seconds)
    const { success } = await rateLimit(identifier, 3, 3600);
    
    if (!success) {
        return NextResponse.json(
            { error: "Too many feedback submissions. Please try again later." },
            { status: 429 }
        );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!type || !["BUG", "FEATURE", "OTHER"].includes(type)) {
        return NextResponse.json(
            { error: "Valid type is required" },
            { status: 400 }
        );
    }

    const feedback = await prisma.feedback.create({
      data: {
        message,
        type,
        userId: session?.user?.id || null,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
