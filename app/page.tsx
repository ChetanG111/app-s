"use client";

import React, { useRef } from 'react';
import { LandingNav } from '@/components/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { PricingSection } from '@/components/landing/PricingSection';

export default function LandingPage() {
    const showcaseRef = useRef<HTMLDivElement>(null);
    const pricingRef = useRef<HTMLDivElement>(null);

    const handleScrollTo = (section: string) => {
        if (section === 'showcase' && showcaseRef.current) {
            showcaseRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (section === 'pricing' && pricingRef.current) {
            pricingRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <main className="relative min-h-screen text-white overflow-x-hidden">
            <LandingNav onScrollTo={handleScrollTo} />

            <HeroSection onStartCreating={() => handleScrollTo('pricing')} />

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