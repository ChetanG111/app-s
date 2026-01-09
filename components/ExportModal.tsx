"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, FileImage, FileType } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    imageUrl: string | null;
    onClose: () => void;
    onNotify: (message: string, type: 'success' | 'error') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    imageUrl,
    onClose,
    onNotify
}) => {
    if (!imageUrl) return null;

    const handleDownload = async (format: 'png' | 'jpg') => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            // For JPG, we'd ideally convert it. For now, since it's a simple download, 
            // we'll just rename it. Real conversion would happen in a canvas or backend.
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const filename = `shot88-${Date.now()}.${format}`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            onNotify(`Exported as ${format.toUpperCase()}`, 'success');
        } catch (err) {
            onNotify('Failed to download image', 'error');
        }
    };

    const handleCopy = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const data = [new ClipboardItem({ [blob.type]: blob })];
            await navigator.clipboard.write(data);
            onNotify('Copied to clipboard', 'success');
        } catch (err) {
            onNotify('Failed to copy image', 'error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden flex flex-col items-center"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-black text-white mb-8 tracking-tight">
                            Export Image
                        </h2>

                        {/* Image Preview Area */}
                        <div className="relative w-full aspect-[9/16] max-h-[400px] mb-10 bg-zinc-900/50 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
                            <img
                                src={imageUrl}
                                alt="Export Preview"
                                className="h-full w-auto object-contain"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-4 w-full">
                            <button
                                onClick={() => handleDownload('png')}
                                className="flex flex-col items-center justify-center gap-2 h-24 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-2xl transition-all group active:scale-95"
                            >
                                <FileImage size={24} className="text-zinc-400 group-hover:text-blue-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white">PNG</span>
                            </button>

                            <button
                                onClick={() => handleDownload('jpg')}
                                className="flex flex-col items-center justify-center gap-2 h-24 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-2xl transition-all group active:scale-95"
                            >
                                <FileType size={24} className="text-zinc-400 group-hover:text-amber-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white">JPG</span>
                            </button>

                            <button
                                onClick={handleCopy}
                                className="flex flex-col items-center justify-center gap-2 h-24 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-2xl transition-all group active:scale-95"
                            >
                                <Copy size={24} className="text-zinc-400 group-hover:text-emerald-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white">Copy</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
