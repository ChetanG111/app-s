"use client";

import React from 'react';
import { X, Download, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
            const initialBlob = await response.blob();
            let finalBlob = initialBlob;
            let finalUrl = '';

            // If user wants JPG, we must convert it (real conversion, not just renaming)
            if (format === 'jpg') {
                const bitmap = await createImageBitmap(initialBlob);
                const canvas = document.createElement('canvas');
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // JPG doesn't support transparency, so fill with white first
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(bitmap, 0, 0);
                    
                    finalBlob = await new Promise<Blob>((resolve, reject) => {
                        canvas.toBlob((blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Canvas conversion failed'));
                        }, 'image/jpeg', 0.9);
                    });
                }
            }

            finalUrl = window.URL.createObjectURL(finalBlob);
            const link = document.createElement('a');
            link.href = finalUrl;
            
            // Generate clean filename
            const date = new Date().toISOString().split('T')[0];
            const timestamp = new Date().getTime().toString().slice(-4);
            const filename = `shot-${date}-${timestamp}.${format}`;
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(finalUrl);

            onNotify(`Exported as ${format.toUpperCase()}`, 'success');
        } catch (err) {
            console.error(err);
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
        } catch {
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
                            <Image
                                src={imageUrl}
                                alt="Export Preview"
                                fill
                                className="object-contain"
                                unoptimized
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
