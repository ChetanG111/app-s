import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { NotificationType } from '../Notification';

interface UploadViewProps {
    onUpload: (image: string) => void;
    currentImage: string | null;
    onNext: () => void;
    onNotify: (message: string, type: NotificationType) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onUpload, currentImage, onNext, onNotify }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleBoxClick = () => {
        fileInputRef.current?.click();
    };

    const processFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = (e) => {
                const img = new globalThis.Image();
                img.onload = () => {
                    // Portrait means Height > Width. Reject anything else (Landscape or Square)
                    if (img.width >= img.height) {
                        onNotify("Please upload a portrait screenshot (height must be greater than width).", "warning");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        return;
                    }

                    // Only upload if valid
                    onUpload(e.target?.result as string);
                    onNext();
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in zoom-in duration-500">
            <h1 className="text-white text-3xl sm:text-4xl font-black mb-8 sm:mb-auto pt-32 sm:pt-16 tracking-tight text-center">
                {currentImage ? "Screenshot uploaded" : "Upload a screenshot of your app"}
            </h1>

            <div className="relative mb-auto mt-0 sm:mb-32 sm:mt-16 flex justify-center w-full">
                <div
                    onClick={handleBoxClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        group relative bg-[#0c0c0c]/80 backdrop-blur-sm border-2 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden
                        ${isDragging ? 'border-blue-500 bg-blue-500/5 scale-[1.02]' : 'border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-[#111111]'}
                        ${currentImage ? 'border-none' : 'h-[550px] sm:h-[520px] aspect-[9/16]'}
                    `}
                >
                    {currentImage ? (
                        <>
                            <Image
                                src={currentImage}
                                alt="Uploaded screenshot"
                                width={292}
                                height={520}
                                className="h-[550px] sm:h-[520px] w-auto block object-contain"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                                <Camera className="text-white mb-2" size={32} />
                                <span className="text-white font-bold">Change Screenshot</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                                <Camera className="text-zinc-400 group-hover:text-white" size={28} strokeWidth={1.5} />
                            </div>

                            <h3 className="text-lg font-medium text-white mb-1">Add screenshot</h3>
                            <p className="text-zinc-400 text-sm mb-4 text-center px-4">
                                Drag & drop or <span className="text-blue-400 group-hover:underline">click to browse</span>
                            </p>
                            <p className="text-zinc-600 text-left text-[10px] tracking-wide uppercase">
                                JPEG, PNG, WebP, HEIC • Max 10MB
                            </p>
                        </>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            </div>


        </div>
    );
};
