"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Props {
    onStartCreating: () => void;
}

export const HeroSection: React.FC<Props> = ({ onStartCreating }) => {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-4xl mx-auto"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8"
                >
                    <Sparkles size={14} className="text-blue-400" />
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI-Powered Generation</span>
                </motion.div>

                {/* Main Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 text-center">
                    Stunning, Premium
                    <br />
                    <span>
                        App Store Screenshots
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Transform your app screenshots into stunning promotional graphics.
                    AI-generated backgrounds, custom typography, and professional layouts.
                </p>

                {/* CTA Button */}
                <div className="flex justify-center">
                    <button
                        onClick={onStartCreating}
                        className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-black/20"
                    >
                        Start Creating
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-zinc-700 rounded-full flex items-start justify-center p-2">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1.5 h-1.5 bg-zinc-500 rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
};
