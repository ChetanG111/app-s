import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

interface TextViewProps {
    value: string;
    onChange: (text: string) => void;
    onNext: () => void;
    generateText?: boolean;
    onGenerateTextChange?: (val: boolean) => void;
}

export const TextView: React.FC<TextViewProps> = ({
    value,
    onChange,
    onNext,
    generateText = true,
    onGenerateTextChange
}) => {
    const { trigger } = useHaptic();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const limit = 50;
    const isAtLimit = value.length >= limit;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-20 pb-28 sm:pt-0 sm:pb-0">
            <h1 className="text-white text-3xl sm:text-5xl font-black mb-10 sm:mb-auto pt-48 sm:pt-32 tracking-tight text-center">
                Headline Text
            </h1>

            <div className="w-full max-w-2xl flex flex-col items-center px-4 sm:mb-auto">
                <div className="flex items-center gap-3 w-full">
                    <motion.div
                        animate={isAtLimit ? { x: [-1, 2, -2, 2, -2, 0] } : {}}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className={`
                            relative flex-1 transition-all duration-500 border-b-2 py-4
                            ${isFocused ? 'border-white' : 'border-zinc-800'}
                        `}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Enter your headline here..."
                            maxLength={limit}
                            className="w-full bg-transparent text-white text-2xl sm:text-4xl font-bold text-center outline-none placeholder:text-zinc-800 transition-all duration-300"
                        />

                        <div className={`
                            absolute -bottom-8 sm:-bottom-10 right-0 text-xs sm:text-sm font-bold transition-colors duration-300
                            ${isAtLimit ? 'text-red-500' : isFocused ? 'text-zinc-400' : 'text-zinc-600'}
                        `}>
                            {value.length} / {limit}
                        </div>

                        <div className={`
                            absolute inset-x-0 -bottom-[2px] h-[2px] bg-white transition-opacity duration-500
                            ${isFocused ? 'opacity-100' : 'opacity-0'}
                        `} />
                    </motion.div>

                    <button
                        onClick={() => { trigger(); onNext(); }}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shrink-0 hover:bg-zinc-200 active:scale-95 transition-all shadow-lg"
                    >
                        <ChevronRight size={20} className="text-black" strokeWidth={3} />
                    </button>
                </div>



                <p className="text-zinc-500 text-sm mt-12 sm:mt-16 text-center max-w-md">
                    This text will appear at the top of your generated mockup. Make it punchy and clear.
                </p>

                {onGenerateTextChange && (
                    <div className="mt-12 flex flex-col items-center p-4 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Dev Tool</span>
                            <div className="h-px w-12 bg-zinc-800" />
                            <button
                                onClick={() => { trigger(); onGenerateTextChange(!generateText); }}
                                className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all duration-300 ${generateText ? 'border-zinc-800 text-zinc-400 bg-transparent' : 'border-red-900/50 bg-red-950/20 text-red-400'}`}
                            >
                                <span className="text-sm font-bold">{generateText ? 'Text Rendering Active' : 'Text Rendering Skipped'}</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${generateText ? 'bg-zinc-800' : 'bg-red-500'}`}>
                                    <motion.div
                                        animate={{ x: generateText ? 2 : 18 }}
                                        className="absolute top-1 w-2 h-2 bg-white rounded-full"
                                    />
                                </div>
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-700 mt-2 font-medium tracking-tight">Allows testing image styles without waiting for typography processing.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
