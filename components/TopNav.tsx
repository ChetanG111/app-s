import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface TopNavProps {
    projectName: string;
    setProjectName: (name: string) => void;
    credits: number;
}

export const TopNav: React.FC<TopNavProps> = ({ projectName, setProjectName, credits }) => {
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
                <div className="h-4 w-[1px] bg-zinc-800 mx-3" />

                {/* Project Name Editable Area */}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={projectName}
                        maxLength={20}
                        onChange={(e) => setProjectName(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{ width: `${Math.max(projectName.length || 12, 4)}ch` }}
                        className={`
              bg-transparent text-sm font-medium outline-none border-none transition-all duration-200 placeholder:text-zinc-700 min-w-[40px] max-w-[160px]
              ${isFocused ? 'text-white' : 'text-zinc-400'}
            `}
                        placeholder="Project"
                    />
                </div>

                {/* Divider */}
                <div className="h-4 w-[1px] bg-zinc-800 mx-3" />

                {/* Credits Display */}
                <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                    <Zap size={14} className="text-blue-400 fill-blue-400" />
                    <span className="text-xs font-bold text-white">{credits}</span>
                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Credits</span>
                </div>
            </div>
        </div>
    );
};
