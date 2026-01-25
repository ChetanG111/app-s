import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

interface FontOption {
    id: string;
    label: string;
    className: string;
}

const FONT_OPTIONS: FontOption[] = [
    { id: 'standard', label: 'Inter (Bold)', className: 'font-sans font-bold' },
    { id: 'handwritten', label: 'Caveat (Brush)', className: 'font-handwriting font-bold text-2xl' },
    { id: 'modern', label: 'Poppins (Bold)', className: 'font-modern font-bold tracking-wider' },
];

interface FontViewProps {
    selected: string;
    onSelect: (id: string) => void;
    onNext: () => void;
    disabled?: boolean;
}

export const FontView: React.FC<FontViewProps> = ({ selected, onSelect, onNext, disabled = false }) => {
    const { trigger } = useHaptic();

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-20 pb-28 sm:pt-0 sm:pb-0">
            <h1 className="text-white text-3xl sm:text-5xl font-black mb-10 sm:mb-auto pt-48 sm:pt-32 tracking-tight text-center">
                Select Font Style
            </h1>

            <div className="w-full max-w-md flex flex-col gap-4 px-4 sm:mb-auto">
                {FONT_OPTIONS.map((option, index) => (
                    <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onClick={() => { if (!disabled) { trigger(); onSelect(option.id); onNext(); } }}
                        disabled={disabled}
                        className={`
              w-full h-14 sm:h-16 rounded-2xl flex items-center justify-between px-8 text-lg font-semibold transition-all duration-300 border-2
              ${disabled
                                ? 'bg-[#0c0c0c]/40 border-zinc-900/50 text-zinc-600 cursor-not-allowed opacity-50'
                                : selected === option.id
                                    ? 'bg-white text-black border-white scale-[1.02]'
                                    : 'bg-[#0c0c0c]/80 border-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
                            }
            `}
                    >
                        <span className={option.className}>{option.label}</span>
                        {selected === option.id && !disabled && (
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check size={14} className="text-white" strokeWidth={4} />
                            </div>
                        )}
                    </motion.button>
                ))}



                <p className="text-zinc-500 text-sm mt-8 sm:mt-12 text-center">
                    {disabled
                        ? "Enter a headline first to choose a font."
                        : "Choose a font that matches your app's brand identity."
                    }
                </p>
            </div>
        </div>
    );
};
