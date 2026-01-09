import DodoPayments from "dodopayments";

export const dodoClient = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY, // set in .env
    environment: (process.env.DODO_PAYMENTS_MODE as "test_mode" | "live_mode") || "test_mode",
});

if (!process.env.DODO_PAYMENTS_API_KEY) {
    console.warn("⚠️ DODO_PAYMENTS_API_KEY is missing in environment variables. Checkout will fail.");
}
