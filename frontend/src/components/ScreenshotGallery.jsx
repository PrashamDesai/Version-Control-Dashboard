import React, { useState, useRef } from 'react';
import {
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Plus,
    Loader2,
    Smartphone,
    MonitorPlay,
    X,
    Maximize2
} from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../services/api';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';

export default function ScreenshotGallery({ gameId, screenshots = [], isAdmin, onUpdate, platform = 'android' }) {
    const [uploading, setUploading] = useState(false);
    const [deleteUrl, setDeleteUrl] = useState(null);
    const [orientation, setOrientation] = useState(() => localStorage.getItem('screenshot_orientation') || 'landscape');
    const [selectedImage, setSelectedImage] = useState(null);

    // Persist orientation selection
    React.useEffect(() => {
        localStorage.setItem('screenshot_orientation', orientation);
    }, [orientation]);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    const isIos = platform.toLowerCase() === 'ios';
    const PlatformIcon = isIos ? MonitorPlay : Smartphone;
    const accentColor = isIos ? 'text-violet-400' : 'text-emerald-400';
    const bgColor = isIos ? 'bg-violet-600' : 'bg-emerald-600';
    const shadowColor = isIos ? 'shadow-violet-500/10' : 'shadow-emerald-500/10';

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: direction === 'left' ? -400 : 400, behavior: 'smooth' });
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('screenshots', file));
        try {
            const res = await api.post(`/games/${gameId}/upload-screenshots/${platform}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUpdate(res.data.data.screenshots);
            toast.success(`${platform.toUpperCase()} screenshots uploaded!`);
        } catch (err) {
            toast.error('Failed to upload screenshots');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async () => {
        try {
            const res = await api.delete(`/games/${gameId}/delete-screenshot/${platform}`, {
                data: { screenshotUrl: deleteUrl }
            });
            onUpdate(res.data.data);
            toast.success('Screenshot removed');
        } catch {
            toast.error('Failed to delete screenshot');
        } finally {
            setDeleteUrl(null);
        }
    };

    return (
        <>
            {/* Gallery Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-800/50 relative">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                    {/* Platform Info */}
                    <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10", accentColor)}>
                            <PlatformIcon size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
                                {isIos ? 'iOS' : 'Android'} Screenshots
                            </h2>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                {screenshots.length} Images
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        {/* Landscape / Portrait toggle — shown only when there are screenshots */}
                        {screenshots.length > 0 && (
                            <div className="flex items-center bg-zinc-900/50 rounded-lg p-1 border border-white/5">
                                {['landscape', 'portrait'].map(o => (
                                    <button
                                        key={o}
                                        onClick={() => setOrientation(o)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all",
                                            orientation === o ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        {o}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Upload button — admin only */}
                        {isAdmin && (
                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                                <button
                                    disabled={uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-lg active:scale-95 disabled:bg-zinc-800 disabled:shadow-none",
                                        bgColor,
                                        shadowColor
                                    )}
                                >
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                    Upload {isIos ? 'iOS' : 'Android'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {screenshots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center">
                        <ImageIcon size={32} className="text-zinc-600 mb-3" />
                        <p className="text-sm text-zinc-500 font-medium">No {platform} screenshots yet.</p>
                    </div>
                ) : (
                    <div className="group/carousel relative">
                        {/* Scroll nav buttons */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute -left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-700 text-white flex items-center justify-center z-10 opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-zinc-800 shadow-2xl"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-700 text-white flex items-center justify-center z-10 opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-zinc-800 shadow-2xl"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Scrollable strip */}
                        <div
                            ref={scrollRef}
                            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {screenshots.map((url, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "relative flex-shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 snap-start group/item cursor-pointer transition-all",
                                        orientation === 'landscape' ? "w-72 aspect-[16/9]" : "w-40 aspect-[9/16]"
                                    )}
                                    onClick={() => setSelectedImage(url)}
                                >
                                    <img
                                        src={`http://localhost:5000${url}`}
                                        alt={`${platform} screen ${i + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                                    />

                                    {/* Expand hint overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <Maximize2 size={24} className="text-white drop-shadow-lg" />
                                    </div>

                                    {/* Delete button — admin only, stops propagation to prevent modal open */}
                                    {isAdmin && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteUrl(url); }}
                                            className="absolute top-3 right-3 p-2 bg-red-600/90 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover/item:opacity-100 transition-all scale-90 group-hover/item:scale-100 shadow-xl"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <ConfirmDialog
                    isOpen={!!deleteUrl}
                    title={`Delete ${platform.toUpperCase()} Screenshot?`}
                    message="Are you sure you want to remove this image? This action cannot be undone."
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteUrl(null)}
                />
            </div>

            {/* Fullscreen viewer modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={`http://localhost:5000${selectedImage}`}
                        alt="Fullscreen screenshot"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
