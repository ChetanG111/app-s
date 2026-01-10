"use client";

import { useState } from "react";
import { 
    Type, 
    Palette, 
    Layout, 
    ImagePlus, 
    Wand2,
    Settings as SettingsIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { NotificationToast, useNotification } from "@/components/Notification";
import { ConfirmationModal, useConfirmation } from "@/components/ConfirmationModal";
import { ExportModal } from "@/components/ExportModal";

import { UploadView } from "@/components/views/UploadView";
import { StyleView } from "@/components/views/StyleView";
import { BackgroundView } from "@/components/views/BackgroundView";
import { TextView } from "@/components/views/TextView";
import { FontView } from "@/components/views/FontView";
import { ColorView } from "@/components/views/ColorView";
import { GenerateView } from "@/components/views/GenerateView";
import { TopNav } from "@/components/TopNav";
import { SidebarIcon } from "@/components/SidebarIcon";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
    const { data: session } = useSession();
    const { notification, showNotification, hideNotification } = useNotification();
    const { confirmConfig, confirm, closeConfirm, handleConfirm } = useConfirmation();
    
    const [activeTab, setActiveTab] = useState('upload');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState('Basic');
    const [selectedBg, setSelectedBg] = useState('charcoal');
    const [customBgPrompt, setCustomBgPrompt] = useState('');
    const [generateBackground, setGenerateBackground] = useState(true);
    const [headline, setHeadline] = useState('');
    const [selectedFont, setSelectedFont] = useState('standard');
    const [selectedColor, setSelectedColor] = useState('white');
    const [projectName, setProjectName] = useState("App-1");
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState<string | null>(null);

    const [exportConfig, setExportConfig] = useState<{ isOpen: boolean; url: string | null }>({
        isOpen: false,
        url: null
    });

    // Use SWR for credits to prevent flicker and handle caching
    const { data: creditsData } = useSWR('/api/credits', fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 2000,
    });
    const credits = creditsData?.credits ?? 0;
    const handleGenerate = async () => {
        if (!uploadedImage) {
            showNotification("Please upload an image first", "error");
            setActiveTab('upload');
            return;
        }

        setIsGenerating(true);
        setCurrentStep("Creating overlay");

        try {
            // STEP 1: Warp (Deducts Credit & Creates Pending Transaction)
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

            // STEP 3: Text & Save (Completes Transaction)
            setCurrentStep("Adding text");
            const res3 = await fetch("/api/generate/step3-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image: data2.image,
                    headline,
                    font: selectedFont,
                    color: selectedColor,
                    style: selectedStyle,
                    backgroundId: selectedBg,
                    token: tokenStep2
                }),
            });
            const data3 = await res3.json();
            if (!res3.ok) throw new Error(data3.error || "Step 3 failed");

            showNotification("Mockup generated successfully!", "success");

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Generation failed";
            showNotification(errorMessage, "error");
        } finally {
            setIsGenerating(false);
            setCurrentStep(null);
            mutate('/api/credits'); 
        }
    };

        const icons = [

            { id: 'upload', icon: ImagePlus },

            { id: 'style', icon: Layout },

            { id: 'background', icon: Wand2 },

            { id: 'text', icon: Type },

            { id: 'font', icon: Palette },

            { id: 'color', icon: SettingsIcon },

            { id: 'generate', icon: Wand2 },

        ];

    

        return (

            <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden">

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

    

                {/* Sidebar */}

                <div className="w-20 border-r border-white/5 flex flex-col items-center py-8 gap-8">

                    {icons.map((item) => (

                        <SidebarIcon 

                            key={item.id}

                            Icon={item.icon}

                            isSelected={activeTab === item.id}

                            onClick={() => setActiveTab(item.id)}

                        />

                    ))}

                </div>

    

                {/* Main Content */}

                <div className="flex-1 flex flex-col">

                    <TopNav 

                        projectName={projectName} 

                        setProjectName={setProjectName} 

                        credits={credits} 

                    />

    

                    <div className="flex-1 p-8 overflow-y-auto">

                        <div className="max-w-4xl mx-auto">

                            {activeTab === 'upload' && (

                                <UploadView 

                                    onUpload={setUploadedImage} 

                                    currentImage={uploadedImage}

                                    onNext={() => setActiveTab('style')}

                                />

                            )}

                            {activeTab === 'style' && (

                                <StyleView 

                                    selected={selectedStyle} 

                                    onSelect={setSelectedStyle} 

                                    onNext={() => setActiveTab('background')}

                                />

                            )}

                            {activeTab === 'background' && (

                                <BackgroundView 

                                    selected={selectedBg} 

                                    onSelect={setSelectedBg}

                                    customPrompt={customBgPrompt}

                                    onCustomPromptChange={setCustomBgPrompt}

                                    generateBackground={generateBackground}

                                    onGenerateBackgroundChange={setGenerateBackground}

                                    onNext={() => setActiveTab('text')}

                                />

                            )}

                            {activeTab === 'text' && (

                                <TextView 

                                    value={headline} 

                                    onChange={setHeadline}

                                    onNext={() => setActiveTab('font')}

                                />

                            )}

                            {activeTab === 'font' && (

                                <FontView 

                                    selected={selectedFont} 

                                    onSelect={setSelectedFont}

                                    onNext={() => setActiveTab('color')}

                                />

                            )}

                            {activeTab === 'color' && (

                                <ColorView 

                                    selected={selectedColor} 

                                    onSelect={setSelectedColor}

                                    onNext={() => setActiveTab('generate')}

                                />

                            )}

                            {activeTab === 'generate' && (

                                <GenerateView 

                                    uploadedImage={uploadedImage}

                                    onGenerate={handleGenerate}

                                    isGenerating={isGenerating}

                                    currentStep={currentStep}

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

                        </div>

                    </div>

                </div>

            </div>

        );

    }

    