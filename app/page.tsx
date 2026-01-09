"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationToast, useNotification, NotificationType } from '../components/Notification';
import {
    ImagePlus,
    Smartphone,
    Type,
    TextCursor,
    Droplet,
    Layers,
    Sparkles,
    Camera,
    ChevronDown,
    MoreHorizontal,
    LucideIcon,
    Download,
    Trash2,
    Plus,
    Check,
    Zap,
    Palette,
    X,
    AlertCircle,
    CheckCircle2,
    Info,
    AlertTriangle
} from 'lucide-react';

interface SidebarIconProps {
    Icon: LucideIcon;
    isSelected: boolean;
    onClick: () => void;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({
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

interface TopNavProps {
    projectName: string;
    setProjectName: (name: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({ projectName, setProjectName }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="absolute top-6 left-6 z-40 flex items-center gap-2 pointer-events-auto">
            <div className={`
        flex items-center bg-[#0c0c0c]/90 backdrop-blur-2xl border rounded-2xl px-4 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300
        ${isFocused ? 'border-white/20 ring-1 ring-white/10' : 'border-white/5 hover:border-white/10'}
      `}>
                {/* Logo/Icon Area */}
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-4 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 to-zinc-900 opacity-50" />
                        <div className="w-4 h-4 bg-white/20 rounded-full blur-[2px]" />
                    </div>

                    <span className="text-white font-bold tracking-tight text-sm">Shots</span>
                </div>

                {/* Divider */}
                <div className="h-4 w-[1px] bg-zinc-800 mx-4" />

                {/* Project Name Editable Area */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`
              bg-transparent text-sm font-medium outline-none border-none transition-all duration-200 w-32 md:w-48 placeholder:text-zinc-700
              ${isFocused ? 'text-white translate-x-1' : 'text-zinc-400'}
            `}
                        placeholder="Untitled Project"
                    />

                    <button
                        aria-label="More options"
                        className={`
            transition-colors duration-200
            ${isFocused ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-400'}
          `}>
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ViewProps {
    uploadedImage: string | null;
    onImageUpload: (image: string) => void;
    onNotify: (message: string, type: NotificationType) => void;
}

const UploadView: React.FC<ViewProps> = ({ uploadedImage, onImageUpload, onNotify }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleBoxClick = () => {
        fileInputRef.current?.click();
    };

    const processFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Portrait means Height > Width. Reject anything else (Landscape or Square)
                    if (img.width >= img.height) {
                        onNotify("Please upload a portrait screenshot (height must be greater than width).", "warning");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        // Ensure we don't proceed
                        return;
                    } 
                    
                    // Only upload if valid
                    onImageUpload(e.target?.result as string);
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
            <h1 className="text-white text-4xl font-black mb-auto pt-16 tracking-tight text-center">
                {uploadedImage ? "Screenshot uploaded" : "Upload a screenshot of your app"}
            </h1>

            <div className="relative mb-[120px] mt-16 flex justify-center w-full">
                <div
                    onClick={handleBoxClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        group relative bg-[#0c0c0c]/80 backdrop-blur-sm border-2 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden
                        ${isDragging ? 'border-blue-500 bg-blue-500/5 scale-[1.02]' : 'border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-[#111111]'}
                        ${uploadedImage ? 'border-none' : 'h-[520px] aspect-[9/16]'}
                    `}
                >
                    {uploadedImage ? (
                        <>
                            <img
                                src={uploadedImage}
                                alt="Uploaded screenshot"
                                className="h-[520px] w-auto block object-contain"
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
                            <p className="text-zinc-600 text-[10px] tracking-wide uppercase">
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

const LAYOUT_STYLES = [
    { id: 'Basic', name: 'Basic', image: '/templates/layouts/Basic.png' },
    { id: 'Rotated', name: 'Rotated', image: '/templates/layouts/Rotated.png' },
    { id: 'Rotated-left-facing', name: 'Rotated Left', image: '/templates/layouts/Rotated-left-facing.png' },
];

interface StyleViewProps {
    selectedStyle: string;
    onSelect: (id: string) => void;
}

const StyleView: React.FC<StyleViewProps> = ({ selectedStyle, onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pt-16 pb-24">
            <h1 className="text-white text-4xl font-black mb-12 tracking-tight text-center">
                Select your layout style
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-12 w-full">
                {LAYOUT_STYLES.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    return (
                        <div
                            key={style.id}
                            onClick={() => onSelect(style.id)}
                            className={`
                                group relative bg-[#0c0c0c] rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 border-2
                                ${isSelected
                                    ? 'border-white shadow-[0_0_60px_rgba(255,255,255,0.1)] scale-100 z-10'
                                    : 'border-zinc-800 scale-[0.98] hover:border-zinc-600 opacity-60 hover:opacity-100'
                                }
                            `}
                        >
                            <img
                                src={style.image}
                                alt={style.name}
                                className="h-[520px] w-auto block object-contain"
                            />

                            {isSelected && (
                                <div className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in duration-300">
                                    <Check size={22} className="text-black" strokeWidth={3} />
                                </div>
                            )}

                            {!isSelected && (
                                <div className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-300" />
                            )}

                            <div className={`
                                absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 transition-all duration-300
                                ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            `}>
                                <span className="text-xs font-bold tracking-widest uppercase text-white whitespace-nowrap">{style.name}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface TextViewProps {
    headline: string;
    setHeadline: (text: string) => void;
}

const TextView: React.FC<TextViewProps> = ({ headline, setHeadline }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-white text-5xl font-black mb-auto pt-16 tracking-tight text-center">
                Headline Text
            </h1>

            <div className="w-full max-w-2xl mb-auto flex flex-col items-center px-4">
                <div className={`
          relative w-full transition-all duration-500 border-b-2 py-4
          ${isFocused ? 'border-white' : 'border-zinc-800'}
        `}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value.slice(0, 50))}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Enter your headline here..."
                        className="w-full bg-transparent text-white text-4xl font-bold text-center outline-none placeholder:text-zinc-800 transition-all duration-300"
                        maxLength={50}
                    />

                    <div className={`
            absolute -bottom-10 right-0 text-sm font-medium transition-colors duration-300
            ${isFocused ? 'text-zinc-400' : 'text-zinc-600'}
          `}>
                        {headline.length} / 50
                    </div>

                    <div className={`
            absolute inset-x-0 -bottom-[2px] h-[2px] bg-white transition-opacity duration-500 shadow-[0_4px_20px_rgba(255,255,255,0.3)]
            ${isFocused ? 'opacity-100' : 'opacity-0'}
          `} />
                </div>

                <p className="text-zinc-500 text-sm mt-16 text-center max-w-md">
                    This text will appear at the top of your generated mockup. Make it punchy and clear.
                </p>
            </div>
        </div>
    );
};

interface FontOption {
    id: string;
    label: string;
    className: string;
}

const FONT_OPTIONS: FontOption[] = [
    { id: 'standard', label: 'Standard Sans', className: 'font-sans' },
    { id: 'handwritten', label: 'Handwritten', className: 'font-serif italic' },
    { id: 'modern', label: 'Modern Geometric', className: 'font-mono uppercase tracking-widest' },
];

interface FontViewProps {
    selectedFont: string;
    onSelect: (id: string) => void;
}

const FontView: React.FC<FontViewProps> = ({ selectedFont, onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-white text-5xl font-black mb-auto pt-16 tracking-tight text-center">
                Select Font Style
            </h1>

            <div className="w-full max-w-md mb-auto flex flex-col gap-4 px-4">
                {FONT_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`
              w-full h-16 rounded-2xl flex items-center justify-between px-8 text-lg font-semibold transition-all duration-300 border-2
              ${selectedFont === option.id
                                ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-[1.02]'
                                : 'bg-[#0c0c0c]/80 border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white'
                            }
            `}
                    >
                        <span className={option.className}>{option.label}</span>
                        {selectedFont === option.id && (
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check size={14} className="text-white" strokeWidth={4} />
                            </div>
                        )}
                    </button>
                ))}

                <p className="text-zinc-500 text-sm mt-12 text-center">
                    Choose a font that matches your app's brand identity.
                </p>
            </div>
        </div>
    );
};

interface ColorOption {
    id: string;
    label: string;
    colorClass?: string;
    isAI?: boolean;
}

const COLOR_OPTIONS: ColorOption[] = [
    { id: 'ai', label: 'AI Suggestions', isAI: true },
    { id: 'black', label: 'Black', colorClass: 'bg-black border-zinc-700' },
    { id: 'white', label: 'White', colorClass: 'bg-white' },
    { id: 'blue', label: 'Blue', colorClass: 'bg-blue-600' },
];

interface ColorViewProps {
    selectedColor: string;
    onSelect: (id: string) => void;
}

const ColorView: React.FC<ColorViewProps> = ({ selectedColor, onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-white text-5xl font-black mb-auto pt-16 tracking-tight text-center">
                Headline Color
            </h1>

            <div className="w-full max-w-md mb-auto flex flex-col gap-4 px-4">
                {COLOR_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`
              w-full h-16 rounded-2xl flex items-center justify-between px-8 text-lg font-semibold transition-all duration-300 border-2
              ${selectedColor === option.id
                                ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-[1.02]'
                                : 'bg-[#0c0c0c]/80 border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white'
                            }
            `}
                    >
                        <div className="flex items-center gap-4">
                            {option.isAI ? (
                                <Zap size={20} className={selectedColor === option.id ? 'text-blue-600' : 'text-zinc-500'} />
                            ) : (
                                <div className={`w-6 h-6 rounded-full border ${option.colorClass}`} />
                            )}
                            <span>{option.label}</span>
                        </div>
                        {selectedColor === option.id && (
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check size={14} className="text-white" strokeWidth={4} />
                            </div>
                        )}
                    </button>
                ))}

                <p className="text-zinc-500 text-sm mt-12 text-center">
                    Pick a color that pops against your background.
                </p>
            </div>
        </div>
    );
};

interface BackgroundOption {
    id: string;
    label: string;
    colorClass?: string;
    isAI?: boolean;
    isCustom?: boolean;
    description?: string;
}

const BACKGROUND_OPTIONS: BackgroundOption[] = [
    { id: 'charcoal', label: 'Charcoal', colorClass: 'bg-[#151922] border-white/5', description: 'Default. Safest.' },
    { id: 'deep_indigo', label: 'Deep Indigo', colorClass: 'bg-[#0F1430] border-white/10', description: 'Slight color, still premium.' },
    { id: 'dark_slate', label: 'Dark Slate', colorClass: 'bg-[#0E1116] border-white/5' },
    { id: 'custom', label: 'Custom', isCustom: true },
];

interface BackgroundViewProps {
    selectedBg: string;
    onSelect: (id: string) => void;
    customValue: string;
    setCustomValue: (val: string) => void;
    generateBackground: boolean;
    setGenerateBackground: (val: boolean) => void;
}

const BackgroundView: React.FC<BackgroundViewProps> = ({
    selectedBg,
    onSelect,
    customValue,
    setCustomValue,
    generateBackground,
    setGenerateBackground
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="flex flex-col items-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="flex flex-col items-center w-full shrink-0 mb-8">
                <h1 className="text-white text-5xl font-black mb-6 tracking-tight text-center">
                    Background Style
                </h1>

                {/* Dev Mode Toggle */}
                <div
                    onClick={() => setGenerateBackground(!generateBackground)}
                    className="flex items-center gap-3 bg-[#0c0c0c]/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-2xl cursor-pointer hover:border-white/20 transition-all group"
                >
                    <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${generateBackground ? 'bg-blue-500' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all duration-300 ${generateBackground ? 'left-5' : 'left-1'}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        Generate AI Background {generateBackground ? '(ON)' : '(OFF)'}
                    </span>
                </div>
            </div>

            <div className="w-full max-w-md flex flex-col gap-2.5 px-4 pb-20">
                {BACKGROUND_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`
                            w-full h-[72px] shrink-0 rounded-2xl flex items-center justify-between px-6 transition-all duration-300 border-2
                            ${selectedBg === option.id
                                ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-[1.02]'
                                : 'bg-[#0c0c0c]/80 border-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
                            }
                        `}
                    >
                        <div className={`flex flex-col items-start ${!generateBackground ? 'opacity-30' : ''}`}>
                            <div className="flex items-center gap-4">
                                {option.isAI ? (
                                    <Zap size={20} className={selectedBg === option.id ? 'text-blue-600' : 'text-zinc-500'} />
                                ) : option.isCustom ? (
                                    <Palette size={20} className={selectedBg === option.id ? 'text-indigo-600' : 'text-zinc-500'} />
                                ) : (
                                    <div className={`w-6 h-6 rounded-full border ${option.colorClass}`} />
                                )}
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold leading-tight">{option.label}</span>
                                    {option.description && (
                                        <span className={`text-[11px] font-medium leading-tight mt-1 ${selectedBg === option.id ? 'text-black/60' : 'text-zinc-600'}`}>
                                            {option.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {selectedBg === option.id && generateBackground && (
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check size={14} className="text-white" strokeWidth={4} />
                            </div>
                        )}
                    </button>
                ))}

                {!generateBackground && (
                    <div className="mt-4 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 animate-in fade-in duration-500">
                        <p className="text-zinc-400 text-xs text-center leading-relaxed">
                            <span className="text-blue-400 font-bold uppercase text-[10px] block mb-1">Developer Mode</span>
                            Background generation is disabled. App will only generate the phone mockup on its original template background.
                        </p>
                    </div>
                )}

                {selectedBg === 'custom' && (
                    <div className="mt-4 animate-in slide-in-from-top-4 duration-500 flex flex-col items-center w-full">
                        <div className={`
              relative w-full transition-all duration-500 border-b-2 py-2
              ${isFocused ? 'border-white' : 'border-zinc-800'}
            `}>
                            <input
                                type="text"
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value.slice(0, 100))}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Enter custom prompt or hex..."
                                className="w-full bg-transparent text-white text-lg font-medium text-center outline-none placeholder:text-zinc-800 transition-all duration-300"
                                maxLength={100}
                            />

                            <div className={`
                absolute -bottom-6 right-0 text-[9px] font-bold uppercase tracking-widest transition-colors duration-300
                ${isFocused ? 'text-zinc-400' : 'text-zinc-700'}
              `}>
                                {customValue.length} / 100
                            </div>

                            <div className={`
                absolute inset-x-0 -bottom-[1px] h-[1px] bg-white transition-opacity duration-500 shadow-[0_2px_10px_rgba(255,255,255,0.3)]
                ${isFocused ? 'opacity-100' : 'opacity-0'}
              `} />
                        </div>
                    </div>
                )}

                <p className="text-zinc-500 text-sm mt-6 text-center shrink-0">
                    The background sets the mood for your entire screenshot.
                </p>
            </div>
        </div>
    );
};

interface GenerateViewProps {
    uploadedImage: string | null;
    isGenerating: boolean;
    handleGenerate: () => Promise<void>;
    onNotify: (message: string, type: NotificationType) => void;
}

const GenerateView: React.FC<GenerateViewProps> = ({
    uploadedImage,
    isGenerating,
    handleGenerate,
    onNotify
}) => {
    const [history, setHistory] = useState<any[]>([]);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/outputs");
            const data = await res.json();
            if (data.files) setHistory(data.files);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [isGenerating]); // Refresh history whenever generation state changes (especially when it finishes)

    const onGenerateClick = async () => {
        await handleGenerate();
        fetchHistory();
    };

    const handleDownload = (fileUrl: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        // Ensure query params are stripped before extracting filename
        const cleanName = fileUrl.split('?')[0].split('/').pop();
        link.download = cleanName || 'mockup.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (fileUrl: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const response = await fetch("/api/outputs/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filenames: [fileUrl] }),
            });

            if (response.ok) {
                fetchHistory();
            }
        } catch (err) {
            console.error("Failed to delete file:", err);
        }
    };

    const handleCloseViewer = () => setViewingImage(null);

    return (
        <div className="flex flex-col items-center w-full h-full max-w-6xl mx-auto px-6 animate-in fade-in zoom-in duration-500 pt-24 pb-32 overflow-y-auto">
            {/* Full Screen Image Viewer Modal */}
            {viewingImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
                    onClick={handleCloseViewer}
                >
                    {/* Backdrop Blur Layer */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />

                    {/* Close Button */}
                    <button
                        onClick={handleCloseViewer}
                        className="absolute top-8 right-8 z-[110] p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white transition-all hover:scale-110 active:scale-95"
                    >
                        <X size={24} />
                    </button>

                    {/* Image Container */}
                    <div
                        className="relative z-[110] max-w-full max-h-full flex items-center justify-center animate-in zoom-in duration-400"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={viewingImage}
                            alt="Full screen preview"
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        />

                    </div>
                </div>
            )}

            <div className="flex flex-col items-center gap-8 w-full">
                {/* History Gallery + Generate Card */}
                <div className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Recent Generations
                            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md font-mono">
                                {history.length}
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* The Generate Card - Always present at the start of the grid */}
                        <button
                            onClick={onGenerateClick}
                            disabled={isGenerating || !uploadedImage}
                            className={`
                                relative aspect-[9/16] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 group
                                ${isGenerating
                                    ? 'border-blue-500/50 bg-blue-500/5 cursor-wait'
                                    : !uploadedImage
                                        ? 'border-zinc-900 bg-black/20 opacity-40 cursor-not-allowed'
                                        : 'border-zinc-800 hover:border-zinc-500 bg-black/40 hover:bg-white/5 cursor-pointer'
                                }
                            `}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <span className="text-blue-400 font-bold text-sm animate-pulse text-center px-4">Creating your mockup...</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                                        <Plus className="text-zinc-500 group-hover:text-white" size={32} strokeWidth={2} />
                                    </div>
                                    <span className="text-zinc-400 group-hover:text-white font-bold text-lg">Generate</span>
                                    {!uploadedImage && <span className="text-zinc-600 text-[10px] uppercase tracking-widest mt-2">Upload Required</span>}
                                </>
                            )}
                        </button>

                        {/* History Items */}
                        {history.map((file) => (
                            <div
                                key={file.name}
                                onClick={() => setViewingImage(file.url)}
                                className="group relative aspect-[9/16] bg-zinc-900 rounded-[2.5rem] overflow-hidden transition-all duration-300 border-2 border-transparent hover:border-zinc-700 cursor-pointer"
                            >
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />

                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(file.url);
                                        }}
                                        className="p-2.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all shadow-xl hover:scale-110 active:scale-95"
                                        title="Download"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(file.url);
                                        }}
                                        className="p-2.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="absolute bottom-6 inset-x-0 px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[11px] text-zinc-400 font-mono bg-black/60 backdrop-blur-sm py-1.5 px-3 rounded-full w-fit">
                                        {new Date(file.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {history.length === 0 && !isGenerating && (
                        <p className="text-zinc-600 text-sm mt-12 text-center italic">
                            Choose your screenshot and style, then click Generate to begin.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Home() {
    const { notification, showNotification, hideNotification } = useNotification();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState("Basic");
    const [headline, setHeadline] = useState("");
    const [selectedFont, setSelectedFont] = useState("standard");
    const [selectedColor, setSelectedColor] = useState("white");
    const [selectedBg, setSelectedBg] = useState("charcoal");
    const [customBgPrompt, setCustomBgPrompt] = useState("");
    const [projectName, setProjectName] = useState("App-1");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateBackground, setGenerateBackground] = useState(true);

    const handleGenerate = async () => {
        if (!uploadedImage) {
            showNotification("Please upload a screenshot first.", "warning");
            setSelectedIndex(0);
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    screenshot: uploadedImage,
                    style: selectedStyle,
                    backgroundId: selectedBg,
                    customBackground: customBgPrompt,
                    headline,
                    font: selectedFont,
                    color: selectedColor,
                    skipBackground: !generateBackground
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Generation failed");

            showNotification("Mockup generated successfully!", "success");
        } catch (err: any) {
            showNotification(err.message, "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const icons = [
        { id: 'upload', icon: ImagePlus },
        { id: 'style', icon: Smartphone },
        { id: 'text', icon: Type },
        { id: 'font', icon: TextCursor },
        { id: 'color', icon: Droplet },
        { id: 'background', icon: Layers },
        { id: 'generate', icon: Sparkles },
    ];

    const handleNext = () => {
        if (selectedIndex < icons.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        }
    };

    return (
        <main className="relative w-screen h-screen overflow-hidden text-white">
            <NotificationToast
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={hideNotification}
            />
            {/* Top Navigation */}
            <TopNav projectName={projectName} setProjectName={setProjectName} />

            {/* Sidebar UI */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30">
                <div className="flex flex-col items-center bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 rounded-full p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {icons.map((item, index) => {
                        const isSelected = selectedIndex === index;
                        return (
                            <div key={item.id} className="relative">
                                {isSelected && (
                                    <motion.div
                                        layoutId="sidebar-pill"
                                        className="absolute inset-0 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 25,
                                            mass: 1.2
                                        }}
                                    />
                                )}
                                <SidebarIcon
                                    Icon={item.icon}
                                    isSelected={isSelected}
                                    onClick={() => setSelectedIndex(index)}
                                />
                                {item.id === 'generate' && isGenerating && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0c0c0c] animate-pulse z-20" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pl-24">
                {selectedIndex === 0 && (
                    <UploadView
                        uploadedImage={uploadedImage}
                        onImageUpload={setUploadedImage}
                        onNotify={showNotification}
                    />
                )}

                {selectedIndex === 1 && (
                    <StyleView
                        selectedStyle={selectedStyle}
                        onSelect={setSelectedStyle}
                    />
                )}

                {selectedIndex === 2 && (
                    <TextView headline={headline} setHeadline={setHeadline} />
                )}

                {selectedIndex === 3 && (
                    <FontView selectedFont={selectedFont} onSelect={setSelectedFont} />
                )}

                {selectedIndex === 4 && (
                    <ColorView selectedColor={selectedColor} onSelect={setSelectedColor} />
                )}

                {selectedIndex === 5 && (
                    <BackgroundView
                        selectedBg={selectedBg}
                        onSelect={setSelectedBg}
                        customValue={customBgPrompt}
                        setCustomValue={setCustomBgPrompt}
                        generateBackground={generateBackground}
                        setGenerateBackground={setGenerateBackground}
                    />
                )}

                {selectedIndex === 6 && (
                    <GenerateView
                        uploadedImage={uploadedImage}
                        isGenerating={isGenerating}
                        handleGenerate={handleGenerate}
                        onNotify={showNotification}
                    />
                )}


                {/* Universal Continue Button - Visible on all tabs except the last one */}
                {selectedIndex < icons.length - 1 && (
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center pl-24 pointer-events-none">
                        <button
                            onClick={handleNext}
                            className="pointer-events-auto flex items-center gap-3 bg-white hover:bg-zinc-200 text-black px-12 py-4 rounded-full font-bold transition-all duration-300 group shadow-xl active:scale-95"
                        >
                            Continue
                            <ChevronDown size={20} strokeWidth={3} className="transition-transform duration-300 group-hover:translate-y-0.5" />
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
