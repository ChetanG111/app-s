"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    X,
    CheckCircle2,
    AlertCircle,
    Info,
    AlertTriangle
} from 'lucide-react';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

interface NotificationToastProps {
    message: string;
    type: NotificationType;
    isVisible: boolean;
    onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
    message,
    type,
    isVisible,
    onClose
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const styles = {
        success: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            icon: <CheckCircle2 size={18} className="text-emerald-400" />
        },
        warning: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-400',
            icon: <AlertTriangle size={18} className="text-amber-400" />
        },
        error: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            text: 'text-red-400',
            icon: <AlertCircle size={18} className="text-red-400" />
        },
        info: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            text: 'text-blue-400',
            icon: <Info size={18} className="text-blue-400" />
        }
    };

    const currentStyle = styles[type];

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-2xl shadow-2xl min-w-[320px] max-w-md
                ${currentStyle.bg} ${currentStyle.border}
            `}>
                <div className="shrink-0">{currentStyle.icon}</div>
                <p className={`text-sm font-medium flex-1 ${currentStyle.text}`}>
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-white"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export const useNotification = () => {
    const [notification, setNotification] = useState<{
        message: string;
        type: NotificationType;
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false
    });

    const showNotification = useCallback((message: string, type: NotificationType) => {
        setNotification({ message, type, isVisible: true });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    }, []);

    return {
        notification,
        showNotification,
        hideNotification
    };
};
