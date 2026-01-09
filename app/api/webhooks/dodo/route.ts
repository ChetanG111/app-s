import { NextResponse } from "next/server";
import { dodoClient } from "@/lib/dodo";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        // 1. Verify the request is legit (If Dodo provides signature verification, implement here)
        // For now, we'll log the event.
        const event = await req.json();

        console.log("Dodo Webhook Event:", event.type);

        if (event.type === "payment.succeeded") {
            const { data } = event;
            const metadata = data.metadata;
            const userId = metadata?.userId;

            if (!userId) {
                console.error("No userId found in metadata");
                return NextResponse.json({ error: "No userId found" }, { status: 400 });
            }

            // Determine credits based on amount or product ID
            // Ideally check product_cart, but simplified here:
            // This assumes we can get the amount from the payment object
            // Dodo's payload structure needs to be verified. 
            // Assuming data contains payment info similar to what we set up.

            // Getting amount from the first item if possible, or total amount
            const amount = data.total_amount; // Verify this field name in Dodo docs

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
                    where: { id: userId },
                    data: {
                        credits: { increment: creditsToAdd },
                        // Upgrade tier if applicable, or just keep track
                        currentTier: tier as any,
                    },
                });

                // Record Purchase
                await prisma.purchase.create({
                    data: {
                        userId,
                        amount: amount / 100, // storing in dollars if amount is cents
                        creditsAdded: creditsToAdd,
                        tier: tier as any,
                        provider: "DODO",
                        providerId: data.payment_id || "unknown",
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
