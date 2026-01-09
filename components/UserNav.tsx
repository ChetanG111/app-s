import React from 'react';
import { Home, Settings, User } from 'lucide-react';
import Link from 'next/link';

export const UserNav: React.FC = () => {
    return (
        <div className="absolute top-6 right-6 z-40 flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center h-12 bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 rounded-2xl px-1.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/10">
                <div className="flex items-center gap-1.5">
                    {/* Home Button */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 h-9 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group"
                    >
                        <Home size={15} className="text-zinc-500 group-hover:text-white transition-colors" />
                        <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Home</span>
                    </Link>

                    {/* Settings Button */}
                    <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 h-9 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group"
                    >
                        <Settings size={15} className="text-zinc-500 group-hover:text-white transition-colors" />
                        <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Settings</span>
                    </Link>

                    {/* Divider */}
                    <div className="w-[1px] h-5 bg-white/10 mx-1" />

                    {/* Profile Icon */}
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 border border-white/10 hover:border-white/20 transition-all text-zinc-400 hover:text-white relative overflow-hidden group"
                        onClick={() => { }} // No interaction as requested
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <User size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
