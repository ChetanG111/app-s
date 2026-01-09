import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Manually delete related records that don't have cascade delete
        await prisma.screenshot.deleteMany({ where: { userId } });
        await prisma.purchase.deleteMany({ where: { userId } });

        // Accounts and Sessions have onDelete: Cascade in schema, so they will be handled automatically.
        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Account Error:", error);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}
