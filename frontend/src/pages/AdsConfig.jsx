import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Plus, Trash2, Check, Copy, Info, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import api from '../services/api';

const PLATFORMS = ['Android', 'iOS'];
const AD_TYPES = ['Banner', 'Interstitial', 'Rewarded'];

const defaultIds = {
    appId: '',
    Banner: '',
    Interstitial: '',
    Rewarded: ''
};

export default function AdsConfig() {
    const { game } = useOutletContext();
    const [activeTab, setActiveTab] = useState('Android');
    const [loading, setLoading] = useState(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.user?.role === 'admin' || userInfo?.user?.role === 'super_admin';

    // Core Ad IDs Config 
    const [adIds, setAdIds] = useState({
        Android: { ...defaultIds },
        iOS: { ...defaultIds }
    });

    const [savingIds, setSavingIds] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Placements Config
    const [placements, setPlacements] = useState({
        Android: [],
        iOS: []
    });

    const [savingRows, setSavingRows] = useState({});
    const [deletingRows, setDeletingRows] = useState({});

    useEffect(() => {
        const fetchAdsData = async () => {
            try {
                setLoading(true);

                // Fetch Core IDs
                const idsRes = await api.get(`/games/${game._id}/ads`);
                const idsList = idsRes.data.data;
                const newAdIds = {
                    Android: { ...defaultIds },
                    iOS: { ...defaultIds }
                };

                idsList.forEach(ad => {
                    if (newAdIds[ad.platform]) {
                        newAdIds[ad.platform].appId = ad.appId || newAdIds[ad.platform].appId;
                        if (ad.adType && ad.adUnitId) {
                            newAdIds[ad.platform][ad.adType] = ad.adUnitId;
                        }
                    }
                });

                setAdIds(newAdIds);

                // Fetch Placements
                const placementsRes = await api.get(`/games/${game._id}/ad-placements`);
                const placementsList = placementsRes.data.data;

                const groupedPlacements = { Android: [], iOS: [] };

                placementsList.forEach(p => {
                    const mappedP = { ...p, localId: p._id };
                    if (groupedPlacements[p.platform]) {
                        groupedPlacements[p.platform].push(mappedP);
                    }
                });

                setPlacements(groupedPlacements);

            } catch (error) {
                toast.error('Failed to load ads configuration');
            } finally {
                setLoading(false);
            }
        };
        if (game) fetchAdsData();
    }, [game]);

    const handleCopy = (text, id) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSaveIds = async () => {
        try {
            setSavingIds(true);
            const data = adIds[activeTab];

            if (!data.appId) return toast.error("AdMob App ID is required");

            for (const adType of AD_TYPES) {
                const payload = {
                    environment: 'PROD',
                    platform: activeTab,
                    adType: adType,
                    appId: data.appId,
                    adUnitId: data[adType] || '',
                    placement: 'Default',
                    frequency: 'Default'
                };

                // For simplicity we'll just POST them assuming our backend checks for existence or we don't care
                // Wait, our backend AdsConfig controller doesn't have an upsert by type smoothly without IDs.
                // It's better to fetch existing first, but for now we'll send a custom "upsert" wrapper if needed.
                // Actually the IDs are simple strings, let's just make the backend save all.
                // Wait, if we use POST without knowing the ID it creates duplicates.
                // So let's fetch first internally or rely on the fact they are updated.

                // To fix the duplication issue, we'll fetch existing ads inside the save loop
                const existingRes = await api.get(`/games/${game._id}/ads`);
                const existingList = existingRes.data.data;
                const existingSelf = existingList.find(x => x.platform === activeTab && x.adType === adType);

                if (existingSelf) {
                    await api.put(`/games/${game._id}/ads/${existingSelf._id}`, payload);
                } else if (payload.adUnitId) {
                    await api.post(`/games/${game._id}/ads`, payload);
                }
            }

            toast.success(`Core Ad IDs for ${activeTab} saved!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save Ad IDs');
        } finally {
            setSavingIds(false);
        }
    };

    const handleAddRow = () => {
        const newRow = {
            localId: `temp_${Date.now()}`,
            adType: 'Banner',
            placement: '',
            frequency: '',
            notes: ''
        };

        setPlacements(prev => ({
            ...prev,
            [activeTab]: [...prev[activeTab], newRow]
        }));
    };

    const handleRowChange = (localId, field, value) => {
        setPlacements(prev => {
            const platformConfigs = [...prev[activeTab]];
            const index = platformConfigs.findIndex(r => r.localId === localId);
            if (index !== -1) {
                platformConfigs[index] = { ...platformConfigs[index], [field]: value };
            }
            return { ...prev, [activeTab]: platformConfigs };
        });
    };

    const handleSaveRow = async (row) => {
        try {
            if (!row.placement) {
                return toast.error("Placement name cannot be empty.");
            }

            setSavingRows(prev => ({ ...prev, [row.localId]: true }));

            const payload = {
                environment: 'PROD',
                platform: activeTab,
                adType: row.adType,
                placement: row.placement || 'Default',
                frequency: row.frequency || 'Default',
                notes: row.notes || ''
            };

            let savedRow;

            if (row.localId.toString().startsWith('temp_')) {
                const res = await api.post(`/games/${game._id}/ad-placements`, payload);
                savedRow = res.data.data;
            } else {
                const res = await api.put(`/games/${game._id}/ad-placements/${row._id}`, payload);
                savedRow = res.data.data;
            }

            setPlacements(prev => {
                const platformConfigs = [...prev[activeTab]];
                const index = platformConfigs.findIndex(r => r.localId === row.localId);
                if (index !== -1) {
                    platformConfigs[index] = { ...savedRow, localId: savedRow._id };
                }
                return { ...prev, [activeTab]: platformConfigs };
            });

            toast.success('Placement configuration saved!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save configuration');
        } finally {
            setSavingRows(prev => ({ ...prev, [row.localId]: false }));
        }
    };

    const handleDeleteRow = async (row) => {
        if (row.localId.toString().startsWith('temp_')) {
            setPlacements(prev => ({
                ...prev,
                [activeTab]: prev[activeTab].filter(r => r.localId !== row.localId)
            }));
            return;
        }

        try {
            setDeletingRows(prev => ({ ...prev, [row.localId]: true }));
            await api.delete(`/games/${game._id}/ad-placements/${row._id}`);

            setPlacements(prev => ({
                ...prev,
                [activeTab]: prev[activeTab].filter(r => r.localId !== row.localId)
            }));
            toast.success("Placement configuration deleted.");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete configuration');
            setDeletingRows(prev => ({ ...prev, [row.localId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
        );
    }

    const currentRows = placements[activeTab] || [];
    const fields = [
        { type: 'Banner', label: 'Banner Ad Unit ID', desc: 'Used for standard banner ads' },
        { type: 'Interstitial', label: 'Interstitial Ad Unit ID', desc: 'Used for full-screen ads' },
        { type: 'Rewarded', label: 'Rewarded Ad Unit ID', desc: 'Used for ads that reward users' },
    ];

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Ad Monetization Config</h1>
                    <p className="text-zinc-400 text-sm">Manage exact AdMob App IDs and placement matrices per platform.</p>
                </div>
            </div>

            <div className="flex border-b border-zinc-800/80 bg-[#121214] shrink-0">
                {PLATFORMS.map(tab => (
                    game.platformsSupported.includes(tab) && (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-3 font-medium text-sm border-b-2 transition-all",
                                activeTab === tab
                                    ? "border-violet-500 text-violet-400"
                                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                            )}
                        >
                            {tab} Config
                        </button>
                    )
                ))}
            </div>

            <div key={activeTab} className="tab-panel flex-1 overflow-y-auto pr-2 space-y-6">

                {/* SECTION 1: CORE AD IDs */}
                <div className="glass-panel border-zinc-800/50 rounded-xl overflow-hidden">
                    <div className="bg-zinc-900/40 p-4 border-b border-zinc-800/50 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-medium text-zinc-200">Ad Unit IDs</h2>
                            <p className="text-sm text-zinc-500">Configure global App IDs and specific core Unit IDs.</p>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={handleSaveIds}
                                disabled={savingIds}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm shadow-violet-500/20"
                            >
                                {savingIds ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {savingIds ? 'Saving...' : 'Save IDs'}
                            </button>
                        )}
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-lg p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                            <div className="flex-1">
                                <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                                    AdMob App ID
                                </label>
                                <p className="text-xs text-zinc-500 mt-1">Identifies your app in AdMob. Overarching for all units.</p>
                            </div>
                            <div className="flex-1 max-w-sm w-full flex gap-2">
                                <input
                                    type="text"
                                    value={adIds[activeTab].appId}
                                    onChange={(e) => setAdIds(p => ({ ...p, [activeTab]: { ...p[activeTab], appId: e.target.value } }))}
                                    readOnly={!isAdmin}
                                    placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-2 px-3 text-sm font-mono text-zinc-300 focus:border-violet-500 outline-none transition-all focus:ring-1 focus:ring-violet-500"
                                />
                            </div>
                        </div>

                        <hr className="border-t border-zinc-800/50" />

                        {fields.map((field) => (
                            <div key={field.type} className="bg-zinc-900/40 border border-zinc-800/80 rounded-lg p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                                <div className="flex-1">
                                    <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                                        {field.label}
                                    </label>
                                    <p className="text-xs text-zinc-500 mt-1">{field.desc}</p>
                                </div>

                                <div className="flex-1 max-w-sm w-full flex gap-2">
                                    <input
                                        type="text"
                                        value={adIds[activeTab][field.type]}
                                        onChange={(e) => setAdIds(p => ({ ...p, [activeTab]: { ...p[activeTab], [field.type]: e.target.value } }))}
                                        readOnly={!isAdmin}
                                        placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-2 px-3 text-sm font-mono text-zinc-300 focus:border-violet-500 outline-none transition-all focus:ring-1 focus:ring-violet-500"
                                    />
                                    <button
                                        onClick={() => handleCopy(adIds[activeTab][field.type], field.type)}
                                        className="flex items-center justify-center w-10 shrink-0 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-zinc-400 hover:text-white transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {copiedId === field.type ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION 2: PLACEMENTS MATRIX */}
                <div className="glass-panel border-zinc-800/50 rounded-xl overflow-hidden mt-6">
                    <div className="bg-zinc-900/40 p-4 border-b border-zinc-800/50 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-medium text-zinc-200">Placements Matrix</h2>
                            <p className="text-sm text-zinc-500">Document locations, frequencies, and purposes per ad type.</p>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={handleAddRow}
                                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors border border-zinc-700"
                            >
                                <Plus size={16} /> Add Placement
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="bg-[#1a1a1c] border-b border-zinc-800">
                                <tr>
                                    <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[15%]">Ad Type</th>
                                    <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[30%]">Placement / Screen</th>
                                    <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[25%]">Frequency</th>
                                    <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[20%]">Purpose / Notes</th>
                                    <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right w-[10%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {currentRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-zinc-500 text-sm">
                                            No placements added.
                                        </td>
                                    </tr>
                                ) : (
                                    currentRows.map(row => (
                                        <tr key={row.localId} className="hover:bg-zinc-900/30 transition-colors group">
                                            <td className="p-4 align-top">
                                                <select
                                                    value={row.adType}
                                                    onChange={e => handleRowChange(row.localId, 'adType', e.target.value)}
                                                    disabled={!isAdmin}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm text-zinc-300 focus:border-violet-500 outline-none"
                                                    style={{ backgroundColor: '#18181b' }}
                                                >
                                                    {AD_TYPES.map(t => <option key={t} value={t}>{t} Ad</option>)}
                                                </select>
                                            </td>

                                            <td className="p-4 align-top">
                                                <textarea
                                                    value={row.placement}
                                                    onChange={e => handleRowChange(row.localId, 'placement', e.target.value)}
                                                    readOnly={!isAdmin}
                                                    placeholder="Menu, Settings..."
                                                    rows={3}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm text-zinc-300 focus:border-violet-500 outline-none resize-none"
                                                />
                                            </td>

                                            <td className="p-4 align-top">
                                                <textarea
                                                    value={row.frequency}
                                                    onChange={e => handleRowChange(row.localId, 'frequency', e.target.value)}
                                                    readOnly={!isAdmin}
                                                    placeholder="Always visible..."
                                                    rows={3}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm text-zinc-300 focus:border-violet-500 outline-none resize-none"
                                                />
                                            </td>

                                            <td className="p-4 align-top">
                                                <textarea
                                                    value={row.notes}
                                                    onChange={e => handleRowChange(row.localId, 'notes', e.target.value)}
                                                    readOnly={!isAdmin}
                                                    placeholder="Avoid distraction..."
                                                    rows={3}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm text-zinc-300 focus:border-violet-500 outline-none resize-none"
                                                />
                                            </td>

                                            <td className="p-4 text-right align-top">
                                                {isAdmin && (
                                                    <div className="flex items-center justify-end gap-2 pt-1">
                                                        <button
                                                            onClick={() => handleSaveRow(row)}
                                                            disabled={savingRows[row.localId] || deletingRows[row.localId]}
                                                            title="Save Configuration"
                                                            className="p-2 bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white rounded-md transition-colors disabled:opacity-50"
                                                        >
                                                            {savingRows[row.localId] ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRow(row)}
                                                            disabled={savingRows[row.localId] || deletingRows[row.localId]}
                                                            title="Delete Configuration"
                                                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-colors disabled:opacity-50"
                                                        >
                                                            {deletingRows[row.localId] ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

