import React from 'react';
import { Zap, Check } from 'lucide-react';

interface ColorOption {
    id: string;
    label: string;
    colorClass?: string;
    isAI?: boolean;
}

const COLOR_OPTIONS: ColorOption[] = [
    { id: 'ai', label: 'AI Suggestions', isAI: true },
    { id: 'black', label: 'Black', colorClass: 'bg-black border-zinc-700' },
    { id: 'white', label: 'White', colorClass: 'bg-white' },
    { id: 'blue', label: 'Blue', colorClass: 'bg-blue-600' },
];

interface ColorViewProps {
    selected: string;
    onSelect: (id: string) => void;
    onNext: () => void;
}

export const ColorView: React.FC<ColorViewProps> = ({ selected, onSelect, onNext }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-white text-5xl font-black mb-auto pt-16 tracking-tight text-center">
                Headline Color
            </h1>

            <div className="w-full max-w-md mb-auto flex flex-col gap-4 px-4">
                {COLOR_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`
              w-full h-16 rounded-2xl flex items-center justify-between px-8 text-lg font-semibold transition-all duration-300 border-2
              ${selected === option.id
                                ? 'bg-white text-black border-white scale-[1.02]'
                                : 'bg-[#0c0c0c]/80 border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white'
                            }
            `}
                    >
                        <div className="flex items-center gap-4">
                            {option.isAI ? (
                                <Zap size={20} className={selected === option.id ? 'text-blue-600' : 'text-zinc-500'} />
                            ) : (
                                <div className={`w-6 h-6 rounded-full border ${option.colorClass}`} />
                            )}
                            <span>{option.label}</span>
                        </div>
                        {selected === option.id && (
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check size={14} className="text-white" strokeWidth={4} />
                            </div>
                        )}
                    </button>
                ))}



                <p className="text-zinc-500 text-sm mt-12 text-center">
                    Pick a color that pops against your background.
                </p>
            </div>
        </div>
    );
};
