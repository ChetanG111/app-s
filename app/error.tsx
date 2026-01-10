
"use client";

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white p-6">
            <div className="text-center space-y-6 max-w-md mx-auto">
                {/* Abstract graphical element */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                    <div className="relative w-full h-full border border-red-900/30 bg-red-950/10 rounded-2xl flex items-center justify-center -rotate-3 transform transition-transform hover:-rotate-6">
                        <span className="text-4xl font-bold font-mono text-red-500">!</span>
                    </div>
                </div>

                <h1 className="text-5xl font-sans font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
                    Something went wrong!
                </h1>

                <p className="text-zinc-400 text-lg leading-relaxed">
                    We encountered an unexpected error. Please try again.
                </p>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
                    >
                        <RefreshCcw size={18} />
                        Try again
                    </button>
                </div>

                {error.digest && (
                    <p className="text-xs text-zinc-700 font-mono mt-8">Error ID: {error.digest}</p>
                )}
            </div>
        </div>
    );
}
