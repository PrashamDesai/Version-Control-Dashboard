import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Bug, Plus, X, Loader2, User, ChevronDown, Paperclip,
    AlertCircle, Repeat2, MapPin, PlayCircle, Pencil, Trash2, Image,
} from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || '';

const FREQ_OPTIONS = ['Always', 'Often', 'Sometimes', 'Rarely'];

const STATUS_OPTIONS = ['Open', 'In Progress', 'Fixed', 'Closed', 'Wont Fix'];

const STATUS_STYLES = {
    Open: 'text-red-400 bg-red-500/10 border-red-500/30',
    'In Progress': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Fixed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Closed: 'text-zinc-400 bg-zinc-800 border-zinc-700',
    'Wont Fix': 'text-zinc-500 bg-zinc-900 border-zinc-800',
};

const FREQ_STYLES = {
    Always: 'text-red-400',
    Often: 'text-orange-400',
    Sometimes: 'text-amber-400',
    Rarely: 'text-zinc-400',
};

const resolveUrl = (url) =>
    url?.startsWith('http') ? url : `${BASE_URL}${url}`;

export default function QABug() {
    const { slug } = useParams();
    const [gameId, setGameId] = useState(null);
    const [bugs, setBugs] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Form state
    const [form, setForm] = useState(emptyForm());
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const mediaRef = useRef(null);

    // Current logged-in user from localStorage
    const stored = localStorage.getItem('userInfo');
    const currentUser = stored ? JSON.parse(stored)?.user : null;

    function emptyForm() {
        return { title: '', where: '', how: '', frequency: '', assignedTo: '', status: 'Open' };
    }

    // Resolve gameId from slug
    const fetchGameId = async () => {
        try {
            const res = await api.get('/games');
            const game = (res.data.data || []).find(g => g.slug === slug);
            if (game) setGameId(game._id);
        } catch { /* ignore */ }
    };

    const fetchBugs = async (id) => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await api.get(`/games/${id}/bugs`);
            setBugs(res.data.data || []);
        } catch {
            toast.error('Failed to load bugs');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeam = async () => {
        try {
            const res = await api.get('/team');
            setTeamMembers(res.data.data || []);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        fetchGameId();
        fetchTeam();
    }, [slug]);

    useEffect(() => {
        if (gameId) fetchBugs(gameId);
    }, [gameId]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm());
        setMediaFiles([]);
        setMediaPreviews([]);
        setShowForm(true);
    };

    const openEdit = (bug) => {
        setEditing(bug);
        setForm({
            title: bug.title || '',
            where: bug.where,
            how: bug.how,
            frequency: bug.frequency,
            assignedTo: bug.assignedTo?._id || '',
            status: bug.status,
        });
        setMediaFiles([]);
        setMediaPreviews([]);
        setShowForm(true);
    };

    const handleMediaSelect = (e) => {
        const files = Array.from(e.target.files);
        setMediaFiles(prev => [...prev, ...files]);
        const previews = files.map(f => ({
            url: URL.createObjectURL(f),
            type: f.type.startsWith('video/') ? 'video' : 'image',
            name: f.name,
        }));
        setMediaPreviews(prev => [...prev, ...previews]);
    };

    const removePreview = (idx) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== idx));
        setMediaPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (!form.title.trim()) return toast.error('Bug title is required');
        if (!form.assignedTo) return toast.error('Assigning the bug is required');
        if (!form.frequency) return toast.error('Please select a frequency');
        if (!gameId) return toast.error('Game not found');

        try {
            setSaving(true);
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('where', form.where);
            fd.append('how', form.how);
            fd.append('frequency', form.frequency);
            fd.append('status', form.status);
            if (form.assignedTo) fd.append('assignedTo', form.assignedTo);
            mediaFiles.forEach(f => fd.append('media', f));

            if (editing) {
                await api.patch(`/games/${gameId}/bugs/${editing._id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Bug updated');
            } else {
                await api.post(`/games/${gameId}/bugs`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Bug reported');
            }

            setShowForm(false);
            fetchBugs(gameId);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save bug');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/games/${gameId}/bugs/${confirmDelete._id}`);
            toast.success('Bug deleted');
            setConfirmDelete(null);
            fetchBugs(gameId);
        } catch {
            toast.error('Failed to delete bug');
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Bug size={20} className="text-red-400" /> QA Bug Tracker
                    </h1>
                    <p className="text-zinc-400 text-sm mt-0.5">Report and track bugs for this game.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={15} /> Report Bug
                </button>
            </div>

            {/* Bug list */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-zinc-500">
                    <Loader2 size={20} className="animate-spin mr-2" /> Loading bugs…
                </div>
            ) : bugs.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                    <Bug size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No bugs reported yet. Great job! 🎉</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {bugs.map(bug => (
                        <BugCard
                            key={bug._id}
                            bug={bug}
                            currentUser={currentUser}
                            onEdit={() => openEdit(bug)}
                            onDelete={() => setConfirmDelete(bug)}
                            onStatusChange={async (status) => {
                                try {
                                    await api.patch(`/games/${gameId}/bugs/${bug._id}`, { status });
                                    toast.success('Status updated');
                                    fetchBugs(gameId);
                                } catch (err) { toast.error(err.response?.data?.message || 'Status update failed'); }
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Bug Form Modal */}
            {showForm && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        className="bg-[#111113] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col w-full max-w-5xl h-full max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header (Sticky) */}
                        <div className="flex-none flex items-center justify-between p-5 border-b border-zinc-800/50">
                            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                                <Bug size={16} className="text-red-400" />
                                {editing ? 'Edit Bug Report' : 'New Bug Report'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-md">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Assigned By (read-only) */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 rounded-lg border border-zinc-800">
                                <User size={13} className="text-zinc-500" />
                                <span className="text-xs text-zinc-400">Reported by:</span>
                                <span className="text-xs font-medium text-zinc-200">{currentUser?.name || 'You'}</span>
                            </div>

                            {/* Title */}
                            <FormSection label="Bug Title" icon={<Bug size={13} className="text-zinc-500" />}>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Crash exactly when equipping armor on level 5"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </FormSection>

                            {/* Where */}
                            <FormSection label="Where does this bug occur? (Optional)" icon={<MapPin size={13} className="text-zinc-500" />}>
                                <textarea
                                    rows={2}
                                    value={form.where}
                                    onChange={e => setForm(p => ({ ...p, where: e.target.value }))}
                                    placeholder="e.g. Main menu → Settings → Audio slider"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none resize-none transition-colors"
                                />
                            </FormSection>

                            {/* How */}
                            <FormSection label="How to reproduce? (Optional)" icon={<Repeat2 size={13} className="text-zinc-500" />}>
                                <textarea
                                    rows={3}
                                    value={form.how}
                                    onChange={e => setForm(p => ({ ...p, how: e.target.value }))}
                                    placeholder="Step 1: ...\nStep 2: ...\nStep 3: ..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none resize-none transition-colors"
                                />
                            </FormSection>

                            {/* Frequency */}
                            <FormSection label="How often does it occur?" icon={<AlertCircle size={13} className="text-zinc-500" />}>
                                <div className="flex gap-2 flex-wrap">
                                    {FREQ_OPTIONS.map(freq => (
                                        <button
                                            key={freq}
                                            type="button"
                                            onClick={() => setForm(p => ({ ...p, frequency: freq }))}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${form.frequency === freq
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                        >
                                            {freq}
                                        </button>
                                    ))}
                                </div>
                            </FormSection>

                            {/* Media upload */}
                            <FormSection label="4. Attach screenshots / videos (optional)" icon={<Paperclip size={13} className="text-zinc-500" />}>
                                <div
                                    onClick={() => mediaRef.current?.click()}
                                    className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900 rounded-lg p-6 text-center cursor-pointer transition-colors"
                                >
                                    <Paperclip size={20} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm font-medium text-zinc-300">Click to upload files</p>
                                    <p className="text-xs text-zinc-500 mt-1">Images or videos (Max 10 files, 50MB each)</p>
                                </div>
                                <input
                                    ref={mediaRef}
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleMediaSelect}
                                />
                                {mediaPreviews.length > 0 && (
                                    <div className="flex gap-3 flex-wrap mt-3">
                                        {mediaPreviews.map((p, i) => (
                                            <div key={i} className="relative group">
                                                {p.type === 'image' ? (
                                                    <img src={p.url} alt="" className="w-16 h-16 rounded-lg object-cover border border-zinc-700 shadow-sm" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-sm">
                                                        <PlayCircle size={20} className="text-zinc-400" />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-md transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X size={12} className="text-white relative top-[0.5px]" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormSection>

                            {/* Assigned To */}
                            <FormSection label="5. Assigned to" icon={<User size={13} className="text-zinc-500" />}>
                                <select
                                    value={form.assignedTo}
                                    onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">— Unassigned —</option>
                                    {teamMembers.map(m => (
                                        <option key={m._id} value={m._id}>{m.name}{m.role ? ` · ${m.role}` : ''}</option>
                                    ))}
                                </select>
                            </FormSection>

                            {/* Status (only when editing) */}
                            {editing && (
                                <FormSection label="Status" icon={<ChevronDown size={13} className="text-zinc-500" />}>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                                    >
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </FormSection>
                            )}
                        </div>

                        {/* Footer (Sticky) */}
                        <div className="flex-none flex items-center justify-end gap-3 p-5 border-t border-zinc-800/50 bg-[#111113]">
                            <button onClick={() => setShowForm(false)} className="px-5 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg shadow-sm shadow-red-900/20 transition-all flex items-center gap-2"
                            >
                                {saving && <Loader2 size={14} className="animate-spin" />}
                                {editing ? 'Save Changes' : 'Submit Bug'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Delete Bug Report?"
                message="This bug report will be permanently removed."
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
}

// ───── Sub-components ─────────────────────────────────────────────────────

function FormSection({ label, icon, children }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                {icon}{label}
            </label>
            {children}
        </div>
    );
}

function BugCard({ bug, currentUser, onEdit, onDelete, onStatusChange }) {
    const assigneeName = bug.assignedTo?.name;
    const assigneePhoto = bug.assignedTo?.photoUrl ? resolveUrl(bug.assignedTo.photoUrl) : null;
    const reporterName = bug.assignedBy?.name || 'Unknown';

    // RBAC Permissions checks
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
    const isReporter = String(currentUser?.id) === String(bug.assignedBy?._id);
    const isAssignee = String(currentUser?.id) === String(bug.assignedTo?._id);

    const canEditCore = isAdmin || isReporter;
    const canChangeStatus = isAdmin || isAssignee;

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all space-y-4">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="mt-1 flex-shrink-0 p-2 bg-red-500/10 rounded-lg">
                        <Bug size={20} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Title (Big) */}
                        <h3 className="text-xl font-bold text-white tracking-tight break-words pr-4">{bug.title || "Untitled Bug"}</h3>

                        {/* Where */}
                        <p className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5 truncate">
                            <MapPin size={13} className="text-zinc-500" /> {bug.where}
                        </p>

                        {/* How */}
                        <p className="text-sm text-zinc-400 line-clamp-2 whitespace-pre-line leading-relaxed pb-2 max-w-4xl">{bug.how}</p>
                    </div>
                </div>

                {/* Status badge + quick-change */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0 mt-1">
                    <select
                        value={bug.status}
                        disabled={!canChangeStatus}
                        onChange={e => onStatusChange(e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border border-opacity-50 appearance-none bg-transparent cursor-pointer focus:outline-none transition-opacity ${!canChangeStatus && 'opacity-70 cursor-not-allowed hover:opacity-70'} ${STATUS_STYLES[bug.status] || STATUS_STYLES.Open}`}
                        onClick={e => e.stopPropagation()}
                        title={canChangeStatus ? "Change Status" : "Only the assigned developer or an admin can change the status."}
                    >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-zinc-900 text-zinc-100">{s}</option>)}
                    </select>

                    {canEditCore && (
                        <div className="flex gap-1.5">
                            <button onClick={onEdit} title="Edit Bug Report" className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700 shadow-sm">
                                <Pencil size={14} />
                            </button>
                            <button onClick={onDelete} title="Delete Bug" className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 shadow-sm">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap pt-2 border-t border-zinc-800/50">
                {/* Frequency */}
                <span className={`font-medium flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800/80 ${FREQ_STYLES[bug.frequency] || 'text-zinc-400'}`}>
                    <AlertCircle size={12} /> {bug.frequency}
                </span>

                {/* Reported by & Assigned to & Date Pill */}
                <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap text-zinc-400 cursor-default px-4 py-2 rounded-lg bg-zinc-950/40 border border-zinc-800/60 shadow-inner">
                    <User size={14} className="text-zinc-500" />
                    <span>
                        Reported by <strong className="font-semibold text-zinc-200">{reporterName}</strong>
                    </span>
                    <span className="text-zinc-700/60 font-black px-0.5">•</span>
                    <span>
                        Assigned to {isAssignee ? (
                            <strong className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 shadow-sm ml-0.5 animate-in fade-in zoom-in duration-300">You</strong>
                        ) : (
                            <strong className="font-medium text-zinc-200">{assigneeName || 'Unknown'}</strong>
                        )}
                    </span>
                    {bug.createdAt && (
                        <>
                            <span className="text-zinc-700/60 font-black px-0.5">•</span>
                            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                                {new Date(bug.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(bug.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </>
                    )}
                </div>

                {/* Media count */}
                {bug.media?.length > 0 && (
                    <span className="flex items-center gap-1">
                        <Image size={11} /> {bug.media.length} attachment{bug.media.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Media thumbnails */}
            {bug.media?.length > 0 && (
                <div className="flex gap-2 flex-wrap pt-1">
                    {bug.media.map((m, i) => (
                        <a key={i} href={resolveUrl(m.url)} target="_blank" rel="noopener noreferrer">
                            {m.type === 'image' ? (
                                <img src={resolveUrl(m.url)} alt="" className="w-14 h-14 rounded-md object-cover border border-zinc-700 hover:border-zinc-500 transition-colors" />
                            ) : (
                                <div className="w-14 h-14 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:border-zinc-500 transition-colors">
                                    <PlayCircle size={18} className="text-zinc-400" />
                                </div>
                            )}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
