import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Phone, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

/**
 * ProfileEditModal – lets the user update their phone number and avatar.
 * Props:
 *   isOpen    boolean
 *   user      { _id, name, email, phone, avatarUrl, role }
 *   onClose   () => void
 *   onUpdated (updatedUser) => void  – called with fresh user data after save
 */
export default function ProfileEditModal({ isOpen, user, onClose, onUpdated }) {
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef(null);

    // Sync state when modal opens or user data changes (like after fetchMe or login)
    useEffect(() => {
        if (isOpen) {
            setPhone(user?.phone || '');
            setAvatarPreview(user?.avatarUrl || null);
            setAvatarFile(null); // reset file selection
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const formData = new FormData();
            if (phone !== (user?.phone || '')) formData.append('phone', phone);
            if (avatarFile) formData.append('avatar', avatarFile);

            await api.patch('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Re-fetch canonical user data from DB to avoid stale local state
            const meRes = await api.get('/auth/me');
            const fresh = meRes.data.data;

            // Persist to localStorage so sidebars and other components reflect changes
            const storedStr = localStorage.getItem('userInfo');
            if (storedStr) {
                const stored = JSON.parse(storedStr);
                stored.user = { ...stored.user, ...fresh, id: fresh._id };
                localStorage.setItem('userInfo', JSON.stringify(stored));
            }

            toast.success('Profile updated');
            onUpdated?.(fresh);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Resolve avatar URL – handle both relative backend paths and full URLs
    const resolvedAvatar = avatarPreview?.startsWith('http')
        ? avatarPreview
        : avatarPreview
            ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${avatarPreview}`
            : null;

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Panel */}
            <div
                className="bg-[#111113] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-100">Edit Profile</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="relative w-20 h-20 rounded-full cursor-pointer group"
                        onClick={() => fileRef.current?.click()}
                    >
                        {resolvedAvatar ? (
                            <img
                                src={resolvedAvatar}
                                alt="avatar"
                                className="w-full h-full rounded-full object-cover border-2 border-zinc-700"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                                <User size={28} className="text-zinc-500" />
                            </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={18} className="text-white" />
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500">Click to change photo</p>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Read-only info */}
                <div className="space-y-1.5">
                    <p className="text-xs text-zinc-500">Name</p>
                    <p className="text-sm text-zinc-300 font-medium">{user?.name || '—'}</p>
                </div>
                {user?.email && (
                    <div className="space-y-1.5">
                        <p className="text-xs text-zinc-500">Email</p>
                        <p className="text-sm text-zinc-300 font-medium">{user.email}</p>
                    </div>
                )}

                {/* Editable phone */}
                <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 flex items-center gap-1">
                        <Phone size={11} /> Phone
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none transition-colors"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-1 border-t border-zinc-800/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        {saving && <Loader2 size={13} className="animate-spin" />}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

