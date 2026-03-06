import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, ExternalLink, Link as LinkIcon, Loader2, Wrench } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'sonner';
import api from '../services/api';
import { cn } from '../lib/utils';

const DEFAULT_LINKS = [
    { name: 'Release Builds', category: 'Testing', environment: '' },
    { name: 'Figma, Feature Graphics', category: 'Design', environment: '' },
    { name: 'Firebase PROD', category: 'Firebase', environment: 'PROD' },
    { name: 'Firebase DEV', category: 'Firebase', environment: 'DEV' },
    { name: 'QA Testing Build', category: 'Testing', environment: 'QA' },
    { name: 'Console Internal Testing (Dev)', category: 'Store', environment: 'DEV' },
    { name: 'Console Internal Testing (Prod)', category: 'Store', environment: 'PROD' },
    { name: 'App Store (Apple) Live URL', category: 'Store', environment: 'PROD' },
    { name: 'Play (Android) Live URL', category: 'Store', environment: 'PROD' }
];

export default function Links() {
    const { game } = useOutletContext();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.user?.role === 'admin' || userInfo?.user?.role === 'super_admin';

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        category: 'Other',
        environment: ''
    });

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/games/${game._id}/links`);
                setLinks(res.data.data);
            } catch (error) {
                toast.error('Failed to load links');
            } finally {
                setLoading(false);
            }
        };
        if (game) fetchLinks();
    }, [game]);

    const handleCreateLink = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await api.post(`/games/${game._id}/links`, formData);
            setLinks(prev => [...prev, res.data.data]);
            setIsAddOpen(false);
            setFormData({
                name: '',
                url: '',
                category: 'Other',
                environment: ''
            });
            toast.success('Link added successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating link');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/games/${game._id}/links/${id}`);
            setLinks(prev => prev.filter(l => l._id !== id));
            toast.success('Link deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting link');
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const handleSetupDefault = (defaultLink) => {
        setFormData({
            name: defaultLink.name,
            url: '',
            category: defaultLink.category,
            environment: defaultLink.environment
        });
        setIsAddOpen(true);
    };

    const handleAddNew = () => {
        setFormData({
            name: '',
            url: '',
            category: 'Other',
            environment: ''
        });
        setIsAddOpen(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col flex-1 h-[calc(100vh-8rem)] items-center justify-center p-12">
                <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
        );
    }

    const mergedLinks = [...links];
    DEFAULT_LINKS.forEach(defaultLink => {
        if (!links.some(l => l.name === defaultLink.name)) {
            mergedLinks.push({ ...defaultLink, isDefaultEmpty: true, _id: `default-${defaultLink.name}` });
        }
    });

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Important Links</h1>
                    <p className="text-zinc-400 text-sm">Quickly access external resources related to this game.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm shadow-violet-500/20"
                    >
                        <Plus size={16} />
                        Add Link
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                    {mergedLinks.map((link) => (
                        <div key={link._id} className={cn(
                            "glass-panel group rounded-xl p-5 flex flex-col gap-4 border transition-colors",
                            link.isDefaultEmpty ? "border-zinc-800/40 bg-[#121214]/50 opacity-80 hover:opacity-100" : "border-zinc-800/80 hover:border-zinc-600 bg-[#121214]"
                        )}>

                            <div className="flex justify-between items-start">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    link.isDefaultEmpty ? "bg-zinc-800/50 text-zinc-500" : "bg-violet-500/10 text-violet-400"
                                )}>
                                    <LinkIcon size={20} />
                                </div>
                                {(!link.isDefaultEmpty && isAdmin) && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button
                                            onClick={() => setConfirmDeleteId(link._id)}
                                            className="p-1.5 text-red-500/70 hover:text-red-400 bg-red-500/5 border border-red-500/10 hover:border-red-500/20 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className={cn(
                                    "text-base font-semibold mb-1 truncate",
                                    link.isDefaultEmpty ? "text-zinc-400" : "text-zinc-200"
                                )} title={link.name}>{link.name}</h3>
                                {link.isDefaultEmpty ? (
                                    <p className="text-xs font-mono text-zinc-600 truncate">Not configured yet</p>
                                ) : (
                                    <p className="text-xs font-mono text-zinc-500 truncate" title={link.url}>{link.url}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                                <div className="flex gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-zinc-800 text-zinc-400">
                                        {link.category}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                                        {link.environment || 'All'}
                                    </span>
                                </div>
                                {link.isDefaultEmpty ? (
                                    isAdmin ? (
                                        <button
                                            onClick={() => handleSetupDefault(link)}
                                            className="text-xs font-medium text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors bg-violet-500/10 px-2 py-1 rounded"
                                        >
                                            <Wrench size={12} /> Setup
                                        </button>
                                    ) : null
                                ) : (
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-violet-500 hover:text-violet-400 transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Resource Link">
                <form onSubmit={handleCreateLink} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Design Files"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600 focus:bg-zinc-800/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">URL</label>
                        <input
                            required
                            type="url"
                            placeholder="https://..."
                            value={formData.url}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600 focus:bg-zinc-800/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none"
                                style={{ backgroundColor: '#18181b' }}
                            >
                                <option value="Firebase">Firebase</option>
                                <option value="Store">Store</option>
                                <option value="Design">Design</option>
                                <option value="Testing">Testing</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Environment</label>
                            <select
                                value={formData.environment}
                                onChange={e => setFormData({ ...formData, environment: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none"
                                style={{ backgroundColor: '#18181b' }}
                            >
                                <option value="">All</option>
                                <option value="DEV">DEV</option>
                                <option value="QA">QA</option>
                                <option value="PROD">PROD</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800/80">
                        <button
                            type="button"
                            onClick={() => setIsAddOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-md transition-colors shadow-sm shadow-violet-500/20"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Link'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                title="Delete Link?"
                message="This link will be permanently removed."
                confirmLabel="Delete"
                onConfirm={() => handleDelete(confirmDeleteId)}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}

