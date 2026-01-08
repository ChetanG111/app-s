"use client";

import React, { useState, useRef, useEffect } from 'react';
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
    Check,
    Zap,
    Palette,
    MoreHorizontal,
    LucideIcon
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
        relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
        ${isSelected
                    ? 'bg-white text-black scale-100'
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
}

const UploadView: React.FC<ViewProps> = ({ onImageUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBoxClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageUpload(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in zoom-in duration-500">
            <h1 className="text-white text-4xl font-black mb-auto pt-16 tracking-tight text-center">
                Upload a screenshot of your app
            </h1>

            <div
                onClick={handleBoxClick}
                className="group relative h-[520px] aspect-[9/16] bg-[#0c0c0c]/80 backdrop-blur-sm border-2 border-dashed border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-zinc-600 hover:bg-[#111111] transition-all duration-300 mb-[120px]"
            >
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

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};

const StyleView: React.FC<{ uploadedImage: string | null }> = ({ uploadedImage }) => {
    const [isSelected, setIsSelected] = useState(true);
    const mockupImage = uploadedImage || 'https://images.unsplash.com/photo-1695653422715-991ec3a0db7a?q=80&w=1974&auto=format&fit=crop';

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-white text-4xl font-black mb-8 pt-16 tracking-tight text-center">
                Select your layout style
            </h1>

            <div className="relative mb-[120px] mt-16">
                <div
                    onClick={() => setIsSelected(!isSelected)}
                    className={`
            group relative h-[520px] aspect-[9/16] bg-[#0c0c0c] rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 border-2
            ${isSelected
                            ? 'border-white shadow-[0_0_60px_rgba(255,255,255,0.1)] scale-100'
                            : 'border-zinc-800 scale-[0.98] hover:border-zinc-600 opacity-60 hover:opacity-100'
                        }
          `}
                >
                    <div className="w-full h-full relative p-0 overflow-hidden">
                        <img
                            src={mockupImage}
                            alt="Style mockup"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {isSelected && (
                        <div className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in duration-300">
                            <Check size={22} className="text-black" strokeWidth={3} />
                        </div>
                    )}

                    {!isSelected && (
                        <div className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-300" />
                    )}
                </div>
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
}

const BACKGROUND_OPTIONS: BackgroundOption[] = [
    { id: 'ai', label: 'AI Suggestions', isAI: true },
    { id: 'slate', label: 'Dark Slate', colorClass: 'bg-[#121212] border-zinc-700' },
    { id: 'midnight', label: 'Midnight', colorClass: 'bg-[#050505] border-zinc-900' },
    { id: 'indigo', label: 'Deep Indigo', colorClass: 'bg-[#1a1c2c]' },
    { id: 'custom', label: 'Custom', isCustom: true },
];

interface BackgroundViewProps {
    selectedBg: string;
    onSelect: (id: string) => void;
    customValue: string;
    setCustomValue: (val: string) => void;
}

const BackgroundView: React.FC<BackgroundViewProps> = ({
    selectedBg,
    onSelect,
    customValue,
    setCustomValue
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="flex flex-col items-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <h1 className="text-white text-5xl font-black pt-12 mb-8 tracking-tight text-center shrink-0">
                Background Style
            </h1>

            <div className="w-full max-w-md flex flex-col gap-2.5 px-4 pb-20">
                {BACKGROUND_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`
              w-full h-14 shrink-0 rounded-2xl flex items-center justify-between px-8 text-lg font-semibold transition-all duration-300 border-2
              ${selectedBg === option.id
                                ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-[1.02]'
                                : 'bg-[#0c0c0c]/80 border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white'
                            }
            `}
                    >
                        <div className="flex items-center gap-4">
                            {option.isAI ? (
                                <Zap size={18} className={selectedBg === option.id ? 'text-blue-600' : 'text-zinc-500'} />
                            ) : option.isCustom ? (
                                <Palette size={18} className={selectedBg === option.id ? 'text-indigo-600' : 'text-zinc-500'} />
                            ) : (
                                <div className={`w-5 h-5 rounded-full border ${option.colorClass}`} />
                            )}
                            <span>{option.label}</span>
                        </div>
                        {selectedBg === option.id && (
                            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check size={12} className="text-white" strokeWidth={4} />
                            </div>
                        )}
                    </button>
                ))}

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

const GenerateView: React.FC = () => {
    const handleGenerate = () => {
        // Placeholder for actual generation logic
        console.log("Generating mockup...");
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto px-6 animate-in fade-in zoom-in duration-500">
            <h1 className="text-white text-5xl font-black mb-8 tracking-tight text-center">
                Ready to go?
            </h1>
            <p className="text-zinc-500 text-lg mb-16 text-center max-w-md">
                Review your settings and click the button below to generate your professional mockup.
            </p>

            <button
                onClick={handleGenerate}
                className="flex items-center gap-4 bg-white hover:bg-zinc-200 text-black px-16 py-6 rounded-full font-black text-xl transition-all duration-300 group shadow-[0_0_50px_rgba(255,255,255,0.15)] active:scale-95"
            >
                <Sparkles size={28} className="fill-black group-hover:scale-110 transition-transform duration-300" />
                Generate Mockup
            </button>
        </div>
    );
};

export default function Home() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [headline, setHeadline] = useState("");
    const [selectedFont, setSelectedFont] = useState("standard");
    const [selectedColor, setSelectedColor] = useState("white");
    const [selectedBg, setSelectedBg] = useState("midnight");
    const [customBgPrompt, setCustomBgPrompt] = useState("");
    const [projectName, setProjectName] = useState("App-1");

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
            {/* Top Navigation */}
            <TopNav projectName={projectName} setProjectName={setProjectName} />

            {/* Sidebar UI */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30">
                <div className="flex flex-col items-center bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 rounded-full p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {icons.map((item, index) => (
                        <SidebarIcon
                            key={item.id}
                            Icon={item.icon}
                            isSelected={selectedIndex === index}
                            onClick={() => setSelectedIndex(index)}
                        />
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pl-24">
                {selectedIndex === 0 && (
                    <UploadView
                        uploadedImage={uploadedImage}
                        onImageUpload={setUploadedImage}
                    />
                )}

                {selectedIndex === 1 && (
                    <StyleView uploadedImage={uploadedImage} />
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
                    />
                )}

                {selectedIndex === 6 && (
                    <GenerateView />
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
