import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Modal({ isOpen, onClose, title, children, className }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 backdrop-blur-sm p-4">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />

            <div className={cn("relative z-10 w-full max-w-lg bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl flex flex-col", className)}>
                <div className="flex items-center justify-between p-4 border-b border-zinc-800/80">
                    <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[80vh]">
                    {children}
                </div>
            </div>
        </div>
    );
}
