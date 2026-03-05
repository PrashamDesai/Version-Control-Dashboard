import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * ConfirmDialog – a custom in-app confirmation modal.
 * Props:
 *   isOpen       boolean
 *   title        string
 *   message      string
 *   confirmLabel string  (default "Delete")
 *   danger       boolean (default true) – red confirm button vs blue
 *   onConfirm    () => void
 *   onCancel     () => void
 */
export default function ConfirmDialog({
    isOpen,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Delete',
    danger = true,
    onConfirm,
    onCancel,
}) {
    if (!isOpen) return null;

    return createPortal(
        // Backdrop
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
        >
            {/* Panel */}
            <div
                className="bg-[#111113] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
            >
                {/* Icon + title */}
                <div className="flex items-start gap-4">
                    <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        danger ? 'bg-red-500/10 border border-red-500/20' : 'bg-blue-500/10 border border-blue-500/20'
                    )}>
                        <AlertTriangle size={18} className={danger ? 'text-red-400' : 'text-blue-400'} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{message}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-1">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                            danger
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
                        )}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
