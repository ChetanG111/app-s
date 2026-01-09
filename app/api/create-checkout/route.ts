import { NextResponse } from "next/server";
import { dodoClient } from "@/lib/dodo";
import { auth } from "@/auth";

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

        const { plan } = await req.json(); // "starter" | "pro"

        // TODO: Replace with actual product IDs from Dodo Payments dashboard
        const productId =
            plan === "starter"
                ? "pdt_0NVu1GoDWvrHbmpYnWPqg"
                : "pdt_0NVu1QNqXWuauKyiRtbBD";

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
