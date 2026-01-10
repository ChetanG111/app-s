"use client";

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingNav } from '@/components/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { PricingSection } from '@/components/landing/PricingSection';

import { useSession, signIn } from 'next-auth/react';

export default function LandingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const showcaseRef = useRef<HTMLDivElement>(null);
    const pricingRef = useRef<HTMLDivElement>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    const handleScrollTo = (section: string) => {
        if (section === 'showcase' && showcaseRef.current) {
            showcaseRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (section === 'pricing' && pricingRef.current) {
            pricingRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleStartCreating = () => {
        if (session) {
            setIsNavigating(true);
            router.push('/dash');
        } else {
            signIn(undefined, { callbackUrl: '/dash' });
        }
    };

    // Full-screen loading overlay while navigating
    if (isNavigating) {
        return (
            <div className="fixed inset-0 bg-[#050505] z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="relative min-h-screen text-white overflow-x-hidden">
            <LandingNav onScrollTo={handleScrollTo} onDashboardClick={handleStartCreating} />

            <HeroSection onStartCreating={handleStartCreating} />

            <div ref={showcaseRef}>
                <ShowcaseSection />
            </div>

            <div ref={pricingRef}>
                <PricingSection />
            </div>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-zinc-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative w-6 h-3 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                            <div className="w-3 h-3 bg-white/20 rounded-full blur-[1px]" />
                        </div>
                        <span className="text-zinc-500 text-sm font-medium">shots88</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-zinc-600">
                        <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
                        <span>© 2026 shots88. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}