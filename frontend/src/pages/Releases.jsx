import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'sonner';
import api from '../services/api';

export default function Releases() {
    const { game } = useOutletContext();
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlatform, setFilterPlatform] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        platform: 'Android',
        versionName: '',
        buildNumber: '',
        status: 'In Internal Testing',
        whatsNew: '',
        releaseDate: new Date().toISOString().split('T')[0]
    });

    const resetForm = () => {
        setFormData({
            platform: 'Android',
            versionName: '',
            buildNumber: '',
            status: 'In Internal Testing',
            whatsNew: '',
            releaseDate: new Date().toISOString().split('T')[0]
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const fetchReleases = async () => {
        try {
            setLoading(true);
            let query = `?size=100`; // Fetch all for simple filtering on frontend
            if (filterPlatform) query += `&platform=${filterPlatform}`;
            if (searchTerm) query += `&search=${searchTerm}`;

            const res = await api.get(`/games/${game._id}/releases${query}`);
            setReleases(res.data.data.releases || []);
        } catch (error) {
            toast.error('Failed to fetch releases');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (game) fetchReleases();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [game, searchTerm, filterPlatform]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const dataToSubmit = {
                ...formData,
                buildNumber: Number(formData.buildNumber)
            };

            if (isEditing) {
                const res = await api.put(`/games/${game._id}/releases/${editingId}`, dataToSubmit);
                setReleases(prev => prev.map(r => r._id === editingId ? res.data.data : r));
                toast.success('Release updated!');
            } else {
                const res = await api.post(`/games/${game._id}/releases`, dataToSubmit);
                setReleases(prev => [res.data.data, ...prev]);
                toast.success('Release entry created!');
            }

            setIsAddModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || `Error ${isEditing ? 'updating' : 'creating'} release`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (rel) => {
        setIsEditing(true);
        setEditingId(rel._id);
        setFormData({
            platform: rel.platform,
            versionName: rel.versionName,
            buildNumber: rel.buildNumber,
            status: rel.status,
            whatsNew: rel.whatsNew,
            releaseDate: rel.releaseDate ? new Date(rel.releaseDate).toISOString().split('T')[0] : new Date(rel.createdAt).toISOString().split('T')[0]
        });
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/games/${game._id}/releases/${id}`);
            setReleases(prev => prev.filter(r => r._id !== id));
            toast.success('Release deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting release');
        } finally {
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Releases</h1>
                    <p className="text-zinc-400 text-sm">Manage app versions and release history for {game?.name}.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm shadow-violet-500/20"
                >
                    <Plus size={16} />
                    New Release
                </button>
            </div>

            <div className="glass-panel rounded-xl flex flex-col flex-1 overflow-hidden border border-zinc-800/50">
                <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-[#121214] flex-shrink-0">
                    <div className="flex items-center gap-3 w-full max-w-lg">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search versions..."
                                className="w-full pl-9 pr-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-300 focus:ring-1 focus:ring-violet-500 focus:border-zinc-700 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-zinc-900 flex items-center gap-2 px-3 py-1.5 border border-zinc-800 hover:bg-zinc-800 rounded-md text-sm text-zinc-400 transition-colors shrink-0 outline-none cursor-pointer"
                            value={filterPlatform}
                            onChange={(e) => setFilterPlatform(e.target.value)}
                            style={{ backgroundColor: '#18181b' }}
                        >
                            <option value="">All Platforms</option>
                            {game?.platformsSupported?.includes('Android') && <option value="Android">Android</option>}
                            {game?.platformsSupported?.includes('iOS') && <option value="iOS">iOS</option>}
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="animate-spin text-violet-500" size={32} />
                        </div>
                    ) : releases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
                            <p>No releases found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-zinc-500 bg-zinc-900/80 sticky top-0 z-10 border-b border-zinc-800/50 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Rel #</th>
                                    <th className="px-6 py-3 font-medium">Platform</th>
                                    <th className="px-6 py-3 font-medium">Version (Build)</th>
                                    <th className="px-6 py-3 font-medium w-full">What's New</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium relative"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {releases.map((rel) => (
                                    <tr key={rel._id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-zinc-400">#{rel.releaseNumber || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider",
                                                rel.platform === 'Android' ? "bg-green-500/10 text-green-400" : "bg-violet-500/10 text-violet-400"
                                            )}>
                                                {rel.platform}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-200">
                                            {rel.versionName} <span className="text-zinc-500 font-normal">({rel.buildNumber})</span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 truncate max-w-xs">{rel.whatsNew}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={rel.status} />
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">{new Date(rel.releaseDate || rel.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                                                <button
                                                    onClick={() => handleEdit(rel)}
                                                    className="p-1.5 text-zinc-400 hover:text-violet-400 hover:bg-violet-500/10 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(rel._id)}
                                                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm(); }} title={isEditing ? "Edit Release" : "Create New Release"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Platform</label>
                            <select
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none"
                                value={formData.platform}
                                onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                required
                                style={{ backgroundColor: '#18181b' }}
                            >
                                {game?.platformsSupported?.includes('Android') && <option value="Android">Android</option>}
                                {game?.platformsSupported?.includes('iOS') && <option value="iOS">iOS</option>}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Version Name</label>
                            <input
                                required type="text" placeholder="e.g. 1.3.0"
                                value={formData.versionName}
                                onChange={e => setFormData({ ...formData, versionName: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Build Number</label>
                            <input
                                required type="number" placeholder="e.g. 43"
                                value={formData.buildNumber}
                                onChange={e => setFormData({ ...formData, buildNumber: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Release Date</label>
                            <input
                                required type="date"
                                value={formData.releaseDate}
                                onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all [color-scheme:dark]"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-zinc-300">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none"
                                style={{ backgroundColor: '#18181b' }}
                            >
                                <option value="In Internal Testing">In Internal Testing</option>
                                <option value="In Closed Testing">In Closed Testing</option>
                                <option value="Waiting for Review">Waiting for Review</option>
                                <option value="In Review">In Review</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Live">Live</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">What's New (Release Notes)</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.whatsNew}
                            onChange={e => setFormData({ ...formData, whatsNew: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all resize-none placeholder:text-zinc-600"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800/80">
                        <button
                            type="button"
                            onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-md transition-colors shadow-sm shadow-violet-500/20"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (isEditing ? 'Update Release' : 'Save Release')}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                title="Delete Release?"
                message="This release will be soft-deleted and removed from the list."
                confirmLabel="Delete"
                onConfirm={() => handleDelete(confirmDeleteId)}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}

