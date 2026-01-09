import { NextResponse } from "next/server";
import { dodoClient } from "@/lib/dodo";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        // We verify the user is logged in, but we rely on Dodo's response for the credibility of the purchase.
        // The user ID should match what's in the metadata of the purchase to prevent unrelated claims.
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        // Dodo might send various params. We check for session_id or payment_id.
        const { session_id, payment_id } = body;

        console.log("Verifying payment with params:", body);

        let metadata;
        let amount;
        let providerId;

        // Strategy 1: Check Checkout Session
        if (session_id) {
            try {
                const checkoutSession = await dodoClient.checkoutSessions.retrieve(session_id);
                // Check if payment is done
                if (checkoutSession.payment_status === 'succeeded' && checkoutSession.payment_id) {
                    providerId = checkoutSession.payment_id;
                    // Now we might need to fetch the payment to get the amount/metadata if not in session
                    // Dodo's CheckoutSessionStatus has payment_id but maybe not full metadata if it was set on payment
                    // But we set metadata on CheckoutSession creation, so it should be there?
                    // The type CheckoutSessionStatus doesn't explicitly show metadata in the interface? 
                    // Let's check the payment object to be sure.
                    const payment = await dodoClient.payments.retrieve(checkoutSession.payment_id);
                    metadata = payment.metadata;
                    amount = payment.total_amount;
                } else {
                    return NextResponse.json({ error: "Payment not successful or pending" }, { status: 400 });
                }
            } catch (err) {
                console.error("Error retrieving checkout session:", err);
            }
        }

        // Strategy 2: Check Payment Directly (if session check failed or only payment_id provided)
        if (!providerId && payment_id) {
            try {
                const payment = await dodoClient.payments.retrieve(payment_id);
                if (payment.status === 'succeeded') {
                    providerId = payment.payment_id;
                    metadata = payment.metadata;
                    amount = payment.total_amount;
                }
            } catch (err) {
                console.error("Error retrieving payment:", err);
            }
        }

        if (!providerId || !amount) {
            return NextResponse.json({ error: "Could not verify payment status with Dodo" }, { status: 400 });
        }

        // Verify Ownership
        // If we attached userId to metadata, we must ensure it matches the current user
        if (metadata?.userId && metadata.userId !== session.user.id) {
            console.error(`User mismatch: Metadata ${metadata.userId} vs Session ${session.user.id}`);
            return NextResponse.json({ error: "This payment belongs to another user" }, { status: 403 });
        }

        // Check if already processed
        // We use the payment_id (providerId) as the unique key
        const existingPurchase = await prisma.purchase.findUnique({
            where: { providerId },
        });

        if (existingPurchase) {
            return NextResponse.json({ success: true, message: "Use existing purchase" });
        }

        // Credit the user
        // Logic duplicated from webhook (extract to service later if needed)
        let creditsToAdd = 0;
        let tier = "STARTER";

        // Check metadata for plan info (more robust)
        if (metadata?.credits) {
            creditsToAdd = parseInt(metadata.credits as string, 10);
        }
        if (metadata?.tier) {
            tier = metadata.tier as string;
        }

        // Fallback to amount logic if metadata is missing (legacy or direct payment without metadata)
        if (creditsToAdd === 0) {
            const amt = Number(amount);
            if (amt === 10 || amt === 1000) {
                creditsToAdd = 10;
                tier = "STARTER";
            } else if (amt === 50 || amt === 5000) {
                creditsToAdd = 70;
                tier = "PRO";
            } else {
                console.warn(`Unknown amount: ${amount} (type: ${typeof amount}), defaulting to 0 credits`);
            }
        }

        if (creditsToAdd > 0) {
            // Update User
            await prisma.user.update({
                where: { id: session.user.id }, // Use session ID here as fallback or metadata ID
                data: {
                    credits: { increment: creditsToAdd },
                    // Upgrade tier if applicable, or just keep track
                    currentTier: tier as any,
                },
            });

            // Record Purchase
            await prisma.purchase.create({
                data: {
                    userId: session.user.id,
                    amount: amount / 100, // storing in dollars if amount is cents
                    creditsAdded: creditsToAdd,
                    tier: tier as any,
                    provider: "DODO",
                    providerId: providerId,
                }
            });

            console.log(`[VERIFY] Added ${creditsToAdd} credits to user ${session.user.id}`);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Verification logic error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
