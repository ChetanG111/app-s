import React from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';

interface TranslateViewProps {
    onNext: () => void;
}

export const TranslateView: React.FC<TranslateViewProps> = ({ onNext }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <h1 className="text-white text-3xl sm:text-5xl font-black mb-8 sm:mb-auto pt-32 sm:pt-16 tracking-tight text-center">
                Translate
            </h1>

            <div className="w-full max-w-md mt-0 sm:mt-0 sm:mb-auto flex flex-col items-center justify-center gap-6 px-4 pb-20">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                    <Languages size={40} className="text-white/20" />
                </div>

                <div className="flex flex-col items-center gap-2 text-center">
                    <h2 className="text-xl font-bold text-white">Coming Soon</h2>
                    <p className="text-zinc-500 text-sm max-w-[280px]">
                        We're working on a feature to automatically translate your mockup text into multiple languages.
                    </p>
                </div>

                <button
                    onClick={onNext}
                    className="mt-4 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-semibold border border-white/10 transition-all active:scale-95"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
};
