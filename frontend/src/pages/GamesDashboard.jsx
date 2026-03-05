import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Smartphone, MonitorPlay, Loader2, Pencil, Trash2, ImagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ImageUpload from '../components/ImageUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'sonner';
import api from '../services/api';

// ── Inline image editor for the edit modal ────────────────────────────────────
const IconEditor = ({ currentUrl, onSelect }) => {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        onSelect(file);
    };

    const displaySrc = preview || (currentUrl ? `${import.meta.env.VITE_IMAGE_BASE_URL}${currentUrl}` : null);

    return (
        <div
            onClick={() => inputRef.current?.click()}
            className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 cursor-pointer group/icon flex items-center justify-center flex-shrink-0"
        >
            {displaySrc ? (
                <img src={displaySrc} alt="Icon" className="w-full h-full object-cover" />
            ) : (
                <MonitorPlay size={28} className="text-zinc-600" />
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                <ImagePlus size={18} className="text-white mb-1" />
                <span className="text-[10px] text-white font-medium">Change</span>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function GamesDashboard() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteGame, setConfirmDeleteGame] = useState(null); // { id }
    // { [gameId]: { android: '1.2.0' | null, ios: '1.1.0' | null } }
    const [versions, setVersions] = useState({});

    // Add form state
    const [formData, setFormData] = useState({
        name: '', description: '', platformsSupported: ['Android', 'iOS'], isActive: true
    });
    const [selectedImage, setSelectedImage] = useState(null);

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '', description: '', platformsSupported: [], status: 'In Internal Testing',
    });
    const [editImage, setEditImage] = useState(null);
    // Live versions auto-fetched for the editing game
    const [editVersions, setEditVersions] = useState({ android: null, ios: null });
    const [fetchingVersions, setFetchingVersions] = useState(false);

    // All selectable statuses
    const STATUSES = [
        { value: 'Live', color: 'emerald' },
        { value: 'In Review', color: 'violet' },
        { value: 'Waiting for Review', color: 'amber' },
        { value: 'In Closed Testing', color: 'blue' },
        { value: 'In Internal Testing', color: 'sky' },
    ];

    const STATUS_STYLES = {
        emerald: { base: 'border-zinc-800 text-zinc-500 hover:border-emerald-500/40 hover:text-emerald-400', active: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
        violet: { base: 'border-zinc-800 text-zinc-500 hover:border-violet-500/40  hover:text-violet-400', active: 'border-violet-500  bg-violet-500/10  text-violet-400' },
        amber: { base: 'border-zinc-800 text-zinc-500 hover:border-amber-500/40   hover:text-amber-400', active: 'border-amber-500   bg-amber-500/10   text-amber-400' },
        blue: { base: 'border-zinc-800 text-zinc-500 hover:border-violet-500/40    hover:text-violet-400', active: 'border-violet-500    bg-violet-500/10    text-violet-400' },
        sky: { base: 'border-zinc-800 text-zinc-500 hover:border-sky-500/40     hover:text-sky-400', active: 'border-sky-500     bg-sky-500/10     text-sky-400' },
    };

    useEffect(() => { fetchGames(); }, []);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const res = await api.get('/games');
            const gameList = res.data.data;
            setGames(gameList);

            // Fetch live (or latest) versions for every game in parallel
            const versionResults = await Promise.allSettled(
                gameList.map(g => api.get(`/games/${g._id}/releases?size=50`))
            );

            const versionMap = {};
            versionResults.forEach((result, i) => {
                const gameId = gameList[i]._id;
                if (result.status === 'fulfilled') {
                    const releases = result.value.data.data.releases || [];
                    // Prefer Live status, fall back to most recent per platform
                    const liveAndroid = releases.find(r => r.platform === 'Android' && r.status === 'Live');
                    const liveIos = releases.find(r => r.platform === 'iOS' && r.status === 'Live');
                    const anyAndroid = releases.find(r => r.platform === 'Android');
                    const anyIos = releases.find(r => r.platform === 'iOS');
                    // Latest = first in list (sorted by most recent from backend)
                    const latestAndroid = releases.find(r => r.platform === 'Android');
                    const latestIos = releases.find(r => r.platform === 'iOS');
                    versionMap[gameId] = {
                        android: (liveAndroid || anyAndroid)?.versionName || null,
                        ios: (liveIos || anyIos)?.versionName || null,
                        androidLive: !!liveAndroid,
                        iosLive: !!liveIos,
                        androidRejected: !liveAndroid && latestAndroid?.status === 'Rejected',
                        iosRejected: !liveIos && latestIos?.status === 'Rejected',
                    };
                } else {
                    versionMap[gameId] = { android: null, ios: null, androidLive: false, iosLive: false };
                }
            });
            setVersions(versionMap);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch games');
        } finally {
            setLoading(false);
        }
    };

    const handlePlatformToggle = (platform, target, setter) => {
        setter(prev => {
            const exists = prev[target].includes(platform);
            return {
                ...prev,
                [target]: exists
                    ? prev[target].filter(p => p !== platform)
                    : [...prev[target], platform]
            };
        });
    };

    // ── Create ────────────────────────────────────────────────────────────────
    const handleAddGame = async (e) => {
        e.preventDefault();
        if (formData.platformsSupported.length === 0) return toast.error('Select at least one platform');
        try {
            setIsSubmitting(true);
            const res = await api.post('/games', formData);
            const newGame = res.data.data;
            if (selectedImage) {
                const fd = new FormData();
                fd.append('icon', selectedImage);
                await api.post(`/games/${newGame._id}/upload-icon`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            toast.success('Game created!');
            setIsAddModalOpen(false);
            setFormData({ name: '', description: '', platformsSupported: ['Android', 'iOS'], isActive: true });
            setSelectedImage(null);
            fetchGames();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create game');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Edit: open modal and auto-fetch live versions ─────────────────────────
    const openEdit = async (e, game) => {
        e.stopPropagation();
        setEditingGame(game);
        setEditForm({
            name: game.name,
            description: game.description || '',
            platformsSupported: [...game.platformsSupported],
            status: game.status || 'In Internal Testing',
        });
        setEditImage(null);
        setEditVersions({ android: null, ios: null });
        setIsEditModalOpen(true);

        // Auto-fetch live versions
        try {
            setFetchingVersions(true);
            const res = await api.get(`/games/${game._id}/releases?limit=50`);
            const releases = res.data.data.releases || [];
            setEditVersions({
                android: releases.find(r => r.platform === 'Android' && r.status === 'Live')?.versionName || null,
                ios: releases.find(r => r.platform === 'iOS' && r.status === 'Live')?.versionName || null,
            });
        } catch {
            // non-critical
        } finally {
            setFetchingVersions(false);
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        if (editForm.platformsSupported.length === 0) return toast.error('Select at least one platform');
        try {
            setIsSubmitting(true);
            const payload = {
                ...editForm,
                // isActive derived from status for semantic consistency
                isActive: editForm.status === 'Live',
            };
            await api.put(`/games/${editingGame._id}`, payload);
            if (editImage) {
                const fd = new FormData();
                fd.append('icon', editImage);
                await api.post(`/games/${editingGame._id}/upload-icon`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            toast.success('Game updated!');
            setIsEditModalOpen(false);
            setEditingGame(null);
            fetchGames();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update game');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            setDeletingId(id);
            await api.delete(`/games/${id}`);
            toast.success('Game deleted');
            fetchGames();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting game');
        } finally {
            setDeletingId(null);
            setConfirmDeleteGame(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
        );
    }

    const filteredGames = games.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">Games Overview</h1>
                    <p className="text-zinc-400 text-sm">Manage your entire portfolio of game titles across all environments.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm shadow-violet-500/20"
                >
                    <Plus size={16} /> Add New Game
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 flex-wrap flex-shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search games by name..."
                        className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:ring-1 focus:ring-violet-500 focus:border-zinc-700 outline-none transition-all placeholder:text-zinc-600"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto pb-8">
                {filteredGames.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-500 border border-zinc-800/80 rounded-2xl bg-zinc-900/10">
                        <MonitorPlay size={48} className="mb-4 text-zinc-700" />
                        <p>No games found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredGames.map(game => (
                            <div
                                key={game._id}
                                onClick={() => navigate(`/games/${game.slug}`)}
                                className="glass-panel group relative rounded-2xl p-5 flex flex-col gap-4 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/50 transition-all cursor-pointer overflow-hidden border border-zinc-800/80 bg-[#121214]"
                            >
                                {/* Action buttons – appear on hover */}
                                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={e => openEdit(e, game)}
                                        title="Edit game"
                                        className="p-1.5 bg-zinc-800/90 hover:bg-violet-500/20 text-zinc-400 hover:text-violet-400 rounded-md border border-zinc-700 hover:border-violet-500/30 transition-all backdrop-blur-sm"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); setConfirmDeleteGame({ id: game._id, name: game.name }); }}
                                        disabled={deletingId === game._id}
                                        title="Delete game"
                                        className="p-1.5 bg-zinc-800/90 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-md border border-zinc-700 hover:border-red-500/30 transition-all backdrop-blur-sm disabled:opacity-50"
                                    >
                                        {deletingId === game._id
                                            ? <Loader2 size={13} className="animate-spin" />
                                            : <Trash2 size={13} />
                                        }
                                    </button>
                                </div>

                                {/* Icon + name */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center">
                                        {game.iconUrl
                                            ? <img src={`${import.meta.env.VITE_IMAGE_BASE_URL}${game.iconUrl}`} alt={game.name} className="w-full h-full object-cover" />
                                            : <MonitorPlay className="text-zinc-500" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-white truncate group-hover:text-violet-400 transition-colors">{game.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <StatusBadge status={game.status || (game.isActive ? 'Live' : 'In Internal Testing')} />
                                        </div>
                                    </div>
                                </div>

                                {/* Platform version tiles */}
                                <div className="grid grid-cols-2 gap-3 bg-zinc-900/50 rounded-lg p-3 border border-zinc-800/30">
                                    <div className="space-y-1 border-r border-zinc-800/50 pr-3">
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                            <Smartphone size={12} className={game.platformsSupported.includes('Android') ? 'text-green-500' : 'text-zinc-700'} />
                                            <span className={game.platformsSupported.includes('Android') ? '' : 'line-through opacity-40'}>Android</span>
                                        </div>
                                        {game.platformsSupported.includes('Android') ? (
                                            <div className={cn(
                                                "text-xs font-semibold flex items-center gap-1 flex-wrap",
                                                versions[game._id]?.androidLive ? 'text-emerald-400'
                                                    : versions[game._id]?.androidRejected ? 'text-red-400'
                                                        : 'text-zinc-400'
                                            )}>
                                                {versions[game._id]?.android ?? '—'}
                                                {versions[game._id]?.androidLive && <span className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-wider">live</span>}
                                                {versions[game._id]?.androidRejected && <span className="text-[9px] font-bold text-red-500/80 uppercase tracking-wider">rejected</span>}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-zinc-700">N/A</div>
                                        )}
                                    </div>
                                    <div className="space-y-1 pl-3">
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                            <MonitorPlay size={12} className={game.platformsSupported.includes('iOS') ? 'text-violet-500' : 'text-zinc-700'} />
                                            <span className={game.platformsSupported.includes('iOS') ? '' : 'line-through opacity-40'}>iOS</span>
                                        </div>
                                        {game.platformsSupported.includes('iOS') ? (
                                            <div className={cn(
                                                "text-xs font-semibold flex items-center gap-1 flex-wrap",
                                                versions[game._id]?.iosLive ? 'text-emerald-400'
                                                    : versions[game._id]?.iosRejected ? 'text-red-400'
                                                        : 'text-zinc-400'
                                            )}>
                                                {versions[game._id]?.ios ?? '—'}
                                                {versions[game._id]?.iosLive && <span className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-wider">live</span>}
                                                {versions[game._id]?.iosRejected && <span className="text-[9px] font-bold text-red-500/80 uppercase tracking-wider">rejected</span>}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-zinc-700">N/A</div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="text-[10px] text-zinc-600 font-medium tracking-wide uppercase mt-auto">
                                    Updated {new Date(game.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── CREATE modal ─────────────────────────────────────────────── */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Game">
                <form onSubmit={handleAddGame} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Game Icon</label>
                        <ImageUpload onImageSelect={file => setSelectedImage(file)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Name</label>
                        <input
                            required type="text" placeholder="e.g. Candy Crush Saga"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Description</label>
                        <textarea
                            rows={3}
                            placeholder="Brief description..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all resize-none placeholder:text-zinc-600"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Platforms</label>
                        <div className="flex gap-4">
                            {['Android', 'iOS'].map(p => (
                                <label key={p} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.platformsSupported.includes(p)}
                                        onChange={() => setFormData(prev => {
                                            const exists = prev.platformsSupported.includes(p);
                                            return { ...prev, platformsSupported: exists ? prev.platformsSupported.filter(x => x !== p) : [...prev.platformsSupported, p] };
                                        })}
                                        className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-violet-500"
                                    />
                                    {p}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800/80">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-md transition-colors shadow-sm shadow-violet-500/20">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Create Game'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── EDIT modal ───────────────────────────────────────────────── */}
            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingGame(null); }} title="Edit Game">
                {editingGame && (
                    <form onSubmit={handleEditSave} className="space-y-5">
                        {/* Icon + live version summary */}
                        <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                            <IconEditor currentUrl={editingGame.iconUrl} onSelect={file => setEditImage(file)} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold">Live Versions</p>
                                {fetchingVersions ? (
                                    <Loader2 size={14} className="animate-spin text-zinc-500" />
                                ) : (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Smartphone size={13} className="text-green-400 flex-shrink-0" />
                                            <span className="text-zinc-400 text-xs">Android:</span>
                                            <span className="text-zinc-200 font-medium text-xs">{editVersions.android || <span className="text-zinc-600 italic">No live version</span>}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MonitorPlay size={13} className="text-violet-400 flex-shrink-0" />
                                            <span className="text-zinc-400 text-xs">iOS:</span>
                                            <span className="text-zinc-200 font-medium text-xs">{editVersions.ios || <span className="text-zinc-600 italic">No live version</span>}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-600 mt-1">
                                            Updated {new Date(editingGame.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Name</label>
                            <input
                                required type="text"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all"
                                value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Description</label>
                            <textarea
                                rows={3}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all resize-none"
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Platforms</label>
                            <div className="flex gap-4">
                                {['Android', 'iOS'].map(p => (
                                    <label key={p} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.platformsSupported.includes(p)}
                                            onChange={() => setEditForm(prev => {
                                                const exists = prev.platformsSupported.includes(p);
                                                return { ...prev, platformsSupported: exists ? prev.platformsSupported.filter(x => x !== p) : [...prev.platformsSupported, p] };
                                            })}
                                            className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-violet-500"
                                        />
                                        {p}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Status</label>
                            <div className="grid grid-cols-1 gap-2">
                                {STATUSES.map(({ value, color }) => {
                                    const isActive = editForm.status === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setEditForm(prev => ({ ...prev, status: value }))}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                                                isActive ? STATUS_STYLES[color].active : STATUS_STYLES[color].base
                                            )}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800/80">
                            <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingGame(null); }} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-md transition-colors shadow-sm shadow-violet-500/20">
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <ConfirmDialog
                isOpen={!!confirmDeleteGame}
                title={`Delete "${confirmDeleteGame?.name}"?`}
                message="This will permanently delete the game and ALL its data. This cannot be undone."
                confirmLabel="Delete Game"
                onConfirm={() => handleDelete(confirmDeleteGame?.id)}
                onCancel={() => setConfirmDeleteGame(null)}
            />

        </div>
    );
}

