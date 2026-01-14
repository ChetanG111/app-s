import { NextResponse } from "next/server";
import { dodoClient } from "@/lib/dodo";
import prisma from "@/lib/prisma";
import { Tier } from "@prisma/client";

export async function POST(req: Request) {
    try {
        // 1. Verify the request is legit (If Dodo provides signature verification, implement here)
        // For now, we'll log the event.
        const event = await req.json();

        console.log("Dodo Webhook Event:", event.type);

        if (event.type === "payment.succeeded") {
            const { data } = event;
            const paymentId = data.payment_id;

            // SECURITY: Verify the payment status with Dodo directly to prevent webhook spoofing
            let verifiedPayment;
            try {
                verifiedPayment = await dodoClient.payments.retrieve(paymentId);
            } catch (err) {
                console.error("Failed to verify payment with Dodo:", err);
                return NextResponse.json({ error: "Verification failed" }, { status: 400 });
            }

            if (verifiedPayment.status !== 'succeeded') {
                console.error(`Payment ${paymentId} is not succeeded (status: ${verifiedPayment.status})`);
                return NextResponse.json({ error: "Payment not succeeded" }, { status: 400 });
            }

            const metadata = verifiedPayment.metadata; // Use valid metadata from source
            const userId = metadata?.userId;

            if (!userId) {
                console.error("No userId found in metadata");
                return NextResponse.json({ error: "No userId found" }, { status: 400 });
            }

            // Determine credits based on amount or product ID
            // Getting amount from the verified payment
            const amount = verifiedPayment.total_amount;

            // Fallback logic if we can't inspect product directly easily from this payload without types:
            // 1000 ($10) -> 10 credits
            // 5000 ($50) -> 70 credits

            let creditsToAdd = 0;
            let tier = "STARTER";

            // Adjust these values based on your actual pricing (e.g. cents)
            // Check metadata first (from create-checkout)
            if (metadata?.credits) {
                creditsToAdd = parseInt(metadata.credits, 10);
            }
            if (metadata?.tier) {
                tier = metadata.tier;
            }

            if (creditsToAdd === 0) {
                const amt = Number(amount);
                if (amt === 10 || amt === 1000) {
                    creditsToAdd = 15;
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
                    where: { id: userId },
                    data: {
                        credits: { increment: creditsToAdd },
                        // Upgrade tier if applicable, or just keep track
                        currentTier: tier as Tier,
                    },
                });

                // Record Purchase
                await prisma.purchase.create({
                    data: {
                        userId,
                        amount: amount / 100, // storing in dollars if amount is cents
                        creditsAdded: creditsToAdd,
                        tier: tier as Tier,
                        provider: "DODO",
                        providerId: verifiedPayment.payment_id || paymentId,
                    }
                });

                console.log(`Added ${creditsToAdd} credits to user ${userId}`);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 },
        );
    }
}