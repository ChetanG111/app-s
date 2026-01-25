import React from 'react';
import { motion } from 'framer-motion';
import { Check, Users, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

interface LanguageOption {
    id: string;
    label: string;
    description: string;
    audience: string;
    flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
    {
        id: 'hindi',
        label: 'Hindi',
        audience: '600M+',
        description: 'Primary language for localized Indian markets.',
        flag: '🇮🇳'
    },
    {
        id: 'spanish',
        label: 'Spanish',
        audience: '530M+',
        description: 'Essential for global social outreach.',
        flag: '🇪🇸'
    },
    {
        id: 'portuguese',
        label: 'Portuguese',
        audience: '260M+',
        description: 'Fastest growing market in Latin America.',
        flag: '🇧🇷'
    },
];

interface TranslateViewProps {
    selected: string | null;
    onSelect: (id: string | null) => void;
    onNext: () => void;
}

export const TranslateView: React.FC<TranslateViewProps> = ({
    selected,
    onSelect,
    onNext
}) => {
    const { trigger } = useHaptic();

    const handleSelect = (id: string) => {
        trigger();
        if (selected === id) {
            onSelect(null);
        } else {
            onSelect(id);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <h1 className="text-white text-3xl sm:text-5xl font-black mb-10 sm:mb-auto pt-48 sm:pt-32 tracking-tight text-center leading-tight">
                Translate Headline
            </h1>

            <div className="w-full max-w-xl mt-0 sm:mt-0 sm:mb-auto flex flex-col gap-3 px-4 pb-20">
                {LANGUAGE_OPTIONS.map((lang, index) => {
                    const isSelected = selected === lang.id;
                    return (
                        <motion.button
                            key={lang.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            onClick={() => handleSelect(lang.id)}
                            className={`
                                relative p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-6 group w-full
                                ${isSelected
                                    ? 'bg-white text-black border-white scale-[1.02] shadow-xl shadow-black/20'
                                    : 'bg-[#0c0c0c]/80 border-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
                                }
                            `}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 transition-colors ${isSelected ? 'bg-zinc-100' : 'bg-white/5'}`}>
                                {lang.flag}
                            </div>

                            <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-xl font-bold truncate ${isSelected ? 'text-black' : 'text-white'}`}>
                                        {lang.label}
                                    </h3>
                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isSelected ? 'bg-black/5 text-black/60' : 'bg-white/5 text-zinc-500'}`}>
                                        <Users size={10} strokeWidth={3} />
                                        {lang.audience}
                                    </div>
                                </div>
                                <p className={`text-xs mt-1 font-medium leading-relaxed truncate w-full ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>
                                    {lang.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <div className="hidden sm:flex flex-col items-end">
                                    <div className="flex items-center gap-1.5">
                                        <Zap size={12} className={`${isSelected ? 'text-blue-600 fill-blue-600' : 'text-blue-400 fill-blue-400'}`} />
                                        <span className={`text-[12px] font-black uppercase tracking-widest ${isSelected ? 'text-black' : 'text-white'}`}>
                                            1
                                        </span>
                                    </div>
                                    <span className={`text-[8px] font-bold uppercase tracking-[0.1em] mt-0.5 ${isSelected ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                        Generation Cost
                                    </span>
                                </div>
                                {isSelected ? (
                                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                        <Check size={16} className="text-white" strokeWidth={4} />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full border border-zinc-800 group-hover:border-zinc-600 transition-colors flex items-center justify-center">
                                        <ChevronRight size={16} className="text-zinc-800 group-hover:text-zinc-600" />
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}

                <p className="text-zinc-500 text-[11px] mt-6 text-center font-medium leading-relaxed flex items-center justify-center gap-2">
                    <Sparkles size={12} className="text-zinc-700" />
                    Targeting large audiences increases app visibility by up to 4x.
                </p>

                {/* Mobile Skip Button only */}
                <div className="sm:hidden mt-6 flex justify-center">
                    <button
                        onClick={() => { trigger(); onNext(); }}
                        className="px-8 py-3 bg-white/5 text-zinc-400 rounded-full text-xs font-bold uppercase tracking-widest"
                    >
                        {selected ? 'Continue' : 'Skip'}
                    </button>
                </div>
            </div>
        </div>
    );
};
