import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, ExternalLink, Link as LinkIcon, Loader2, Plus, Trash2, Download, Pencil, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import api from '../services/api';

// ── SDK metadata: icon + download/docs URL ────────────────────────────────────
const SDK_META = {
    firebaseAuth: {
        label: 'Firebase Authentication',
        url: 'https://firebase.google.com/docs/auth',
        // Firebase flame icon (SVG inline)
        icon: (
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <path d="M10 42L18 6l9 16 5-9 6 29H10Z" fill="#FFC107" />
                <path d="M10 42l14-14 14 14H10Z" fill="#F44336" opacity=".7" />
                <path d="M27 22l5-9 6 29" fill="#FF6F00" opacity=".8" />
            </svg>
        ),
    },
    googleSignIn: {
        label: 'Google Sign In',
        url: 'https://developers.google.com/identity/sign-in/android/start-integrating',
        icon: (
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <path d="M43.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11c-.5 2.4-1.9 4.5-4 5.9v4.9h6.5c3.8-3.5 6-8.7 6-14.8Z" fill="#4285F4" />
                <path d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.5-4.9c-1.8 1.2-4.1 1.9-7 1.9-5.4 0-9.9-3.6-11.5-8.5H6v5.1C9.4 39.8 16.2 44 24 44Z" fill="#34A853" />
                <path d="M12.5 27.6A12.5 12.5 0 0 1 12.5 20.4V15.3H6A19.9 19.9 0 0 0 4 24c0 3.2.8 6.2 2 8.7l6.5-5.1Z" fill="#FBBC05" />
                <path d="M24 11.5c3 0 5.7 1 7.8 3l5.8-5.8C34 5.3 29.4 4 24 4 16.2 4 9.4 8.2 6 15.3l6.5 5.1C14.1 15.1 18.6 11.5 24 11.5Z" fill="#EA4335" />
            </svg>
        ),
    },
    appleLogin: {
        label: 'Apple Login (iOS only)',
        url: 'https://developer.apple.com/documentation/sign_in_with_apple',
        icon: (
            // Apple logo — normalized 24x24 viewBox
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-200">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.37 2.83zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
        ),
    },
    crashlytics: {
        label: 'Firebase Crashlytics',
        url: 'https://firebase.google.com/docs/crashlytics/get-started',
        icon: (
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="#F44336" opacity=".15" />
                <path d="M14 34L24 14l10 20" stroke="#F44336" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 26h10" stroke="#F44336" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        ),
    },
    analytics: {
        label: 'Google Analytics',
        url: 'https://firebase.google.com/docs/analytics/get-started',
        icon: (
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="22" width="8" height="14" rx="2" fill="#FBBC05" />
                <rect x="16" y="14" width="8" height="22" rx="2" fill="#34A853" />
                <rect x="28" y="4" width="8" height="32" rx="2" fill="#4285F4" />
            </svg>
        ),
    },
    fcm: {
        label: 'Firebase Cloud Messaging',
        url: 'https://firebase.google.com/docs/cloud-messaging',
        icon: (
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="12" width="40" height="28" rx="4" fill="#1565C0" opacity=".15" />
                <rect x="4" y="12" width="40" height="28" rx="4" stroke="#42A5F5" strokeWidth="2" />
                <path d="M4 16l20 14L44 16" stroke="#42A5F5" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
};

const TABS = ['DEV', 'PROD'];

const defaultEnv = {
    bundleIdAndroid: '',
    bundleIdiOS: '',
    firebaseConsoleUrl: '',
    googlePlayStatus: 'Not Required',
    appleStoreStatus: 'Not Required',
    appleSKU: '',
    appleId: '',
    appleDevelopmentProfile: '',
    appleDistributionProfile: '',
    firebaseClientId: '',
    appId: '',
    appName: '',
    sdkIntegration: {
        firebaseAuth: 'Not Required',
        googleSignIn: 'Not Required',
        appleLogin: 'Not Required',
        crashlytics: 'Not Required',
        analytics: 'Not Required',
        fcm: 'Not Required',
    },
    // Each custom SDK: { name, status, downloadUrl }
    customSdks: [],
    // Per-SDK overridden download URLs for default SDKs (keyed by SDK key)
    sdkDownloadUrls: {},
};

// ── Inline editable SDK URL field ───────────────────────────────────────────
const SdkUrlEditor = ({ defaultUrl, currentUrl, onSave }) => {
    const [open, setOpen] = useState(false);
    const [val, setVal] = useState(currentUrl || '');

    // Sync when parent value changes (e.g. tab switch)
    useEffect(() => { setVal(currentUrl || ''); }, [currentUrl]);

    const effectiveUrl = currentUrl || defaultUrl;

    if (!open) {
        return (
            <div className="flex items-center gap-1 group/url">
                {effectiveUrl ? (
                    <a
                        href={effectiveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-600 hover:text-violet-400 transition-colors flex-shrink-0"
                        title={effectiveUrl}
                    >
                        <Download size={13} />
                    </a>
                ) : (
                    <span className="w-[13px]" />
                )}
                <button
                    onClick={() => setOpen(true)}
                    className="text-zinc-700 hover:text-zinc-400 transition-colors opacity-0 group-hover/url:opacity-100"
                    title="Edit download URL"
                >
                    <Pencil size={11} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 mt-0.5">
            <input
                autoFocus
                type="url"
                value={val}
                onChange={e => setVal(e.target.value)}
                placeholder="Paste URL…"
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-700 focus:border-violet-500 outline-none"
            />
            <button
                onClick={() => { onSave(val.trim()); setOpen(false); }}
                className="p-1 rounded bg-violet-600 hover:bg-violet-700 text-white transition-colors flex-shrink-0"
            >
                <Check size={11} />
            </button>
            <button
                onClick={() => { setVal(currentUrl || ''); setOpen(false); }}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors flex-shrink-0"
            >
                <X size={11} />
            </button>
        </div>
    );
};

export default function Environments() {
    const { game } = useOutletContext();
    const [activeTab, setActiveTab] = useState('DEV');
    const [newSdkName, setNewSdkName] = useState('');

    // Store an object map of { DEV: config, PROD: config }
    const [configs, setConfigs] = useState({
        DEV: { ...defaultEnv },
        PROD: { ...defaultEnv },
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchEnvs = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/games/${game._id}/environments`);
                const fetchedEnvs = res.data.data;

                setConfigs(prev => {
                    const next = { ...prev };
                    fetchedEnvs.forEach(env => {
                        if (next[env.environment]) {
                            next[env.environment] = { ...defaultEnv, ...env };
                        }
                    });
                    return next;
                });
            } catch (error) {
                toast.error('Failed to load environments');
            } finally {
                setLoading(false);
            }
        };
        if (game) fetchEnvs();
    }, [game]);

    const currentConfig = configs[activeTab];

    const handleUpdateField = (field, value) => {
        setConfigs(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value
            }
        }));
    };

    const handleSDKUpdate = (sdkKey, value) => {
        setConfigs(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                sdkIntegration: {
                    ...prev[activeTab].sdkIntegration,
                    [sdkKey]: value
                }
            }
        }));
    };

    const handleCustomSDKAdd = () => {
        if (!newSdkName.trim()) return;
        setConfigs(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                customSdks: [
                    ...(prev[activeTab].customSdks || []),
                    { name: newSdkName.trim(), status: 'Not Required', downloadUrl: '' }
                ]
            }
        }));
        setNewSdkName('');
    };

    // Update downloadUrl on a custom SDK
    const handleCustomSDKUrl = (index, url) => {
        setConfigs(prev => {
            const updatedSdks = [...(prev[activeTab].customSdks || [])];
            updatedSdks[index] = { ...updatedSdks[index], downloadUrl: url };
            return { ...prev, [activeTab]: { ...prev[activeTab], customSdks: updatedSdks } };
        });
    };

    const handleCustomSDKUpdate = (index, value) => {
        setConfigs(prev => {
            const updatedSdks = [...(prev[activeTab].customSdks || [])];
            updatedSdks[index].status = value;
            return {
                ...prev,
                [activeTab]: {
                    ...prev[activeTab],
                    customSdks: updatedSdks
                }
            }
        });
    };

    const handleCustomSDKRemove = (index) => {
        setConfigs(prev => {
            const updatedSdks = [...(prev[activeTab].customSdks || [])];
            updatedSdks.splice(index, 1);
            return {
                ...prev,
                [activeTab]: {
                    ...prev[activeTab],
                    customSdks: updatedSdks
                }
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = { ...currentConfig, environment: activeTab };
            const res = await api.put(`/games/${game._id}/environments/${activeTab.toLowerCase()}`, payload);

            // Update local state with saved document
            setConfigs(prev => ({
                ...prev,
                [activeTab]: res.data.data
            }));
            toast.success(`${activeTab} Environment configuration saved!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Done': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'Pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Env & Configs</h1>
                    <p className="text-zinc-400 text-sm">Manage bundle IDs, external links, and SDK statuses per environment.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm shadow-violet-500/20"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="glass-panel rounded-xl flex flex-col flex-1 overflow-hidden border border-zinc-800/50">
                <div className="flex border-b border-zinc-800/80 bg-[#121214] px-4 pt-4 shrink-0">
                    {TABS.map(tab => {
                        const getTabStyle = (t, isActive) => {
                            if (!isActive) return "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700";
                            if (t === 'DEV') return "border-violet-500 text-violet-400 bg-violet-500/5";
                            if (t === 'PROD') return "border-emerald-500 text-emerald-400 bg-emerald-500/5";
                            return "border-zinc-500 text-zinc-400";
                        };

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-3 font-medium text-sm border-b-2 transition-all rounded-t-lg",
                                    getTabStyle(tab, activeTab === tab)
                                )}
                            >
                                {tab} Environment
                            </button>
                        );
                    })}
                </div>

                <div key={activeTab} className="tab-panel flex-1 overflow-y-auto p-6 md:p-8 space-y-10">

                    <section>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Core Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Android Bundle ID', key: 'bundleIdAndroid' },
                                { label: 'iOS Bundle ID', key: 'bundleIdiOS' },
                                { label: 'App Name', key: 'appName' },
                                { label: 'App ID (Firebase)', key: 'appId' },
                                { label: 'Apple SKU', key: 'appleSKU' },
                                { label: 'Apple ID', key: 'appleId' },
                                { label: 'Apple Development Profile', key: 'appleDevelopmentProfile' },
                                { label: 'Apple Distribution Profile', key: 'appleDistributionProfile' },
                                { label: 'Client ID (Google Cloud/Firebase)', key: 'firebaseClientId' },
                            ].map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{field.label}</label>
                                    <input
                                        type="text"
                                        value={currentConfig[field.key] || ''}
                                        onChange={e => handleUpdateField(field.key, e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Google Play Console Project</label>
                                <select
                                    value={currentConfig.googlePlayStatus || 'Not Required'}
                                    onChange={e => handleUpdateField('googlePlayStatus', e.target.value)}
                                    className={cn(
                                        "w-full rounded-md border px-3 py-2 text-sm outline-none cursor-pointer",
                                        getStatusColor(currentConfig.googlePlayStatus || 'Not Required')
                                    )}
                                    style={{ backgroundColor: '#18181b' }}
                                >
                                    <option value="Done" className="text-emerald-400">Done</option>
                                    <option value="Pending" className="text-amber-400">Pending</option>
                                    <option value="Not Required" className="text-zinc-400">Not Required</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Apple AppStore Setup</label>
                                <select
                                    value={currentConfig.appleStoreStatus || 'Not Required'}
                                    onChange={e => handleUpdateField('appleStoreStatus', e.target.value)}
                                    className={cn(
                                        "w-full rounded-md border px-3 py-2 text-sm outline-none cursor-pointer",
                                        getStatusColor(currentConfig.appleStoreStatus || 'Not Required')
                                    )}
                                    style={{ backgroundColor: '#18181b' }}
                                >
                                    <option value="Done" className="text-emerald-400">Done</option>
                                    <option value="Pending" className="text-amber-400">Pending</option>
                                    <option value="Not Required" className="text-zinc-400">Not Required</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <hr className="border-t border-zinc-800/50" />

                    <section>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">External Dashboards</h3>
                        <div className="space-y-5">
                            {[
                                { label: 'Firebase Console', key: 'firebaseConsoleUrl', icon: LinkIcon }
                            ].map((item) => (
                                <div key={item.key} className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <label className="text-sm font-medium text-zinc-400 sm:w-48 shrink-0">{item.label}</label>
                                    <div className="flex-1 flex gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <item.icon size={14} className="text-zinc-500" />
                                            </div>
                                            <input
                                                type={item.noLink ? "text" : "url"}
                                                value={currentConfig[item.key] || ''}
                                                onChange={e => handleUpdateField(item.key, e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all"
                                            />
                                        </div>
                                        {!item.noLink && currentConfig[item.key] && (
                                            <a href={currentConfig[item.key]} target="_blank" rel="noreferrer" className="flex items-center justify-center p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-colors border border-zinc-700 shrink-0">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <hr className="border-t border-zinc-800/50" />

                    <section>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">SDK Integrations</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(SDK_META).map(([key, meta]) => (
                                <div key={key} className="bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-4 flex flex-col gap-3">
                                    {/* Icon + label + editable download link */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="flex-shrink-0">{meta.icon}</span>
                                            <span className="text-xs font-medium text-zinc-300 leading-snug">{meta.label}</span>
                                        </div>
                                        <SdkUrlEditor
                                            defaultUrl={meta.url}
                                            currentUrl={(currentConfig.sdkDownloadUrls || {})[key] || ''}
                                            onSave={url => {
                                                setConfigs(prev => ({
                                                    ...prev,
                                                    [activeTab]: {
                                                        ...prev[activeTab],
                                                        sdkDownloadUrls: {
                                                            ...(prev[activeTab].sdkDownloadUrls || {}),
                                                            [key]: url,
                                                        },
                                                    },
                                                }));
                                            }}
                                        />
                                    </div>
                                    <select
                                        value={currentConfig.sdkIntegration[key] || 'Not Required'}
                                        onChange={e => handleSDKUpdate(key, e.target.value)}
                                        className={cn(
                                            "w-full rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider outline-none cursor-pointer",
                                            getStatusColor(currentConfig.sdkIntegration[key] || 'Not Required')
                                        )}
                                        style={{ backgroundColor: '#18181b' }}
                                    >
                                        <option value="Done" className="text-emerald-400">Done</option>
                                        <option value="Pending" className="text-amber-400">Pending</option>
                                        <option value="Not Required" className="text-zinc-400">Not Required</option>
                                    </select>
                                </div>
                            ))}

                            {/* Render Custom SDKs */}
                            {currentConfig.customSdks && currentConfig.customSdks.map((sdk, idx) => (
                                <div key={`custom-${idx}`} className="bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-4 flex flex-col gap-3 group relative">
                                    <button
                                        onClick={() => handleCustomSDKRemove(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove custom SDK"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium text-zinc-300 truncate" title={sdk.name}>{sdk.name}</span>
                                        {/* Download URL link if provided */}
                                        {sdk.downloadUrl && (
                                            <a
                                                href={sdk.downloadUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-zinc-600 hover:text-violet-400 transition-colors flex-shrink-0"
                                                title="Download / docs"
                                            >
                                                <Download size={13} />
                                            </a>
                                        )}
                                    </div>
                                    {/* Optional download URL input */}
                                    <input
                                        type="url"
                                        placeholder="Download / docs URL"
                                        value={sdk.downloadUrl || ''}
                                        onChange={e => handleCustomSDKUrl(idx, e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 placeholder-zinc-700 focus:border-violet-500 outline-none"
                                    />
                                    <select
                                        value={sdk.status || 'Not Required'}
                                        onChange={e => handleCustomSDKUpdate(idx, e.target.value)}
                                        className={cn(
                                            "w-full rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider outline-none cursor-pointer",
                                            getStatusColor(sdk.status || 'Not Required')
                                        )}
                                        style={{ backgroundColor: '#18181b' }}
                                    >
                                        <option value="Done" className="text-emerald-400">Done</option>
                                        <option value="Pending" className="text-amber-400">Pending</option>
                                        <option value="Not Required" className="text-zinc-400">Not Required</option>
                                    </select>
                                </div>
                            ))}

                            {/* Add Custom SDK button inline box */}
                            <div className="border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg p-4 flex flex-col gap-3 justify-center transition-colors">
                                <span className="text-sm font-medium text-zinc-500">Add Custom SDK</span>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. AppsFlyer"
                                        value={newSdkName}
                                        onChange={e => setNewSdkName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleCustomSDKAdd()}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 focus:border-violet-500 outline-none"
                                    />
                                    <button
                                        onClick={handleCustomSDKAdd}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-1.5 rounded transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}

