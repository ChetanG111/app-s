import React, { useState, useEffect } from 'react';
import { X, Plus, Download, Trash2 } from 'lucide-react';
import { NotificationType } from '../Notification';

interface GenerateViewProps {
    uploadedImage: string | null;
    isGenerating: boolean;
    handleGenerate: () => Promise<void>;
    onNotify: (message: string, type: NotificationType) => void;
    onConfirm: (options: { title: string; message: string; isDanger?: boolean; onConfirm: () => void }) => void;
    onExport: (url: string) => void;
}

export const GenerateView: React.FC<GenerateViewProps> = ({
    uploadedImage,
    isGenerating,
    handleGenerate,
    onNotify,
    onConfirm,
    onExport
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
        if (!isGenerating) {
            fetchHistory();
        }
    }, [isGenerating]); // Refresh history whenever generation state changes (especially when it finishes)

    const onGenerateClick = async () => {
        await handleGenerate();
        fetchHistory();
    };

    const handleDelete = async (fileUrl: string) => {
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
                        fetchHistory();
                        onNotify("Image deleted successfully", "success");
                    }
                } catch (err) {
                    console.error("Failed to delete file:", err);
                    onNotify("Failed to delete image", "error");
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
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
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
                                        ? 'border-zinc-800 bg-black/20 opacity-60 cursor-not-allowed'
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
                                            onExport(file.url);
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
