"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    isDanger = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden"
                    >
                        {/* Subtle background detail */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/5" />

                        <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 ${isDanger ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-white border border-white/10'
                                }`}>
                                <AlertCircle size={24} />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                                {title}
                            </h3>
                            <p className="text-zinc-400 text-xs leading-relaxed mb-6 px-2">
                                {message}
                            </p>

                            <div className="flex items-center gap-3 w-full">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs transition-all active:scale-95 border border-white/5"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`flex-1 h-10 rounded-xl font-bold text-xs transition-all active:scale-95 ${isDanger
                                        ? 'bg-red-600 hover:bg-red-500 text-white'
                                        : 'bg-white hover:bg-zinc-200 text-black'
                                        }`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const useConfirmation = () => {
    const [config, setConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        isDanger?: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const confirm = useCallback((options: {
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        isDanger?: boolean;
        onConfirm: () => void;
    }) => {
        setConfig({
            ...options,
            isOpen: true
        });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    const handleConfirm = useCallback(() => {
        config.onConfirm();
        closeConfirm();
    }, [config, closeConfirm]);

    return {
        confirmConfig: config,
        confirm,
        closeConfirm,
        handleConfirm
    };
};
