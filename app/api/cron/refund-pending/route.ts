import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * CRON JOB: Refund stale PENDING transactions.
 * Run this periodically (e.g., every 10 mins) via Vercel Cron or similar.
 */
export async function GET(req: Request) {
    // 1. Security Check (Required: check for a CRON_SECRET header)
    const authHeader = req.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    // FAIL CLOSED: If secret is not set, or header doesn't match, reject.
    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        // 2. Find stale PENDING transactions
        const staleTransactions = await prisma.creditTransaction.findMany({
            where: {
                status: "PENDING",
                createdAt: { lt: tenMinutesAgo }
            },
            include: { user: true }
        });

        if (staleTransactions.length === 0) {
            return NextResponse.json({ message: "No stale transactions found" });
        }

        console.log(`Cleaning up ${staleTransactions.length} stale transactions...`);

        let refundedCount = 0;

        // 3. Process each (Atomically refund and mark failed)
        for (const tx of staleTransactions) {
            try {
                await prisma.$transaction(async (db: Prisma.TransactionClient) => {
                    // Double check status in case of race condition
                    const currentTx = await db.creditTransaction.findUnique({
                        where: { id: tx.id }
                    });

                    if (currentTx?.status !== "PENDING") return;

                    // Refund user
                    await db.user.update({
                        where: { id: tx.userId },
                        data: { credits: { decrement: tx.amount } }
                    });

                    // Mark as FAILED (or could be 'EXPIRED')
                    await db.creditTransaction.update({
                        where: { id: tx.id },
                        data: { status: "FAILED" }
                    });
                });
                refundedCount++;
            } catch (err) {
                console.error(`Failed to refund transaction ${tx.id}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            refunded: refundedCount,
            total_stale: staleTransactions.length
        });

    } catch (error: unknown) {
        console.error("Cron Job Error:", error);
        const message = error instanceof Error ? error.message : "Cron job failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}