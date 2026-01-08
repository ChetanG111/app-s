import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { filenames } = await req.json();

        if (!filenames || !Array.isArray(filenames)) {
            return NextResponse.json({ error: "Filenames array is required" }, { status: 400 });
        }

        const outputsDir = path.join(process.cwd(), "public", "outputs");

        filenames.forEach(filename => {
            const filePath = path.join(outputsDir, filename.replace('/outputs/', ''));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
