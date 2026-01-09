import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { filename } = await params;

        // Prevent directory traversal
        if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
            return new NextResponse("Invalid filename", { status: 400 });
        }

        // Check ownership in DB
        // We search by checking if ANY record exists for this user with this filename in the url
        const screenshot = await prisma.screenshot.findFirst({
            where: {
                userId: session.user.id,
                url: {
                    contains: filename
                }
            }
        });

        if (!screenshot) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Try to find file in private storage first, then public (fallback)
        const privatePath = path.join(process.cwd(), "private", "outputs", filename);
        const publicPath = path.join(process.cwd(), "public", "outputs", filename);

        let fileBuffer: Buffer;
        
        if (existsSync(privatePath)) {
            fileBuffer = await fs.readFile(privatePath);
        } else if (existsSync(publicPath)) {
             // Fallback for old images
            fileBuffer = await fs.readFile(publicPath);
        } else {
             return new NextResponse("File not found on server", { status: 404 });
        }

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "private, max-age=31536000, immutable"
            }
        });

    } catch (error) {
        console.error("Image retrieval error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
