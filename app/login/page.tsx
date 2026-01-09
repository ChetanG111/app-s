"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Chrome, Lock, Sparkles } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function LoginPageContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login submitted:", { email, password });
    };

    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const callbackUrl = searchParams.get('callbackUrl') || "/dash";

    useEffect(() => {
        if (session) {
            router.push(callbackUrl);
        }
    }, [session, router, callbackUrl]);

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl });
    };

    const isReady = email.length > 0 && password.length > 0;

    return (
        <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-[#050505] text-white">
            {/* Global Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Floating Card Container */}
            <div className="relative z-10 w-full max-w-[440px] p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0c0c0c]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
                >
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 mb-8 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <Sparkles size={14} className="text-white" />
                                <span className="font-bold tracking-tight text-[11px] tracking-[0.2em] text-zinc-400">shots88</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white mb-3">
                                Welcome back
                            </h1>
                            <p className="text-zinc-500 text-sm font-medium">
                                Log in to continue your creative workflow.
                            </p>
                        </div>

                        {/* Social Login */}
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-3 bg-white text-black h-13 py-3.5 rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] mb-5 group"
                        >
                            <Chrome size={20} className="text-black" />
                            <span>
                                Sign in with Google
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center gap-4 mb-5">
                            <div className="h-[1px] bg-white/5 flex-1" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                                Or continue with
                            </span>
                            <div className="h-[1px] bg-white/5 flex-1" />
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-12 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-12 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className={`
                                    w-full h-14 rounded-2xl font-black text-sm transition-all mt-4 flex items-center justify-center gap-3 group
                                    ${isReady
                                        ? 'bg-white text-black hover:bg-zinc-200 active:scale-[0.98]'
                                        : 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-not-allowed'
                                    }
                                `}
                            >
                                Sign In
                                <ArrowRight size={18} className={`transition-transform ${isReady ? 'group-hover:translate-x-1' : ''}`} />
                            </button>
                        </form>
                    </div>

                    {/* Footer / Toggle */}
                    <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 text-center">
                        <p className="text-sm text-zinc-500">
                            Don&apos;t have an account? <Link href="/signup" className="text-white font-bold hover:underline decoration-zinc-700 underline-offset-4 ml-1 transition-colors">Sign up</Link>
                        </p>
                    </div>
                </motion.div>

                {/* Back Link */}
                <div className="mt-10 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-white transition-all uppercase tracking-[0.2em] group">
                        <div className="w-4 h-[1px] bg-zinc-800 group-hover:bg-white transition-colors" />
                        Back to Editor
                        <div className="w-4 h-[1px] bg-zinc-800 group-hover:bg-white transition-colors" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    );
}
