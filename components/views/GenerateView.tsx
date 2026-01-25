import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Download, Trash2 } from 'lucide-react';
import { NotificationType } from '../Notification';
import { isImageLoaded, markImageLoaded } from '@/lib/imageCache';
import useSWR from 'swr';

const PRIORITY_COUNT = 7; // First 7 images load instantly

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface GenerateViewProps {
    uploadedImage: string | null;
    onGenerate: () => Promise<{ image?: string; url?: string } | void>;
    isGenerating: boolean;
    currentStep: string | null;
    latestGeneratedImage?: { image: string; url: string; language?: string } | null; // For instant display
    settings: {
        style: string;
        background: string;
        headline: string;
        languages: string[];
    };
    creditCost?: number;
    onNotify?: (message: string, type: NotificationType) => void;
    onConfirm?: (options: { title: string; message: string; isDanger?: boolean; onConfirm: () => void }) => void;
    onExport?: (url: string, language?: string) => void;
}

interface HistoryItem {
    name: string;
    url: string;
    createdAt: string;
    language?: string;
}

export const GenerateView: React.FC<GenerateViewProps> = ({
    uploadedImage,
    onGenerate,
    isGenerating,
    currentStep,
    latestGeneratedImage,
    settings,
    creditCost = 1,
    onNotify,
    onConfirm,
    onExport
}) => {
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [optimisticImage, setOptimisticImage] = useState<{ image: string; url: string; language?: string } | null>(null);
    const [loadedOutputImages, setLoadedOutputImages] = useState<Set<string>>(() => {
        // Initialize from global cache to prevent shimmer on revisit
        const cached = new Set<string>();
        return cached;
    });

    // Update optimistic image when a new one is generated
    React.useEffect(() => {
        if (latestGeneratedImage) {
            setOptimisticImage(latestGeneratedImage);
            // Mark as loaded immediately since we have the base64
            setLoadedOutputImages(prev => new Set(prev).add(latestGeneratedImage.url));
        }
    }, [latestGeneratedImage]);


    // Aggressive caching: fetch once, only refetch after generation via mutateOutputs()
    const { data: outputsData, mutate: mutateOutputs } = useSWR<{ files: HistoryItem[] }>(
        '/api/outputs',
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateIfStale: false,
            dedupingInterval: 60000, // Dedupe for 1 minute
        }
    );

    // Merge optimistic image with fetched history for instant display
    const history = React.useMemo(() => {
        const fetchedHistory = outputsData?.files ?? [];
        if (!optimisticImage) return fetchedHistory;
        // Check if optimistic image is already in fetched history
        const alreadyExists = fetchedHistory.some(h => h.url === optimisticImage.url);
        if (alreadyExists) return fetchedHistory;
        // Prepend optimistic image
        return [
            { name: 'Latest', url: optimisticImage.url, createdAt: new Date().toISOString(), language: optimisticImage.language },
            ...fetchedHistory
        ];
    }, [outputsData?.files, optimisticImage]);

    const handleOutputImageLoad = (url: string) => {
        markImageLoaded(url);
        setLoadedOutputImages(prev => new Set(prev).add(url));
    };

    // Handle image load errors - still mark as "loaded" to hide shimmer
    const handleOutputImageError = (url: string) => {
        setLoadedOutputImages(prev => new Set(prev).add(url));
    };

    // Simplified 4-state UI sequence
    const uiSteps = [
        "Creating Overlay",
        "Background Generation",
        "Translating",
        "Adding Text",
        "Verifying"
    ];

    /**
     * Map complex backend states to our simple 4-state UI.
     * This prevents the "jumping" sensation by consolidating multiple steps.
     */
    const getCurrentStepIndex = () => {
        if (!currentStep) return 0;

        switch (currentStep) {
            case "Creating overlay":
            case "Verifying":
                return 0;
            case "Generating background":
                return 1;
            case (currentStep.startsWith("Translating") ? currentStep : null):
                return 2;
            case "Adding text":
                return 3;
            case "Cleaning up":
                return 4;
            default:
                return 0;
        }
    };

    const stepIndex = getCurrentStepIndex();

    // Refresh outputs when generation completes
    useEffect(() => {
        if (!isGenerating) {
            mutateOutputs();
        }
    }, [isGenerating, mutateOutputs]);

    const onGenerateClick = async () => {
        await onGenerate();
        mutateOutputs();
    };

    const handleDelete = async (fileUrl: string) => {
        if (!onConfirm) {
            // Fallback if onConfirm not provided
            try {
                const response = await fetch("/api/outputs/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ filenames: [fileUrl] }),
                });
                if (response.ok) {
                    mutateOutputs();
                    if (onNotify) onNotify("Image deleted successfully", "success");
                }
            } catch (err) {
                console.error("Failed to delete file:", err);
                if (onNotify) onNotify("Failed to delete image", "error");
            }
            return;
        }

        onConfirm({
            title: "Delete Image",
            message: "Are you sure you want to delete this image? This action cannot be undone.",
            isDanger: true,
            onConfirm: async () => {
                try {
                    const response = await fetch("/api/outputs/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ filenames: [fileUrl] }),
                    });

                    if (response.ok) {
                        mutateOutputs();
                        if (onNotify) onNotify("Image deleted successfully", "success");
                    }
                } catch (err) {
                    console.error("Failed to delete file:", err);
                    if (onNotify) onNotify("Failed to delete image", "error");
                }
            }
        });
    };

    const handleCloseViewer = () => setViewingImage(null);

    return (
        <div className="flex flex-col items-center w-full h-full max-w-6xl mx-auto px-6 animate-in fade-in zoom-in duration-500 pt-24 pb-32 overflow-y-auto">
            {/* Full Screen Image Viewer Modal */}
            {viewingImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300 cursor-pointer"
                    onClick={handleCloseViewer}
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />
                    <div className="relative z-[110] max-w-full max-h-full flex items-center justify-center animate-in zoom-in duration-400">
                        <Image
                            src={viewingImage}
                            alt="Full screen preview"
                            width={1200}
                            height={1200}
                            className="max-w-full max-h-[70vh] sm:max-h-[85vh] object-contain rounded-2xl"
                            unoptimized
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center gap-8 w-full">
                <div className="w-full">
                    <div className="flex items-center justify-center sm:justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 text-center sm:text-left">
                            Recent Generations
                            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md font-mono">
                                {history.length}
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <button
                            onClick={onGenerateClick}
                            disabled={isGenerating || !uploadedImage}
                            className={`
                                relative aspect-[9/16] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 group
                                ${isGenerating
                                    ? 'border-zinc-800 bg-black/10 opacity-40 cursor-wait'
                                    : !uploadedImage
                                        ? 'border-zinc-800 bg-black/20 opacity-60 cursor-not-allowed'
                                        : 'border-zinc-800 hover:border-zinc-500 bg-black/40 hover:bg-white/5 cursor-pointer'
                                }
                            `}
                        >
                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                                <Plus className="text-zinc-500 group-hover:text-white" size={32} strokeWidth={2} />
                            </div>
                            <span className="text-zinc-400 group-hover:text-white font-bold text-lg">Generate</span>
                            {creditCost > 0 && (
                                <span className="flex items-center gap-1 mt-1 text-xs">
                                    <svg className="w-3 h-3 text-blue-400 fill-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-zinc-500">{creditCost} credit{creditCost !== 1 ? 's' : ''}</span>
                                </span>
                            )}
                            {!uploadedImage && <span className="text-zinc-600 text-[10px] uppercase tracking-widest mt-2">Upload Required</span>}
                        </button>

                        {isGenerating && (
                            <div className="relative aspect-[9/16] bg-zinc-900/50 rounded-[2.5rem] overflow-hidden border-2 border-blue-500/20 animate-pulse">
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Generating</p>
                                    <p className="text-white font-medium text-sm transition-all duration-500">{uiSteps[stepIndex]}...</p>
                                    <div className="flex gap-1 mt-3">
                                        {uiSteps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded-full transition-all duration-700 ${i <= stepIndex ? 'w-6 bg-blue-500 opacity-100' : 'w-1 bg-zinc-800 opacity-40'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {history.map((file, index) => {
                            // Check both local state and global cache
                            const isLoaded = loadedOutputImages.has(file.url) || isImageLoaded(file.url);
                            // First 7 images get priority loading, rest are lazy-loaded
                            const isPriority = index < PRIORITY_COUNT;
                            return (
                                <div
                                    key={file.name}
                                    onClick={() => setViewingImage(file.url)}
                                    className="group relative aspect-[9/16] bg-zinc-900/50 rounded-[2.5rem] overflow-hidden transition-all duration-300 border-2 border-transparent hover:border-zinc-700 cursor-pointer"
                                >
                                    <Image
                                        src={file.url}
                                        alt={file.name}
                                        fill
                                        priority={isPriority}
                                        onLoad={() => handleOutputImageLoad(file.url)}
                                        onError={() => handleOutputImageError(file.url)}
                                        className={`object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Language Label */}
                                    {file.language && (
                                        <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-20 pointer-events-none">
                                            <span className="px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white text-[10px] font-bold uppercase tracking-wider shadow-lg capitalize">
                                                {file.language}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 sm:top-6 sm:right-6 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-auto sm:pointer-events-none sm:group-hover:pointer-events-auto transition-all duration-300 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onExport) onExport(file.url, file.language);
                                            }}
                                            className="p-2.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all hover:scale-110 active:scale-95"
                                            title="Export"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(file.url);
                                            }}
                                            className="p-2.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-red-500 hover:text-white hover:border-red-500 transition-all hover:scale-110 active:scale-95"
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
                            );
                        })}
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
