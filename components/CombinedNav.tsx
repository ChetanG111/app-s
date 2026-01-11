import React, { useState } from 'react';
import { Zap, Home, Settings, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface CombinedNavProps {
    projectName: string;
    setProjectName: (name: string) => void;
    credits: number;
    onFeedbackClick?: () => void;
}

export const CombinedNav: React.FC<CombinedNavProps> = ({ projectName, setProjectName, credits, onFeedbackClick }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="absolute top-6 left-0 right-0 z-40 flex justify-center pointer-events-none">
            <div className="w-[90%] pointer-events-auto flex items-center justify-between h-14 bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 rounded-2xl px-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/10">
                
                {/* Left Side: Logo & Project Name */}
                <div className="flex items-center gap-2">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-3 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                            <div className="absolute inset-0 bg-white/5" />
                            <div className="w-3 h-3 bg-white/20 rounded-full blur-[2px]" />
                        </div>
                    </div>

                    <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

                    {/* Project Name Input */}
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={projectName}
                            maxLength={20}
                            onChange={(e) => setProjectName(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            style={{ width: `${Math.max(projectName.length || 10, 4)}ch` }}
                            className={`
                                bg-transparent text-sm font-medium outline-none border-none transition-all duration-200 placeholder:text-zinc-700 min-w-[60px] max-w-[120px]
                                ${isFocused ? 'text-white' : 'text-zinc-400'}
                            `}
                            placeholder="Project"
                        />
                    </div>
                </div>

                <div className="h-4 w-[1px] bg-zinc-800 mx-2" />

                {/* Right Side: Credits & Navigation */}
                <div className="flex items-center gap-2">
                     {/* Mobile Credits (Icon + Number) */}
                     <div className="flex items-center gap-1">
                        <Zap size={14} className="text-blue-400 fill-blue-400" />
                        <span className="text-xs font-bold text-white">{credits}</span>
                    </div>

                    <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1">
                        <Link
                            href="/"
                            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group"
                            title="Home"
                        >
                            <Home size={15} className="text-zinc-500 group-hover:text-white transition-colors" />
                        </Link>

                        <button
                            onClick={onFeedbackClick}
                            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group"
                            title="Feedback"
                        >
                            <MessageSquare size={15} className="text-zinc-500 group-hover:text-white transition-colors" />
                        </button>

                        <Link
                            href="/settings"
                            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group"
                            title="Settings"
                        >
                            <Settings size={15} className="text-zinc-500 group-hover:text-white transition-colors" />
                        </Link>

                        {/* Profile */}
                        {session?.user ? (
                            <button
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 border border-white/10 hover:border-white/20 transition-all text-zinc-400 hover:text-white relative overflow-hidden group ml-1"
                                onClick={() => router.push("/settings?tab=account")}
                                title="Account Settings"
                            >
                                {session.user.image ? (
                                    <Image 
                                        src={session.user.image} 
                                        alt={session.user.name || "User"} 
                                        width={36} 
                                        height={36} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                                {!session.user.image && <User size={16} />}
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-3 h-9 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all ml-1"
                            >
                                <span className="text-xs font-bold">Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
