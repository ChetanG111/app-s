import React from 'react';
import { motion } from 'framer-motion';
import { Check, Users, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

interface LanguageOption {
    id: string;
    label: string;
    audience: string;
    flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
    {
        id: 'english',
        label: 'English',
        audience: '1.5B+',
        flag: '🇺🇸'
    },
    {
        id: 'french',
        label: 'French',
        audience: '300M+',
        flag: '🇫🇷'
    },
    {
        id: 'german',
        label: 'German',
        audience: '130M+',
        flag: '🇩🇪'
    },
    {
        id: 'spanish',
        label: 'Spanish',
        audience: '530M+',
        flag: '🇪🇸'
    },
    {
        id: 'portuguese',
        label: 'Portuguese',
        audience: '260M+',
        flag: '🇧🇷'
    },
];

interface TranslateViewProps {
    selectedLanguages: string[];
    onSelectLanguages: (languages: string[]) => void;
    onNext: () => void;
    disabled?: boolean;
}

export const TranslateView: React.FC<TranslateViewProps> = ({
    selectedLanguages,
    onSelectLanguages,
    onNext,
    disabled = false
}) => {
    const { trigger } = useHaptic();

    const handleToggle = (id: string) => {
        if (disabled) return;
        trigger();

        if (selectedLanguages.includes(id)) {
            // Don't allow deselecting if it's the last one
            if (selectedLanguages.length === 1) return;
            onSelectLanguages(selectedLanguages.filter(lang => lang !== id));
        } else {
            onSelectLanguages([...selectedLanguages, id]);
        }
    };

    const creditCost = selectedLanguages.length;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <h1 className="text-white text-3xl sm:text-5xl font-black mb-10 sm:mb-auto pt-48 sm:pt-32 tracking-tight text-center leading-tight">
                Select Languages
            </h1>

            <div className="w-full max-w-lg mt-0 sm:mt-0 sm:mb-auto flex flex-col gap-2 px-4 pb-20">
                {LANGUAGE_OPTIONS.map((lang, index) => {
                    const isSelected = selectedLanguages.includes(lang.id);
                    return (
                        <motion.button
                            key={lang.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            onClick={() => handleToggle(lang.id)}
                            className={`
                                relative p-3.5 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 group w-full
                                ${disabled
                                    ? 'bg-[#0c0c0c]/40 border-zinc-900/50 text-zinc-600 cursor-not-allowed opacity-50'
                                    : isSelected
                                        ? 'bg-white text-black border-white scale-[1.01] shadow-lg shadow-black/20'
                                        : 'bg-[#0c0c0c]/80 border-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
                                }
                            `}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 transition-colors ${isSelected ? 'bg-zinc-100' : 'bg-white/5'}`}>
                                {lang.flag}
                            </div>

                            <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-base font-bold truncate ${isSelected ? 'text-black' : 'text-white'}`}>
                                        {lang.label}
                                    </h3>
                                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isSelected ? 'bg-black/5 text-black/60' : 'bg-white/5 text-zinc-500'}`}>
                                        <Users size={8} strokeWidth={3} />
                                        {lang.audience}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <div className="hidden sm:flex flex-col items-end">
                                    <div className="flex items-center gap-1">
                                        <Zap size={10} className={`${isSelected ? 'text-blue-600 fill-blue-600' : 'text-blue-400 fill-blue-400'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-black' : 'text-white'}`}>
                                            1
                                        </span>
                                    </div>
                                    <span className={`text-[7px] font-bold uppercase tracking-[0.1em] mt-0.5 ${isSelected ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                        Credit Cost
                                    </span>
                                </div>
                                {isSelected ? (
                                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                        <Check size={12} className="text-white" strokeWidth={4} />
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-full border border-zinc-800 group-hover:border-zinc-600 transition-colors flex items-center justify-center">
                                        <ChevronRight size={12} className="text-zinc-800 group-hover:text-zinc-600" />
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}

                {/* Total Cost Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-3xl bg-[#0c0c0c]/80 border border-white/5 flex items-center justify-between"
                >
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
                        </span>
                        <p className="text-[10px] text-zinc-500 font-medium">
                            Each language generates a separate screenshot.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                                <Zap size={14} className="text-blue-400 fill-blue-400" />
                                <span className="text-lg font-black text-white">{creditCost}</span>
                            </div>
                            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">Total Credits</span>
                        </div>
                    </div>
                </motion.div>

                <p className="text-zinc-500 text-[11px] mt-6 text-center font-medium leading-relaxed flex items-center justify-center gap-2">
                    <Sparkles size={12} className="text-zinc-700" />
                    {disabled
                        ? "Enter a headline first to enable translation options."
                        : "Targeting large audiences increases app visibility by up to 4x."
                    }
                </p>

                {/* Mobile Continue Button */}
                <div className="sm:hidden mt-6 flex justify-center">
                    <button
                        onClick={() => { trigger(); onNext(); }}
                        disabled={disabled || selectedLanguages.length === 0}
                        className={`
                            px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2
                            ${disabled || selectedLanguages.length === 0
                                ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                                : 'bg-white text-black'
                            }
                        `}
                    >
                        Continue
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-black/10 rounded-full">
                            <Zap size={10} className="text-blue-600 fill-blue-600" />
                            {creditCost}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
