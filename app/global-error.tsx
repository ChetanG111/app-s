"use client";

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { Inter, Caveat, Poppins } from "next/font/google"; // Need fonts here too as we replace root layout
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const caveat = Caveat({ subsets: ["latin"], variable: '--font-caveat' });
const poppins = Poppins({ weight: ['400', '600', '700'], subsets: ["latin"], variable: '--font-poppins' });

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
            <body className={`${inter.variable} ${caveat.variable} ${poppins.variable} font-sans antialiased bg-[#050505] text-white`}>
                <div className="flex min-h-screen flex-col items-center justify-center p-6">
                    <div className="text-center space-y-6 max-w-md mx-auto">
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                            <div className="relative w-full h-full border border-red-900/30 bg-red-950/10 rounded-2xl flex items-center justify-center">
                                <span className="text-4xl font-bold font-mono text-red-500">500</span>
                            </div>
                        </div>

                        <h1 className="text-4xl font-sans font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
                            System Error
                        </h1>

                        <p className="text-zinc-400 text-lg leading-relaxed">
                            A critical system error prevented this page from loading.
                        </p>

                        <div className="pt-8">
                            <button
                                onClick={() => reset()}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
                            >
                                <RefreshCcw size={18} />
                                Restart Application
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
