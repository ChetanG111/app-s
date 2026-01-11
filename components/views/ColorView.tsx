import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Check, Palette, ChevronRight } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

interface ColorOption {
    id: string;
    label: string;
    colorClass?: string;
    isAI?: boolean;
    isCustom?: boolean;
}

const COLOR_OPTIONS: ColorOption[] = [
    { id: 'ai', label: 'AI Suggestions', isAI: true },
    { id: 'white', label: 'White', colorClass: 'bg-white' },
    { id: 'black', label: 'Black', colorClass: 'bg-black border-zinc-700' },
    { id: 'blue', label: 'Blue', colorClass: 'bg-blue-600' },
    { id: 'custom', label: 'Custom', isCustom: true },
];

interface ColorViewProps {
    selected: string;
    onSelect: (id: string) => void;
    customColor: string;
    onCustomColorChange: (val: string) => void;
    onNext: () => void;
}

export const ColorView: React.FC<ColorViewProps> = ({ 
    selected, 
    onSelect, 
    customColor,
    onCustomColorChange,
    onNext 
}) => {
    const { trigger } = useHaptic();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <h1 className="text-white text-3xl sm:text-5xl font-black mb-8 sm:mb-auto pt-32 sm:pt-16 tracking-tight text-center">
                Headline Color
            </h1>

            <div className="w-full max-w-md mt-0 sm:mt-0 sm:mb-auto flex flex-col gap-2.5 px-4 pb-20">
                {COLOR_OPTIONS.map((option, index) => {
                    const isDisabled = option.isAI;
                    return (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            onClick={() => { trigger(); if (!isDisabled) { onSelect(option.id); if (option.id !== 'custom') onNext(); } }}
                            disabled={isDisabled}
                            className={`
                                w-full h-14 sm:h-16 shrink-0 rounded-2xl flex items-center justify-between px-6 sm:px-8 text-sm sm:text-lg font-semibold transition-all duration-300 border-2
                                ${isDisabled
                                    ? 'bg-[#0c0c0c]/60 border-zinc-700 text-zinc-400 cursor-not-allowed'
                                    : selected === option.id
                                        ? 'bg-white text-black border-white scale-[1.02]'
                                        : 'bg-[#0c0c0c]/80 border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white'
                                }
                            `}
                        >
                            <div className="flex items-center gap-2 sm:gap-4">
                                {option.isAI ? (
                                    <Zap size={20} className={selected === option.id ? 'text-blue-600' : 'text-zinc-500'} />
                                ) : option.isCustom ? (
                                    <Palette size={20} className={selected === option.id ? 'text-indigo-600' : 'text-zinc-500'} />
                                ) : (
                                    <div className={`w-6 h-6 rounded-full border ${option.colorClass}`} />
                                )}
                                <span className="whitespace-nowrap">{option.label}</span>
                                {option.isAI && (
                                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest bg-zinc-800 text-zinc-500 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                        Coming Soon
                                    </span>
                                )}
                            </div>
                            {selected === option.id && !isDisabled && (
                                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                    <Check size={14} className="text-white" strokeWidth={4} />
                                </div>
                            )}
                        </button>
                    );
                })}

                {selected === 'custom' && (
                    <div key="custom-color-input" className="mt-4 animate-in slide-in-from-top-4 duration-500 flex flex-col items-center w-full">
                        <div className="flex items-center gap-3 w-full">
                            <motion.div
                                animate={customColor.length >= 20 ? { x: [-1, 2, -2, 2, -2, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className={`
                                    relative flex-1 transition-all duration-500 border-b-2 py-2
                                    ${isFocused ? 'border-white' : 'border-zinc-800'}
                                `}
                            >
                                <input
                                    type="text"
                                    value={customColor}
                                    onChange={(e) => onCustomColorChange(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder="Enter hex code (e.g. #FF0000)..."
                                    maxLength={20}
                                    className="w-full bg-transparent text-white text-lg font-medium text-center outline-none placeholder:text-zinc-800 transition-all duration-300"
                                />

                                <div className={`
                                    absolute inset-x-0 -bottom-[1px] h-[1px] bg-white transition-opacity duration-500
                                    ${isFocused ? 'opacity-100' : 'opacity-0'}
                                `} />
                            </motion.div>

                            <button
                                onClick={onNext}
                                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 hover:bg-zinc-200 active:scale-95 transition-all shadow-lg"
                            >
                                <ChevronRight size={20} className="text-black" strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}

                <p className="text-zinc-500 text-sm mt-8 sm:mt-12 text-center">
                    Pick a color that pops against your background.
                </p>
            </div>
        </div>
    );
};