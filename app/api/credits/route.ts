import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCachedUserCredits } from "@/lib/data";

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ credits: 0 });
        }

        const credits = await getCachedUserCredits(session.user.id);

        return NextResponse.json(
            { credits },
            {
                headers: {
                    'Cache-Control': 'private, s-maxage=1, stale-while-revalidate=59'
                }
            }
        );
    } catch (error) {
        console.error("Failed to fetch credits:", error);
        return NextResponse.json({ credits: 0 }, { status: 500 });
    }
}
