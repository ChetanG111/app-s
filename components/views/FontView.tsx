import React from 'react';
import { Check } from 'lucide-react';

interface FontOption {
    id: string;
    label: string;
    className: string;
}

const FONT_OPTIONS: FontOption[] = [
    { id: 'standard', label: 'Standard Sans', className: 'font-sans' },
    { id: 'handwritten', label: 'Handwritten', className: 'font-serif italic' },
    { id: 'modern', label: 'Modern Geometric', className: 'font-mono uppercase tracking-widest' },
];

interface FontViewProps {
    selectedFont: string;
    onSelect: (id: string) => void;
}

export const FontView: React.FC<FontViewProps> = ({ selectedFont, onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-white text-5xl font-black mb-auto pt-16 tracking-tight text-center">
                Select Font Style
            </h1>

            <div className="w-full max-w-md mb-auto flex flex-col gap-4 px-4">
                {FONT_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`
              w-full h-16 rounded-2xl flex items-center justify-between px-8 text-lg font-semibold transition-all duration-300 border-2
              ${selectedFont === option.id
                                ? 'bg-white text-black border-white scale-[1.02]'
                                : 'bg-[#0c0c0c]/80 border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white'
                            }
            `}
                    >
                        <span className={option.className}>{option.label}</span>
                        {selectedFont === option.id && (
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check size={14} className="text-white" strokeWidth={4} />
                            </div>
                        )}
                    </button>
                ))}

                <p className="text-zinc-500 text-sm mt-12 text-center">
                    Choose a font that matches your app&apos;s brand identity.
                </p>
            </div>
        </div>
    );
};
