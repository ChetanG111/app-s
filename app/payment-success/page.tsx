"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying payment...");

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Log all params for debugging
                const params: Record<string, string> = {};
                searchParams.forEach((value, key) => {
                    params[key] = value;
                });
                console.log("Payment return params:", params);

                // Attempt to verify using whatever ID we have
                const res = await fetch("/api/verify-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(params),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setStatus("success");
                    setMessage("Payment successful! Credits added.");
                    // Refresh user session/credits in background if possible, or redirect
                    setTimeout(() => {
                        window.location.href = "/dash"; // Force reload to get fresh session data
                    }, 2000);
                } else {
                    setStatus("error");
                    setMessage(data.error || "Payment verification failed.");
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                setMessage("An error occurred while verifying metadata.");
            }
        };

        if (searchParams.size > 0) {
            verifyPayment();
        } else {
            // No params, maybe they navigated here manually?
            setStatus("error");
            setMessage("No payment information found.");
        }
    }, [searchParams, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 max-w-md w-full shadow-2xl"
            >
                {status === "loading" && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Verifying Payment</h2>
                        <p className="text-zinc-400">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                            <Check size={24} strokeWidth={3} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
                        <p className="text-zinc-400 mb-6">{message}</p>
                        <p className="text-sm text-zinc-500">Redirecting to dashboard...</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Verification Failed</h2>
                        <p className="text-zinc-400 mb-6">{message}</p>
                        <Link
                            href="/dash"
                            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <main className="min-h-screen bg-black flex items-center justify-center">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </main>
    );
}
