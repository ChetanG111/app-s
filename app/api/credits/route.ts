import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "credits.json");

export async function GET() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf-8");
        const json = JSON.parse(data);
        return NextResponse.json({ credits: json.credits });
    } catch (error) {
        console.error("Failed to read credits:", error);
        return NextResponse.json({ credits: 0 }, { status: 500 });
    }
}
