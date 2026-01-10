
"use client";

import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white p-6">
            <div className="text-center space-y-6 max-w-md mx-auto">
                {/* Abstract graphical element */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                    <div className="relative w-full h-full border border-zinc-800 bg-zinc-900/50 rounded-2xl flex items-center justify-center rotate-3 transform transition-transform hover:rotate-6">
                        <span className="text-4xl font-bold font-mono text-zinc-700">?</span>
                    </div>
                </div>

                <h1 className="text-7xl font-sans font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
                    404
                </h1>

                <h2 className="text-2xl font-bold tracking-tight">Page Not Found</h2>

                <p className="text-zinc-400 text-lg leading-relaxed">
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <div className="pt-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
                    >
                        <MoveLeft size={18} />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
