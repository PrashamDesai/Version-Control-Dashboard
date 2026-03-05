import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, AlertCircle, Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import api from '../services/api';

const DEFAULT_ITEMS = [
    { checkName: 'Bundle ID', status: 'Remaining', notes: 'com.shonstudio.thinksudoku' },
    { checkName: 'GameConfiguration - environment', status: 'Remaining', notes: 'Prod' },
    { checkName: 'KeyStore', status: 'Remaining', notes: 'newGame.keystore' },
    { checkName: 'DebugLogs', status: 'Remaining', notes: 'Comment / Disable object' },
    { checkName: 'IngameDebugConsole', status: 'Remaining', notes: 'Disable' },
    { checkName: 'IL2CPP - ARM7,64', status: 'Remaining', notes: 'enable' },
    { checkName: 'Version / Version code', status: 'Remaining', notes: 'Incremental' },
    { checkName: 'Project Setting - Stack Trace', status: 'Remaining', notes: 'None' },
    { checkName: 'Google service - plist / json', status: 'Remaining', notes: '' },
    { checkName: 'Initial Version / Version code', status: 'Remaining', notes: '1.0.0 / 1' },
    { checkName: 'Licensing', status: 'Remaining', notes: '' },
    { checkName: 'Mobile Ads Unit ID', status: 'Remaining', notes: 'Change' },
];

export default function BuildChecklist() {
    const { game } = useOutletContext();
    const [platform, setPlatform] = useState('Android');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Array of checklist items
    const [checklist, setChecklist] = useState([]);
    const [savingRows, setSavingRows] = useState({});
    const [deletingRows, setDeletingRows] = useState({});

    useEffect(() => {
        const fetchChecklist = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/games/${game._id}/checklist`);
                const serverItems = res.data.data;

                if (serverItems.length === 0) {
                    // Populate default items for both Android and iOS
                    let initialItems = [];
                    ['Android', 'iOS'].forEach((plt, iter) => {
                        const mappedDefaults = DEFAULT_ITEMS.map((def, index) => ({
                            ...def,
                            platform: plt,
                            localId: `temp_${Date.now()}_${iter}_${index}`
                        }));
                        initialItems = [...initialItems, ...mappedDefaults];
                    });

                    setChecklist(initialItems);
                } else {
                    const sorted = serverItems.map(item => ({ ...item, localId: item._id }));
                    setChecklist(sorted);
                }
            } catch (error) {
                toast.error('Failed to load build checklist');
            } finally {
                setLoading(false);
            }
        };
        if (game) fetchChecklist();
    }, [game]);

    const handleAddRow = () => {
        const newRow = {
            localId: `temp_${Date.now()}`,
            checkName: '',
            platform: platform,
            status: 'Remaining',
            notes: ''
        };
        setChecklist([...checklist, newRow]);
    };

    const handleChange = (localId, field, value) => {
        setChecklist(prev => prev.map(item =>
            item.localId === localId ? { ...item, [field]: value } : item
        ));
    };

    const handleSaveRow = async (row) => {
        try {
            if (!row.checkName.trim()) {
                return toast.error("Check Name cannot be empty.");
            }

            setSavingRows(prev => ({ ...prev, [row.localId]: true }));

            const payload = {
                environment: 'PROD',
                platform: row.platform,
                checkName: row.checkName,
                status: row.status,
                notes: row.notes
            };

            let savedRow;

            if (row.localId.toString().startsWith('temp_')) {
                const res = await api.post(`/games/${game._id}/checklist`, payload);
                savedRow = res.data.data;
            } else {
                const res = await await api.put(`/games/${game._id}/checklist/${row._id}`, payload);
                savedRow = res.data.data;
            }

            setChecklist(prev => prev.map(item =>
                item.localId === row.localId ? { ...savedRow, localId: savedRow._id } : item
            ));

            toast.success('Check saved successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save check');
        } finally {
            setSavingRows(prev => ({ ...prev, [row.localId]: false }));
        }
    };

    const handleDeleteRow = async (row) => {
        if (row.localId.toString().startsWith('temp_')) {
            setChecklist(prev => prev.filter(r => r.localId !== row.localId));
            return;
        }

        try {
            setDeletingRows(prev => ({ ...prev, [row.localId]: true }));
            await api.delete(`/games/${game._id}/checklist/${row._id}`);

            setChecklist(prev => prev.filter(r => r.localId !== row.localId));
            toast.success("Check deleted.");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete check');
            setDeletingRows(prev => ({ ...prev, [row.localId]: false }));
        }
    };

    const handleBulkSave = async () => {
        try {
            setSaving(true);
            const promises = checklist.map(item => {
                const payload = {
                    environment: 'PROD',
                    platform: item.platform,
                    checkName: item.checkName,
                    status: item.status,
                    notes: item.notes
                };

                if (item.localId.toString().startsWith('temp_')) {
                    if (payload.checkName.trim()) {
                        return api.post(`/games/${game._id}/checklist`, payload);
                    }
                    return null;
                } else {
                    return api.put(`/games/${game._id}/checklist/${item._id}`, payload);
                }
            }).filter(Boolean);

            const results = await Promise.allSettled(promises);
            const errors = results.filter(r => r.status === 'rejected');

            if (errors.length > 0) {
                toast.warning(`Saved with ${errors.length} errors.`);
            } else {
                toast.success(`Checklist saved successfully!`);
            }

            // Refresh list to acquire new IDs
            const res = await api.get(`/games/${game._id}/checklist`);
            setChecklist(res.data.data.map(item => ({ ...item, localId: item._id })));

        } catch (error) {
            toast.error('Failed to bulk save checklist');
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'text-emerald-400';
            case 'Attention': return 'text-red-400';
            case 'N/A': return 'text-zinc-400';
            default: return 'text-amber-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
        );
    }

    const filteredChecklist = checklist.filter(item => item.platform === platform);
    const completed = filteredChecklist.filter(item => item.status === 'Completed' || item.status === 'N/A').length;
    const total = filteredChecklist.length;
    const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">CBD (Check Build Details)</h1>
                    <p className="text-zinc-400 text-sm">Validate critical steps prior to submitting a build for review.</p>
                </div>
                <button
                    onClick={handleBulkSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm shadow-violet-500/20"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving All...' : 'Save All Changes'}
                </button>
            </div>

            <div className="glass-panel flex-shrink-0 rounded-xl p-4 border border-zinc-800/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-zinc-800 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="20" cy="20" r="20" fill="none" strokeWidth="4" className="stroke-zinc-800" transform="translate(4,4)" />
                        <circle cx="20" cy="20" r="20" fill="none" strokeWidth="4"
                            className="stroke-emerald-500"
                            strokeDasharray="125"
                            strokeDashoffset={125 - (125 * progressPercent) / 100}
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            transform="translate(4,4)"
                        />
                    </svg>
                    <span className="text-xs font-bold text-white relative z-10">{progressPercent}%</span>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Readiness Score ({platform})</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{completed} of {total} items greenlit for deployment.</p>
                </div>
                {progressPercent !== 100 && (
                    <div className="ml-auto flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-md text-xs font-semibold">
                        <AlertCircle size={14} /> Attention Required
                    </div>
                )}
            </div>

            <div className="flex gap-4 border-b border-zinc-800/80 shrink-0">
                {['Android', 'iOS'].map(p => (
                    game.platformsSupported.includes(p) && (
                        <button
                            key={p}
                            onClick={() => setPlatform(p)}
                            className={cn(
                                "px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all",
                                platform === p
                                    ? (p === 'Android' ? "border-green-500 text-green-400 bg-green-500/5 rounded-t-lg" : "border-violet-500 text-violet-400 bg-violet-500/5 rounded-t-lg")
                                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {p} Build
                        </button>
                    )
                ))}
            </div>

            <div className="glass-panel rounded-xl flex-1 flex flex-col overflow-hidden border border-zinc-800/50 bg-[#121214]">
                <div className="flex border-b border-zinc-800/80 bg-[#121214] shrink-0 justify-end items-center pr-4 h-12">
                    <button
                        onClick={handleAddRow}
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors border border-zinc-700"
                    >
                        <Plus size={16} /> Add Validation Check
                    </button>
                </div>

                <div key={platform} className="tab-panel flex-1 overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 bg-[#1a1a1c] sticky top-0 z-10 border-b border-zinc-800/80">
                            <tr>
                                <th className="px-6 py-4 font-medium w-[30%]">Validation Check</th>
                                <th className="px-4 py-4 font-medium w-[15%]">Status</th>
                                <th className="px-6 py-4 font-medium w-[45%]">Notes</th>
                                <th className="px-4 py-4 font-medium text-right w-[10%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredChecklist.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-zinc-500 text-sm">
                                        No checks configured for {platform}.
                                    </td>
                                </tr>
                            ) : (
                                filteredChecklist.map((item) => (
                                    <tr key={item.localId} className={cn("hover:bg-zinc-800/20 transition-colors", item.status === 'Completed' ? "opacity-60" : "")}>
                                        <td className="px-6 py-3">
                                            <input
                                                type="text"
                                                value={item.checkName}
                                                onChange={(e) => handleChange(item.localId, 'checkName', e.target.value)}
                                                placeholder="e.g., Verify Bundle ID"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600 focus:bg-zinc-800/50"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={item.status}
                                                onChange={(e) => handleChange(item.localId, 'status', e.target.value)}
                                                className={cn(
                                                    "w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm font-semibold outline-none",
                                                    getStatusColor(item.status)
                                                )}
                                                style={{ backgroundColor: '#18181b' }}
                                            >
                                                <option value="Completed" className="text-emerald-400">Completed</option>
                                                <option value="Remaining" className="text-amber-400">Remaining</option>
                                                <option value="Attention" className="text-red-400">Attention</option>
                                                <option value="N/A" className="text-zinc-400">N/A</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-3">
                                            <input
                                                type="text"
                                                value={item.notes}
                                                onChange={(e) => handleChange(item.localId, 'notes', e.target.value)}
                                                placeholder="Additional info..."
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600 focus:bg-zinc-800/50"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleSaveRow(item)}
                                                    disabled={savingRows[item.localId] || deletingRows[item.localId]}
                                                    title="Save Check"
                                                    className="p-1.5 bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white rounded-md transition-colors disabled:opacity-50"
                                                >
                                                    {savingRows[item.localId] ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRow(item)}
                                                    disabled={savingRows[item.localId] || deletingRows[item.localId]}
                                                    title="Delete Check"
                                                    className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-colors disabled:opacity-50"
                                                >
                                                    {deletingRows[item.localId] ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

