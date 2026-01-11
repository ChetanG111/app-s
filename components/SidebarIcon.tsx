import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarIconProps {
    Icon: LucideIcon;
    isSelected: boolean;
    isDisabled?: boolean;
    onClick: () => void;
}

export const SidebarIcon: React.FC<SidebarIconProps> = ({
    Icon,
    isSelected,
    isDisabled,
    onClick
}) => {
    return (
        <button
            onClick={isDisabled ? undefined : onClick}
            className={`
        relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 z-10
        ${isDisabled
                    ? 'text-white/5 cursor-not-allowed'
                    : isSelected
                        ? 'text-black'
                        : 'text-zinc-500 hover:text-white'
                }
      `}
        >
            <Icon size={20} className="w-[18px] h-[18px] sm:w-5 sm:h-5" strokeWidth={isSelected ? 2.5 : 1.5} />
        </button>
    );
};
