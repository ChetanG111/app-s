import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface TopNavProps {
    projectName: string;
    setProjectName: (name: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ projectName, setProjectName }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="absolute top-6 left-6 z-40 flex items-center gap-2 pointer-events-auto">
            <div className={`
        flex items-center h-12 bg-[#0c0c0c]/90 backdrop-blur-2xl border rounded-2xl px-5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300
        ${isFocused ? 'border-white/20 ring-1 ring-white/10' : 'border-white/5 hover:border-white/10'}
      `}>
                {/* Logo/Icon Area */}
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-4 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 to-zinc-900 opacity-50" />
                        <div className="w-4 h-4 bg-white/20 rounded-full blur-[2px]" />
                    </div>

                    <span className="text-white font-bold tracking-tight text-sm">shots88</span>
                </div>

                {/* Divider */}
                <div className="h-4 w-[1px] bg-zinc-800 mx-4" />

                {/* Project Name Editable Area */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`
              bg-transparent text-sm font-medium outline-none border-none transition-all duration-200 w-32 md:w-48 placeholder:text-zinc-700
              ${isFocused ? 'text-white translate-x-1' : 'text-zinc-400'}
            `}
                        placeholder="Untitled Project"
                    />

                    <button
                        aria-label="More options"
                        className={`
            transition-colors duration-200
            ${isFocused ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-400'}
          `}>
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
