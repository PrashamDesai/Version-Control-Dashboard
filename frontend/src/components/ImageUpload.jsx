import React, { useState, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ImageUpload({ onImageSelect, previewUrl }) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(previewUrl || null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type.match('image.*')) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            if (onImageSelect) onImageSelect(file);
        }
    };

    return (
        <div className="w-full">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 transition-colors flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden",
                    dragActive ? "border-blue-500 bg-blue-500/5" : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30",
                    preview && "border-solid border-zinc-700 p-2"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload').click()}
            >
                <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    onChange={handleChange}
                />

                {preview ? (
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden group">
                        <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-xs font-medium text-white shadow">Change Image</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-blue-500">
                            <UploadCloud size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-300">Click or drag image to upload</p>
                            <p className="text-xs text-zinc-500 mt-1">PNG, JPG or WEBP (Max 2MB)</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
