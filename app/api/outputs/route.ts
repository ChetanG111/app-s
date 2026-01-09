import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const screenshots = await prisma.screenshot.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const files = screenshots.map(s => ({
            name: s.url.split('/').pop() || s.id, // Extract filename from URL
            url: s.url,
            createdAt: s.createdAt
        }));

        return NextResponse.json({ files });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}