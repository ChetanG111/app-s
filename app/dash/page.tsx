"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ImagePlus,
    Smartphone,
    Type,
    TextCursor,
    Droplet,
    Layers,
    Sparkles,
    ChevronDown,
    MessageSquare,
    ChevronRight
} from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';

import { NotificationToast, useNotification } from '@/components/Notification';
import { ConfirmationModal, useConfirmation } from '@/components/ConfirmationModal';
import { ExportModal } from '@/components/ExportModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { SidebarIcon } from '@/components/SidebarIcon';
import { CombinedNav } from '@/components/CombinedNav';
import { TopNav } from '@/components/TopNav';
import { UserNav } from '@/components/UserNav';

import { UploadView } from '@/components/views/UploadView';
import { StyleView } from '@/components/views/StyleView';
import { TextView } from '@/components/views/TextView';
import { FontView } from '@/components/views/FontView';
import { ColorView } from '@/components/views/ColorView';
import { BackgroundView } from '@/components/views/BackgroundView';
import { GenerateView } from '@/components/views/GenerateView';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { notification, showNotification, hideNotification } = useNotification();
    const { confirmConfig, confirm, closeConfirm, handleConfirm } = useConfirmation();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState("Basic");
    const [headline, setHeadline] = useState("");
    const [selectedFont, setSelectedFont] = useState("standard");
    const [selectedColor, setSelectedColor] = useState("white");
    const [customColor, setCustomColor] = useState("#ffffff");
    const [selectedBg, setSelectedBg] = useState("charcoal");
    const [customBgPrompt, setCustomBgPrompt] = useState("");
    const [projectName, setProjectName] = useState("App-1");
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState<string | null>(null);
    const [generateBackground, setGenerateBackground] = useState(true);
    const [latestGeneratedImage, setLatestGeneratedImage] = useState<{ image: string; url: string } | null>(null);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [exportConfig, setExportConfig] = useState<{ isOpen: boolean; url: string | null }>({
        isOpen: false,
        url: null
    });

    // Aggressive caching: fetch once, only refetch after generation via mutate()
    const { data: creditsData } = useSWR('/api/credits', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        dedupingInterval: 60000, // Dedupe for 1 minute
    });
    const credits = creditsData?.credits ?? 0;

    // Redirect if not authenticated (after checking)
    React.useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Show loading indicator while checking session
    if (status === 'loading') {
        return (
            <div className="flex w-screen h-screen bg-[#050505] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    const handleGenerate = async () => {
        if (!uploadedImage) {
            showNotification("Please upload a screenshot first.", "warning");
            setSelectedIndex(0);
            return;
        }

        setIsGenerating(true);
        setCurrentStep("Creating overlay");

        try {
            // STEP 1: Warp
            const res1 = await fetch("/api/generate/step1-warp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    screenshot: uploadedImage,
                    style: selectedStyle
                }),
            });
            const data1 = await res1.json();
            if (!res1.ok) throw new Error(data1.error || "Step 1 failed");

            const tokenStep1 = data1.token;

            // STEP 2: Background
            setCurrentStep(generateBackground ? "Generating background" : "Processing...");
            const res2 = await fetch("/api/generate/step2-background", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image: data1.image,
                    backgroundId: selectedBg,
                    customBackground: customBgPrompt,
                    skipBackground: !generateBackground,
                    token: tokenStep1
                }),
            });
            const data2 = await res2.json();
            if (!res2.ok) throw new Error(data2.error || "Step 2 failed");

            const tokenStep2 = data2.token;

            // STEP 3: Text & Save
            setCurrentStep("Adding text");
            const res3 = await fetch("/api/generate/step3-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image: data2.image,
                    headline,
                    font: selectedFont,
                    color: selectedColor === 'custom' ? customColor : selectedColor,
                    style: selectedStyle,
                    backgroundId: selectedBg,
                    token: tokenStep2
                }),
            });
            const data3 = await res3.json();
            if (!res3.ok) throw new Error(data3.error || "Step 3 failed");

            // Store for instant display (base64 + supabase URL)
            if (data3.image && data3.url) {
                setLatestGeneratedImage({ image: data3.image, url: data3.url });
            }

            showNotification("Mockup generated successfully!", "success");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Generation failed";
            showNotification(errorMessage, "error");
        } finally {
            setIsGenerating(false);
            setCurrentStep(null);
            mutate('/api/credits');
            mutate('/api/outputs'); // Refresh outputs list
        }
    };

    const icons = [
        { id: 'upload', icon: ImagePlus },
        { id: 'style', icon: Smartphone },
        { id: 'background', icon: Layers },
        { id: 'text', icon: Type },
        { id: 'font', icon: TextCursor },
        { id: 'color', icon: Droplet },
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
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />

            {/* Top Navigation */}
            <div className="sm:hidden">
                <CombinedNav 
                    projectName={projectName} 
                    setProjectName={setProjectName} 
                    credits={credits} 
                    onFeedbackClick={() => setIsFeedbackOpen(true)}
                />
            </div>
            <div className="hidden sm:block">
                <TopNav projectName={projectName} setProjectName={setProjectName} credits={credits} />
                <UserNav />
            </div>

            {/* Sidebar UI */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 sm:left-6 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto sm:translate-x-0 z-30 flex items-center gap-3">
                <div className="flex flex-row sm:flex-col items-center bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 rounded-[22px] sm:rounded-full p-1 sm:p-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
                    {icons.map((item, index) => {
                        const isSelected = selectedIndex === index;
                        const isDisabled = !uploadedImage && index !== 0 && index !== (icons.length - 1);

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
                                    isDisabled={isDisabled}
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
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center sm:pl-24">
                {selectedIndex === 0 && (
                    <UploadView
                        onUpload={setUploadedImage}
                        currentImage={uploadedImage}
                        onNext={handleNext}
                        onNotify={showNotification}
                    />
                )}

                {selectedIndex === 1 && (
                    <StyleView
                        selected={selectedStyle}
                        onSelect={setSelectedStyle}
                        onNext={handleNext}
                    />
                )}

                {selectedIndex === 2 && (
                    <BackgroundView
                        selected={selectedBg}
                        onSelect={setSelectedBg}
                        customPrompt={customBgPrompt}
                        onCustomPromptChange={setCustomBgPrompt}
                        generateBackground={generateBackground}
                        onGenerateBackgroundChange={setGenerateBackground}
                        onNext={handleNext}
                    />
                )}

                {selectedIndex === 3 && (
                    <TextView
                        value={headline}
                        onChange={setHeadline}
                        onNext={handleNext}
                    />
                )}

                {selectedIndex === 4 && (
                    <FontView
                        selected={selectedFont}
                        onSelect={setSelectedFont}
                        onNext={handleNext}
                    />
                )}

                {selectedIndex === 5 && (
                    <ColorView
                        selected={selectedColor}
                        onSelect={setSelectedColor}
                        customColor={customColor}
                        onCustomColorChange={setCustomColor}
                        onNext={handleNext}
                    />
                )}

                {selectedIndex === 6 && (
                    <GenerateView
                        uploadedImage={uploadedImage}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                        currentStep={currentStep}
                        latestGeneratedImage={latestGeneratedImage}
                        settings={{
                            style: selectedStyle,
                            background: selectedBg,
                            headline
                        }}
                        onNotify={showNotification}
                        onConfirm={confirm}
                        onExport={(url) => setExportConfig({ isOpen: true, url })}
                    />
                )}


                {/* Universal Continue Button - Visible on all tabs except the last one */}
                {selectedIndex < icons.length - 1 && (
                    <div className="absolute bottom-10 left-0 right-0 hidden sm:flex justify-center sm:pl-24 pointer-events-none">
                        <button
                            onClick={handleNext}
                            disabled={selectedIndex === 0 && !uploadedImage}
                            className={`
                                pointer-events-auto flex items-center gap-3 px-12 py-4 rounded-full font-bold transition-all duration-300 group active:scale-95
                                ${selectedIndex === 0 && !uploadedImage
                                    ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                    : 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-black/20'
                                }
                            `}
                        >
                            Continue
                            <ChevronDown
                                size={20}
                                strokeWidth={3}
                                className={`transition-transform duration-300 ${selectedIndex === 0 && !uploadedImage ? 'opacity-20' : 'group-hover:translate-y-0.5'}`}
                            />
                        </button>
                    </div>
                )}
            </div>

            {/* Feedback Button */}
            <div className="absolute bottom-6 right-6 z-40 hidden sm:block">
                <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className="w-12 h-12 rounded-full bg-[#0c0c0c] border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    title="Give Feedback"
                >
                    <MessageSquare size={20} />
                </button>
            </div>
        </main>
    );
}