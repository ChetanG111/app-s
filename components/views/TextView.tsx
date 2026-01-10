import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TextViewProps {
    value: string;
    onChange: (text: string) => void;
    onNext: () => void;
}

export const TextView: React.FC<TextViewProps> = ({ value, onChange, onNext }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const limit = 50;
    const isAtLimit = value.length >= limit;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-white text-5xl font-black mb-auto pt-16 tracking-tight text-center">
                Headline Text
            </h1>

            <div className="w-full max-w-2xl mb-auto flex flex-col items-center px-4">
                <motion.div
                    animate={isAtLimit ? { x: [-1, 2, -2, 2, -2, 0] } : {}}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`
                        relative w-full transition-all duration-500 border-b-2 py-4
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
                        className="w-full bg-transparent text-white text-4xl font-bold text-center outline-none placeholder:text-zinc-800 transition-all duration-300"
                    />

                    <div className={`
                        absolute -bottom-10 right-0 text-sm font-bold transition-colors duration-300
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
                    onClick={onNext}
                    className="mt-16 bg-white text-black px-12 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all active:scale-95"
                >
                    Continue
                </button>

                <p className="text-zinc-500 text-sm mt-16 text-center max-w-md">
                    This text will appear at the top of your generated mockup. Make it punchy and clear.
                </p>
            </div>
        </div>
    );
};
