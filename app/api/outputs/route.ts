import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const outputsDir = path.join(process.cwd(), "public", "outputs");

        if (!fs.existsSync(outputsDir)) {
            return NextResponse.json({ files: [] });
        }

        const files = fs.readdirSync(outputsDir)
            .filter(file => file.endsWith(".png"))
            .sort((a, b) => fs.statSync(path.join(outputsDir, b)).mtimeMs - fs.statSync(path.join(outputsDir, a)).mtimeMs)
            .map(file => ({
                name: file,
                url: `/outputs/${file}`,
                createdAt: fs.statSync(path.join(outputsDir, file)).mtime
            }));

        return NextResponse.json({ files });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
