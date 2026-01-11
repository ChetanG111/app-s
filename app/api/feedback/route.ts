import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Assuming auth.ts is at root based on file list
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { message, type } = body;

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
