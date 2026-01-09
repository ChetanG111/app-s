import { NextResponse } from "next/server";
import { dodoClient } from "@/lib/dodo";
import { auth } from "@/auth";
import { z } from "zod";

const CheckoutSchema = z.object({
    plan: z.enum(["starter", "pro"]),
});

export async function POST(req: Request) {
    console.log("Create Checkout Route Hit");
    console.log("API Key Present:", !!process.env.DODO_PAYMENTS_API_KEY);

    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const parseResult = CheckoutSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const { plan } = parseResult.data;

        const productId =
            plan === "starter"
                ? process.env.DODO_PRODUCT_ID_STARTER
                : process.env.DODO_PRODUCT_ID_PRO;

        if (!productId) {
            console.error("Missing product ID for plan:", plan);
            return NextResponse.json({ error: "Product configuration missing" }, { status: 500 });
        }

        const checkoutSession = await dodoClient.checkoutSessions.create({
            product_cart: [
                {
                    product_id: productId,
                    quantity: 1,
                },
            ],
            return_url: `${new URL(req.url).origin}/payment-success`, // Redirect to success page
            // cancel_url property is not supported in the current (v2.14.2) type definition
            // cancel_url: `${new URL(req.url).origin}/?canceled=true`,
            metadata: {
                userId: session.user.id,
                credits: plan === "starter" ? "10" : "70",
                tier: plan === "starter" ? "STARTER" : "PRO",
            },
        });

        return NextResponse.json({ checkout_url: checkoutSession.checkout_url });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 },
        );
    }
}
