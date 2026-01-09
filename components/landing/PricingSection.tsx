"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

export const PricingSection: React.FC = () => {
    const [isLoading, setIsLoading] = React.useState<string | null>(null);

    const handleCheckout = async (plan: "starter" | "pro") => {
        console.log("handleCheckout called with plan:", plan); // Debug log
        setIsLoading(plan);
        try {
            console.log("Sending network request..."); // Debug log
            const res = await fetch("/api/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });

            if (res.status === 401) {
                window.location.href = "/login?callbackUrl=/"; // Redirect to login if unauthorized
                return;
            }

            const data = await res.json();

            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Failed to initiate checkout. Check console for details.");
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <section id="pricing" className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                        Simple Pricing
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        Pay once, use forever. No subscriptions, no hidden fees.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Starter Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col hover:border-zinc-700 transition-all group"
                    >
                        <div className="mb-8">
                            <h4 className="text-zinc-400 font-bold uppercase tracking-wider text-xs mb-1">Starter</h4>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">$10</span>
                                <span className="text-zinc-500 text-sm">one-time</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                            <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                10 Generation Credits
                            </li>
                            <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                Full Feature Access
                            </li>
                            <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                Lifetime Assets
                            </li>
                        </ul>
                        <button
                            onClick={() => handleCheckout("starter")}
                            disabled={isLoading !== null}
                            className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all active:scale-95 text-center block disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading === "starter" ? "Loading..." : "Buy Now"}
                        </button>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-blue-500/40 transition-all"
                    >
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                            Best Value
                        </div>
                        <div className="mb-8">
                            <h4 className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-1">Professional</h4>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">$50</span>
                                <span className="text-zinc-500 text-sm">one-time</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                            <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                <span className="font-bold text-white">70 Generation Credits</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                Full Feature Access
                            </li>
                            <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Check size={12} className="text-blue-500" strokeWidth={3} />
                                </div>
                                Lifetime Assets
                            </li>
                        </ul>
                        <button
                            onClick={() => handleCheckout("pro")}
                            disabled={isLoading !== null}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-500 transition-all active:scale-95 text-center block disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading === "pro" ? "Loading..." : "Buy Now"}
                        </button>
                    </motion.div>
                </div>

                {/* Free Credits Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full">
                        <Zap size={14} className="text-yellow-500" />
                        <span className="text-sm text-zinc-400">
                            New accounts get <span className="text-white font-bold">3 free credits</span> to try
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
