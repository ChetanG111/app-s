"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NotificationToast, useNotification } from '../components/Notification';
import { ConfirmationModal, useConfirmation } from '../components/ConfirmationModal';
import { ExportModal } from '../components/ExportModal';
import {
    ImagePlus,
    Smartphone,
    Type,
    TextCursor,
    Droplet,
    Layers,
    Sparkles,
    ChevronDown
} from 'lucide-react';

import { SidebarIcon } from '../components/SidebarIcon';
import { TopNav } from '../components/TopNav';
import { UploadView } from '../components/views/UploadView';
import { StyleView } from '../components/views/StyleView';
import { TextView } from '../components/views/TextView';
import { FontView } from '../components/views/FontView';
import { ColorView } from '../components/views/ColorView';
import { BackgroundView } from '../components/views/BackgroundView';
import { GenerateView } from '../components/views/GenerateView';

export default function Home() {
    const { notification, showNotification, hideNotification } = useNotification();
    const { confirmConfig, confirm, closeConfirm, handleConfirm } = useConfirmation();
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
    const [exportConfig, setExportConfig] = useState<{ isOpen: boolean; url: string | null }>({
        isOpen: false,
        url: null
    });

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
            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmLabel={confirmConfig.confirmLabel}
                cancelLabel={confirmConfig.cancelLabel}
                isDanger={confirmConfig.isDanger}
                onConfirm={handleConfirm}
                onCancel={closeConfirm}
            />
            <ExportModal
                isOpen={exportConfig.isOpen}
                imageUrl={exportConfig.url}
                onClose={() => setExportConfig({ ...exportConfig, isOpen: false })}
                onNotify={showNotification}
            />
            {/* Top Navigation */}
            <TopNav projectName={projectName} setProjectName={setProjectName} />

            {/* Sidebar UI */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30">
                <div className="flex flex-col items-center bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 rounded-full p-2">
                    {icons.map((item, index) => {
                        const isSelected = selectedIndex === index;
                        return (
                            <div key={item.id} className="relative">
                                {isSelected && (
                                    <motion.div
                                        layoutId="sidebar-pill"
                                        className="absolute inset-0 bg-white rounded-full"
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
                        onConfirm={confirm}
                        onExport={(url) => setExportConfig({ isOpen: true, url })}
                    />
                )}


                {/* Universal Continue Button - Visible on all tabs except the last one */}
                {selectedIndex < icons.length - 1 && (
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center pl-24 pointer-events-none">
                        <button
                            onClick={handleNext}
                            className="pointer-events-auto flex items-center gap-3 bg-white hover:bg-zinc-200 text-black px-12 py-4 rounded-full font-bold transition-all duration-300 group active:scale-95"
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