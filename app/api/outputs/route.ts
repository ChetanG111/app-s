import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCachedUserScreenshots } from "@/lib/data";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const files = await getCachedUserScreenshots(session.user.id);

        return NextResponse.json(
            { files },
            {
                headers: {
                    'Cache-Control': 'private, s-maxage=1, stale-while-revalidate=59'
                }
            }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
