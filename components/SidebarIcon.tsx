import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarIconProps {
    Icon: LucideIcon;
    isSelected: boolean;
    onClick: () => void;
}

export const SidebarIcon: React.FC<SidebarIconProps> = ({
    Icon,
    isSelected,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className={`
        relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 z-10
        ${isSelected
                    ? 'text-black'
                    : 'text-zinc-500 hover:text-white'
                }
      `}
        >
            <Icon size={20} strokeWidth={isSelected ? 2.5 : 1.5} />
        </button>
    );
};
