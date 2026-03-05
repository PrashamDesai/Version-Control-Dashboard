import React, { useState, useEffect, useRef } from 'react';
import {
    Users, Plus, Pencil, Trash2, Loader2, User, Phone, Mail,
    Camera, X, Check, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/** Resolve a relative /uploads/... path to a full URL */
const resolvePhoto = (url) =>
    url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : null;

/** Role badge colours */
const BADGE = {
    super_admin: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    admin: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    user: 'text-zinc-400 bg-zinc-800 border-zinc-700',
};

export default function Team() {
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);   // For linkedUserId dropdown (admin only)
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);  // TeamMember object being edited
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const stored = localStorage.getItem('userInfo');
    const currentUser = stored ? JSON.parse(stored)?.user : null;
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

    const [form, setForm] = useState(emptyForm());
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileRef = useRef(null);

    function emptyForm() {
        return { name: '', role: '', email: '', phone: '', linkedUserId: '' };
    }

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/team');
            setMembers(res.data.data || []);
        } catch {
            toast.error('Failed to load team');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data || []);
        } catch { /* Non-admins will 403 and that's fine */ }
    };

    useEffect(() => {
        fetchMembers();
        if (isAdmin) fetchUsers();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm());
        setPhotoFile(null);
        setPhotoPreview(null);
        setShowForm(true);
    };

    const openEdit = (m) => {
        setEditing(m);
        setForm({ name: m.name, role: m.role || '', email: m.email || '', phone: m.phone || '', linkedUserId: m.linkedUserId || '' });
        setPhotoFile(null);
        setPhotoPreview(resolvePhoto(m.photoUrl));
        setShowForm(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error('Name is required');
        try {
            setSaving(true);
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('role', form.role);
            fd.append('email', form.email);
            fd.append('phone', form.phone);
            if (form.linkedUserId) fd.append('linkedUserId', form.linkedUserId);
            if (photoFile) fd.append('photo', photoFile);

            if (editing) {
                await api.patch(`/team/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Team member updated');
            } else {
                await api.post('/team', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Team member added');
            }

            setShowForm(false);
            fetchMembers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/team/${confirmDelete._id}`);
            toast.success('Team member removed');
            setConfirmDelete(null);
            fetchMembers();
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users size={20} className="text-blue-400" /> Team
                    </h1>
                    <p className="text-zinc-400 text-sm mt-0.5">Meet the people behind the dashboard.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Plus size={15} /> Add Member
                    </button>
                )}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-zinc-500">
                    <Loader2 size={20} className="animate-spin mr-2" /> Loading team…
                </div>
            ) : members.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                    <Users size={32} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No team members yet.{isAdmin ? ' Add one to get started.' : ''}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map(m => (
                        <MemberCard
                            key={m._id}
                            member={m}
                            isAdmin={isAdmin}
                            onEdit={() => openEdit(m)}
                            onDelete={() => setConfirmDelete(m)}
                        />
                    ))}
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        className="bg-[#111113] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-zinc-100">
                                {editing ? 'Edit Team Member' : 'Add Team Member'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Photo upload */}
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="relative w-20 h-20 rounded-full cursor-pointer group"
                                onClick={() => fileRef.current?.click()}
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="" className="w-full h-full rounded-full object-cover border-2 border-zinc-700" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                                        <User size={28} className="text-zinc-500" />
                                    </div>
                                )}
                                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera size={18} className="text-white" />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">Click to upload photo</p>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Full name" />
                            <FormField label="Title / Role" value={form.role} onChange={v => setForm(p => ({ ...p, role: v }))} placeholder="e.g. Dev Lead" />
                            <FormField label="Email" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="name@co.com" />
                            <FormField label="Phone" type="tel" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+91 98765..." />
                        </div>

                        {/* Link to a user account */}
                        {users.length > 0 && (
                            <div className="space-y-1.5">
                                <label className="text-xs text-zinc-500">Link to account (for "logged in" indicator)</label>
                                <select
                                    value={form.linkedUserId}
                                    onChange={e => setForm(p => ({ ...p, linkedUserId: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">— None —</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.email || u.phone})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-3 justify-end pt-1 border-t border-zinc-800/50">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                {saving && <Loader2 size={13} className="animate-spin" />}
                                {editing ? 'Save Changes' : 'Add Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDelete}
                title={`Remove "${confirmDelete?.name}"?`}
                message="This team member card will be permanently removed."
                confirmLabel="Remove"
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
}

function MemberCard({ member, isAdmin, onEdit, onDelete }) {
    const photo = resolvePhoto(member.photoUrl);

    return (
        <div className={`relative bg-zinc-900/60 border rounded-xl p-5 flex flex-col items-center text-center gap-3 transition-all hover:border-zinc-700 ${member.isCurrentUser ? 'border-blue-500/40 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]' : 'border-zinc-800'
            }`}>
            {/* "You" indicator */}
            {member.isCurrentUser && (
                <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center gap-1">
                    <Star size={9} /> You
                </span>
            )}

            {/* Admin actions */}
            {isAdmin && (
                <div className="absolute top-2 left-2 flex gap-1">
                    <button onClick={onEdit} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors" title="Edit">
                        <Pencil size={12} />
                    </button>
                    <button onClick={onDelete} className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Remove">
                        <Trash2 size={12} />
                    </button>
                </div>
            )}

            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden border-2 border-zinc-700 flex-shrink-0">
                {photo ? (
                    <img src={photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                    <User size={24} className="text-zinc-400" />
                )}
            </div>

            {/* Info */}
            <div className="space-y-1 min-w-0 w-full">
                <p className="font-semibold text-sm text-white truncate">{member.name}</p>
                {member.role && <p className="text-xs text-zinc-400">{member.role}</p>}
            </div>

            {/* Contact details */}
            <div className="w-full space-y-1.5 text-left">
                {member.email && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Mail size={11} className="text-zinc-600 flex-shrink-0" />
                        <a href={`mailto:${member.email}`} className="truncate hover:text-zinc-200 transition-colors">{member.email}</a>
                    </div>
                )}
                {member.phone && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Phone size={11} className="text-zinc-600 flex-shrink-0" />
                        <a href={`tel:${member.phone}`} className="hover:text-zinc-200 transition-colors">{member.phone}</a>
                    </div>
                )}
            </div>
        </div>
    );
}

function FormField({ label, value, onChange, placeholder, type = 'text' }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
            />
        </div>
    );
}
