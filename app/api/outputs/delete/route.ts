import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { auth } from "@/auth";
import prisma, { withRetry } from "@/lib/prisma";
import { Screenshot } from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { filenames } = await req.json();

        if (!filenames || !Array.isArray(filenames)) {
            return NextResponse.json({ error: "Filenames array is required" }, { status: 400 });
        }

        const privateDir = path.join(process.cwd(), "private", "outputs");
        const publicDir = path.join(process.cwd(), "public", "outputs");

        const deletedFiles: string[] = [];

        for (const filename of filenames) {
            // Secure filename
            const safeFilename = path.basename(filename);

            // Find record belonging to user
            const screenshot = await withRetry<Screenshot | null>(() => prisma.screenshot.findFirst({
                where: {
                    userId: session.user!.id,
                    url: {
                        contains: safeFilename
                    }
                }
            }));

            if (screenshot) {
                // Delete from DB
                await withRetry(() => prisma.screenshot.delete({
                    where: { id: screenshot.id }
                }));

                // Delete from Private
                const privatePath = path.join(privateDir, safeFilename);
                if (existsSync(privatePath)) {
                    await fs.unlink(privatePath);
                }

                // Delete from Public (Legacy cleanup)
                const publicPath = path.join(publicDir, safeFilename);
                if (existsSync(publicPath)) {
                    await fs.unlink(publicPath);
                }

                deletedFiles.push(safeFilename);
            }
        }

        return NextResponse.json({ success: true, deleted: deletedFiles });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Delete error:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}