import React from 'react';
import { Check } from 'lucide-react';

const LAYOUT_STYLES = [
    { id: 'Basic', name: 'Basic', image: '/templates/layouts/Basic.png' },
    { id: 'Rotated', name: 'Rotated', image: '/templates/layouts/Rotated.png' },
    { id: 'Rotated-left-facing', name: 'Rotated Left', image: '/templates/layouts/Rotated-left-facing.png' },
];

interface StyleViewProps {
    selectedStyle: string;
    onSelect: (id: string) => void;
}

export const StyleView: React.FC<StyleViewProps> = ({ selectedStyle, onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pt-16 pb-24">
            <h1 className="text-white text-4xl font-black mb-12 tracking-tight text-center">
                Select your layout style
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-12 w-full">
                {LAYOUT_STYLES.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    return (
                        <div
                            key={style.id}
                            onClick={() => onSelect(style.id)}
                            className={`
                                group relative bg-[#0c0c0c] rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 border-2
                                ${isSelected
                                    ? 'border-white scale-100 z-10'
                                    : 'border-zinc-800 scale-[0.98] hover:border-zinc-600 opacity-60 hover:opacity-100'
                                }
                            `}
                        >
                            <img
                                src={style.image}
                                alt={style.name}
                                className="h-[520px] w-auto block object-contain"
                            />

                            {isSelected && (
                                <div className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in duration-300">
                                    <Check size={22} className="text-black" strokeWidth={3} />
                                </div>
                            )}

                            {!isSelected && (
                                <div className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-300" />
                            )}

                            <div className={`
                                absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 transition-all duration-300
                                ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            `}>
                                <span className="text-xs font-bold tracking-widest uppercase text-white whitespace-nowrap">{style.name}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
