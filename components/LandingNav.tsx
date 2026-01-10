"use client";

import React from 'react';
import { useSession, signIn } from 'next-auth/react';

interface LandingNavProps {
    onScrollTo?: (section: string) => void;
    onDashboardClick?: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({ onScrollTo, onDashboardClick }) => {
    const handleNavClick = (e: React.MouseEvent, section: string) => {
        e.preventDefault();
        onScrollTo?.(section);
    };

    const { data: session } = useSession();

    const handleDashboardClick = () => {
        if (session) {
            onDashboardClick?.();
        } else {
            signIn(undefined, { callbackUrl: '/dash' });
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 p-4">
            <div className="max-w-3xl mx-auto relative group">
                <div className="relative flex items-center justify-between h-14 bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 rounded-full px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    {/* Logo/Icon Area */}
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-3 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                            <div className="absolute inset-0 bg-white/5" />
                            <div className="w-3 h-3 bg-white/20 rounded-full blur-[1px]" />
                        </div>
                        <span className="text-white font-bold tracking-tight text-sm">shots88</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => handleNavClick(e, 'showcase')}
                            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        >
                            Outputs
                        </button>
                        <button
                            onClick={(e) => handleNavClick(e, 'pricing')}
                            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        >
                            Pricing
                        </button>
                        <button
                            onClick={handleDashboardClick}
                            className="ml-2 px-5 py-2 text-sm font-bold text-black bg-white hover:bg-zinc-200 transition-all rounded-xl active:scale-95"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
