"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Check, Loader2, Bug, Lightbulb, HelpCircle } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FeedbackType = "BUG" | "FEATURE" | "OTHER";

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
    isOpen,
    onClose
}) => {
    const [message, setMessage] = useState("");
    const [type, setType] = useState<FeedbackType>("FEATURE");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message, type }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit feedback");
            }

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setMessage("");
                setType("FEATURE");
            }, 2000);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeIcon = (t: FeedbackType) => {
        switch (t) {
            case "BUG": return <Bug size={18} />;
            case "FEATURE": return <Lightbulb size={18} />;
            case "OTHER": return <HelpCircle size={18} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Subtle background detail */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/5" />

                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4 border border-green-500/20">
                                    <Check size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Thank you!</h3>
                                <p className="text-zinc-400">Your feedback has been received.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-12 h-12 rounded-full bg-white/5 text-white border border-white/10 flex items-center justify-center mb-4">
                                        <MessageSquare size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        Send Feedback
                                    </h3>
                                    <p className="text-zinc-400 text-sm">
                                        Help us improve your experience
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                                        {(["FEATURE", "BUG", "OTHER"] as FeedbackType[]).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setType(t)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                                                    type === t
                                                        ? "bg-white text-black shadow-lg scale-[1.02]"
                                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                                }`}
                                            >
                                                {getTypeIcon(t)}
                                                {t.charAt(0) + t.slice(1).toLowerCase()}
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell us what's on your mind..."
                                            className="w-full h-32 bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 resize-none text-sm transition-all"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-xs text-center">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !message.trim()}
                                        className="w-full h-12 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Feedback"
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-zinc-600 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
