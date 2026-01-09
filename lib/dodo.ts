import DodoPayments from "dodopayments";

export const dodoClient = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY, // set in .env
    environment: "test_mode", // Defaults to live, setting to test_mode for development
});

if (!process.env.DODO_PAYMENTS_API_KEY) {
    console.warn("⚠️ DODO_PAYMENTS_API_KEY is missing in environment variables. Checkout will fail.");
}
