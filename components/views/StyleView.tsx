import React, { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { isImageLoaded, markImageLoaded } from '@/lib/imageCache';

const LAYOUT_STYLES = [
    { id: 'Basic', name: 'Basic', image: '/previews/Basic.png' },
    { id: 'Rotated', name: 'Rotated', image: '/previews/Rotated.png' },
    { id: 'Rotated-left-facing', name: 'Rotated Left', image: '/previews/Rotated-left-facing.png' },
];

interface StyleViewProps {
    selected: string;
    onSelect: (id: string) => void;
    onNext: () => void;
}

export const StyleView: React.FC<StyleViewProps> = ({ selected, onSelect, onNext }) => {
    // Track loading state for each image - initialize based on cache
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        LAYOUT_STYLES.forEach(style => {
            // If already loaded in cache, don't show loading state
            initial[style.id] = !isImageLoaded(style.image);
        });
        return initial;
    });

    const handleImageLoad = (styleId: string, imageSrc: string) => {
        markImageLoaded(imageSrc);
        setLoadingStates(prev => ({ ...prev, [styleId]: false }));
    };

    // Also handle errors - hide shimmer even if image fails
    const handleImageError = (styleId: string) => {
        setLoadingStates(prev => ({ ...prev, [styleId]: false }));
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pt-32 sm:pt-16 pb-24">
            <h1 className="text-white text-3xl sm:text-4xl font-black mb-12 tracking-tight text-center">
                Select your layout style
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-12 w-full">
                {LAYOUT_STYLES.map((style) => {
                    const isSelected = selected === style.id;
                    const isLoading = loadingStates[style.id];
                    return (
                        <div
                            key={style.id}
                            onClick={() => { onSelect(style.id); onNext(); }}
                            className={`
                                group relative bg-[#0c0c0c] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 border-2
                                ${isSelected
                                    ? 'border-white scale-100 z-10'
                                    : 'border-zinc-800 scale-[0.98] hover:border-zinc-600 opacity-60 hover:opacity-100'
                                }
                            `}
                        >
                            {/* Loading state - simple background */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-[#0c0c0c] z-10" />
                            )}
                            <Image
                                src={style.image}
                                alt={style.name}
                                width={300}
                                height={520}
                                onLoad={() => handleImageLoad(style.id, style.image)}
                                onError={() => handleImageError(style.id)}
                                className={`h-[260px] sm:h-[520px] w-auto block object-contain transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            />

                            {isSelected && (
                                <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-6 h-6 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in duration-300">
                                    <Check size={14} className="text-black sm:hidden" strokeWidth={4} />
                                    <Check size={22} className="text-black hidden sm:block" strokeWidth={3} />
                                </div>
                            )}

                            {!isSelected && (
                                <div className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-300" />
                            )}

                            <div className={`
                                absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 transition-all duration-300
                                ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            `}>
                                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white whitespace-nowrap">{style.name}</span>
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>
    );
};
