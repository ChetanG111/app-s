import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Palette, Check, ChevronRight } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

interface BackgroundOption {
    id: string;
    label: string;
    colorClass?: string;
    isAI?: boolean;
    isCustom?: boolean;
    description?: string;
}

const BACKGROUND_OPTIONS: BackgroundOption[] = [
    { id: 'charcoal', label: 'Charcoal', colorClass: 'bg-[#151922] border-white/5', description: 'Default. Safest.' },
    { id: 'deep_indigo', label: 'Deep Indigo', colorClass: 'bg-[#0F1430] border-white/10', description: 'Slight color, still premium.' },
    { id: 'dark_slate', label: 'Dark Slate', colorClass: 'bg-[#0E1116] border-white/5' },
    { id: 'custom', label: 'Custom', isCustom: true },
];

interface BackgroundViewProps {
    selected: string;
    onSelect: (id: string) => void;
    customPrompt: string;
    onCustomPromptChange: (val: string) => void;
    generateBackground: boolean;
    onGenerateBackgroundChange: (val: boolean) => void;
    onNext: () => void;
}

export const BackgroundView: React.FC<BackgroundViewProps> = ({
    selected,
    onSelect,
    customPrompt,
    onCustomPromptChange,
    generateBackground,
    onGenerateBackgroundChange,
    onNext
}) => {
    const { trigger } = useHaptic();
    const [isFocused, setIsFocused] = useState(false);
    const isDev = process.env.NODE_ENV === 'development';

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="flex flex-col items-center w-full shrink-0 pt-24 sm:pt-0 mb-8">
                <h1 className="text-white text-3xl sm:text-5xl font-black mb-6 tracking-tight text-center">
                    Background Style
                </h1>

                {/* Dev Mode Toggle - only visible in development */}
                {isDev && (
                    <div
                        onClick={() => onGenerateBackgroundChange(!generateBackground)}
                        className="flex items-center gap-3 bg-[#0c0c0c]/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-2xl cursor-pointer hover:border-white/20 transition-all group"
                    >
                        <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${generateBackground ? 'bg-blue-500' : 'bg-zinc-800'}`}>
                            <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all duration-300 ${generateBackground ? 'left-5' : 'left-1'}`} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
                            Generate AI Background {generateBackground ? '(ON)' : '(OFF)'}
                        </span>
                    </div>
                )}
            </div>

            <div className="w-full max-w-md flex flex-col items-center gap-2.5 px-4 pb-20">
                {BACKGROUND_OPTIONS.map((option, index) => (
                    <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onClick={() => { trigger(); onSelect(option.id); if (option.id !== 'custom') onNext(); }}
                        className={`
                            w-full h-[72px] shrink-0 rounded-2xl flex items-center justify-between px-6 transition-all duration-300 border-2
                            ${selected === option.id
                                ? 'bg-white text-black border-white scale-[1.02]'
                                : 'bg-[#0c0c0c]/80 border-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
                            }
                        `}
                    >
                        <div className={`flex flex-col items-start ${!generateBackground ? 'opacity-30' : ''}`}>
                            <div className="flex items-center gap-4">
                                {option.isAI ? (
                                    <Zap size={20} className={selected === option.id ? 'text-blue-600' : 'text-zinc-500'} />
                                ) : option.isCustom ? (
                                    <Palette size={20} className={selected === option.id ? 'text-indigo-600' : 'text-zinc-500'} />
                                ) : (
                                    <div className={`w-6 h-6 rounded-full border ${option.colorClass}`} />
                                )}
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold leading-tight">{option.label}</span>
                                    {option.description && (
                                        <span className={`text-[11px] font-medium leading-tight mt-1 ${selected === option.id ? 'text-black/60' : 'text-zinc-600'}`}>
                                            {option.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {selected === option.id && generateBackground && (
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check size={14} className="text-white" strokeWidth={4} />
                            </div>
                        )}
                    </motion.button>
                ))}

                {!generateBackground && (
                    <div className="mt-4 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 animate-in fade-in duration-500">
                        <p className="text-zinc-400 text-xs text-center leading-relaxed">
                            <span className="text-blue-400 font-bold uppercase text-[10px] block mb-1">Developer Mode</span>
                            Background generation is disabled. App will only generate the phone mockup on its original template background.
                        </p>
                    </div>
                )}

                {selected === 'custom' && (
                    <div className="mt-4 animate-in slide-in-from-top-4 duration-500 flex flex-col items-center w-full">
                        <div className="flex items-center gap-3 w-full">
                            <motion.div
                                animate={customPrompt.length >= 100 ? { x: [-1, 2, -2, 2, -2, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className={`
                                    relative flex-1 transition-all duration-500 border-b-2 py-2
                                    ${isFocused ? 'border-white' : 'border-zinc-800'}
                                `}
                            >
                                <input
                                    type="text"
                                    value={customPrompt}
                                    onChange={(e) => onCustomPromptChange(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder="Enter custom prompt or hex..."
                                    maxLength={100}
                                    className="w-full bg-transparent text-white text-lg font-medium text-center outline-none placeholder:text-zinc-800 transition-all duration-300"
                                />

                                <div className={`
                                    absolute -bottom-6 right-0 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300
                                    ${customPrompt.length >= 100 ? 'text-red-500' : isFocused ? 'text-zinc-400' : 'text-zinc-700'}
                                `}>
                                    {customPrompt.length} / 100
                                </div>

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



                <p className="text-zinc-500 text-sm mt-6 text-center shrink-0">
                    The background sets the mood for your entire screenshot.
                </p>
            </div>
        </div>
    );
};
