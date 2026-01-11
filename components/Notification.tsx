"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            // Error messages persist longer (15s) so users can read and report
            const duration = type === 'error' ? 15000 : 5000;
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, type, onClose]);

    const styles = {
        success: {
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            icon: <CheckCircle2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-emerald-400" />
        },
        warning: {
            border: 'border-amber-500/20',
            text: 'text-amber-400',
            icon: <AlertTriangle className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-400" />
        },
        error: {
            border: 'border-red-500/20',
            text: 'text-red-400',
            icon: <AlertCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-red-400" />
        },
        info: {
            border: 'border-blue-500/20',
            text: 'text-blue-400',
            icon: <Info className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-blue-400" />
        }
    };

    const currentStyle = styles[type];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 1, y: -100, scale: 0.6 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -100, scale: 0.6, transition: { duration: 0.2 } }}
                    transition={{ 
                        type: "spring",
                        stiffness: 150,
                        damping: 15,
                        mass: 1.5
                    }}
                    style={{ x: "-50%" }}
                    className="fixed top-8 left-1/2 z-[200] pointer-events-none"
                >
                    <div className={`
                        flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl border backdrop-blur-2xl min-w-[260px] sm:min-w-[320px] max-w-md pointer-events-auto shadow-2xl bg-[#0c0c0c]/80
                        ${currentStyle.border}
                    `}>
                        <div className="shrink-0">{currentStyle.icon}</div>
                        <p className={`text-xs sm:text-sm font-medium flex-1 ${currentStyle.text}`}>
                            {message}
                        </p>
                        <button
                            onClick={onClose}
                            className="shrink-0 p-1 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
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
