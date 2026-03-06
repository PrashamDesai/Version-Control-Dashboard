import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
    Smartphone, MonitorPlay, Activity, Server, Loader2,
    ExternalLink, CalendarDays, Layers, Tag, Globe, Pencil, Check, X,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import { toast } from 'sonner';

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon: Icon, accent = 'blue' }) => {
    const accentMap = {
        blue: 'text-violet-400 bg-violet-500/10',
        green: 'text-emerald-400 bg-emerald-500/10',
        amber: 'text-amber-400 bg-amber-500/10',
        purple: 'text-purple-400 bg-purple-500/10',
    };
    return (
        <div className="glass-panel p-5 rounded-xl flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{title}</p>
                <div className={cn('p-2 rounded-lg', accentMap[accent])}>
                    <Icon size={16} />
                </div>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        </div>
    );
};

// ── Play Store icon ────────────────────────────────────────────────────────────
const PlayStoreIcon = ({ className }) => (
    <img
        src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg"
        alt="Play Store"
        className={cn("w-4 h-4 object-contain", className)}
    />
);

// ── App Store icon ─────────────────────────────────────────────────────────────
const AppStoreIcon = ({ className }) => (
    <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg"
        alt="App Store"
        className={cn("w-4 h-4 object-contain", className)}
    />
);

// ── Gitlab icon ────────────────────────────────────────────────────────────────
const GitlabIcon = ({ className }) => (
    <img
        src={`${import.meta.env.VITE_API_URL}/images/69aa69ad055df9bceedd87eb`}
        alt="GitLab"
        className={cn("w-6 h-6 sm:w-8 sm:h-8 object-contain", className)}
    />
);

// ── Big Store URL Card ─────────────────────────────────────────────────────
const BigStoreLogoLink = ({ platform, icon, url, onSave, canEdit = true }) => {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(url || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(val.trim());
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    if (editing) {
        return (
            <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-black/40 border border-white/10 rounded-2xl w-24 h-24 sm:w-28 sm:h-28 backdrop-blur-md">
                <input
                    autoFocus
                    type="url"
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    placeholder="URL..."
                    className="w-full text-[10px] sm:text-xs bg-zinc-900 border border-zinc-700 rounded mb-2 px-1 py-1 text-zinc-100 text-center"
                />
                <div className="flex gap-1 w-full">
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-1 bg-violet-600 hover:bg-violet-700 rounded text-white flex justify-center items-center">
                        {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                    </button>
                    <button onClick={() => { setEditing(false); setVal(url || ''); }} className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 flex justify-center items-center">
                        <X size={10} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative flex flex-col items-center justify-center p-3 sm:p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all w-24 h-24 sm:w-28 sm:h-28">
            <a
                href={url || '#'}
                onClick={e => { if (!url) { e.preventDefault(); if (canEdit) setEditing(true); } }}
                target={url ? "_blank" : undefined}
                rel="noreferrer"
                className={`flex flex-col flex-1 w-full items-center justify-center gap-2 sm:gap-3 ${!url ? 'opacity-50 grayscale' : ''}`}
            >
                <div>
                    {icon}
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-zinc-300 tracking-wider text-center leading-tight">
                    {platform}
                </span>
            </a>

            {canEdit && (
                <button
                    onClick={(e) => { e.preventDefault(); setEditing(true); }}
                    className="absolute -top-2 -right-2 p-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                    title={`Edit ${platform} URL`}
                >
                    <Pencil size={12} />
                </button>
            )}
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function Overview() {
    const { game } = useOutletContext();
    const [releases, setReleases] = useState([]);
    const [environmentsCount, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Local mutable state
    const [playStoreUrl, setPlayStoreUrl] = useState(game?.playStoreUrl || '');
    const [appStoreUrl, setAppStoreUrl] = useState(game?.appStoreUrl || '');
    const [gitlabUrl, setGitlabUrl] = useState(game?.gitlabUrl || '');

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.user?.role === 'admin' || userInfo?.user?.role === 'super_admin';

    useEffect(() => {
        setPlayStoreUrl(game?.playStoreUrl || '');
        setAppStoreUrl(game?.appStoreUrl || '');
        setGitlabUrl(game?.gitlabUrl || '');
    }, [game]);

    useEffect(() => {
        if (!game) return;
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [relRes, envRes] = await Promise.all([
                    api.get(`/games/${game._id}/releases?limit=5`),
                    api.get(`/games/${game._id}/environments`),
                ]);
                setReleases(relRes.data.data.releases || []);
                setCount(envRes.data.data.length || 0);
            } catch (err) {
                console.error('Failed to fetch overview stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [game]);

    const saveStoreUrl = async (field, value) => {
        try {
            await api.put(`/games/${game._id}`, { [field]: value });
            if (field === 'playStoreUrl') setPlayStoreUrl(value);
            else if (field === 'appStoreUrl') setAppStoreUrl(value);
            else if (field === 'gitlabUrl') setGitlabUrl(value);
            toast.success('URL updated!');
        } catch {
            toast.error('Failed to update URL');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
        );
    }

    const liveReleases = releases.filter(r => r.status === 'Live');
    const latestAndroid = releases.find(r => r.platform === 'Android');
    const latestIos = releases.find(r => r.platform === 'iOS');
    const liveAndroid = liveReleases.find(r => r.platform === 'Android');
    const liveIos = liveReleases.find(r => r.platform === 'iOS');

    const isAndroid = game.platformsSupported?.includes('Android');
    const isIos = game.platformsSupported?.includes('iOS');
    const isLive = game.isActive;

    return (
        <div className="space-y-6">
            {/* ── Hero card ─────────────────────────────────────────────────── */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-zinc-800/80 bg-gradient-to-br from-[#0d0d10] via-[#111114] to-[#0a0a0e]">
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/6 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start justify-between w-full">
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center flex-1 min-w-0">
                        {/* Game icon */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 shadow-2xl border border-zinc-700 flex-shrink-0 flex items-center justify-center">
                            {game.iconUrl ? (
                                <img src={`${import.meta.env.VITE_IMAGE_BASE_URL}${game.iconUrl}`} alt="Game Icon" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-zinc-400 font-bold text-3xl">{game.name?.charAt(0)}</span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold tracking-tight text-white">{game.name}</h1>
                                <StatusBadge status={isLive ? 'Live' : 'Pending'} />
                            </div>

                            <p className="text-zinc-400 text-sm mb-3 max-w-xl leading-relaxed">
                                {game.description || 'No description provided for this game.'}
                            </p>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mb-1 pointer-events-none">
                                {isAndroid && (
                                    <span className="flex items-center gap-1.5">
                                        <Smartphone size={13} className="text-green-400" /> Android
                                    </span>
                                )}
                                {isIos && (
                                    <span className="flex items-center gap-1.5">
                                        <MonitorPlay size={13} className="text-violet-400" /> iOS
                                    </span>
                                )}
                                {game.slug && (
                                    <span className="flex items-center gap-1.5">
                                        <Tag size={13} /> {game.slug}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays size={13} />
                                    Added {new Date(game.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                {liveAndroid && (
                                    <span className="flex items-center gap-1.5 text-emerald-500">
                                        Android live: <strong>{liveAndroid.versionName}</strong>
                                    </span>
                                )}
                                {liveIos && (
                                    <span className="flex items-center gap-1.5 text-violet-400">
                                        iOS live: <strong>{liveIos.versionName}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Big Store Logos */}
                    <div className="flex gap-4 sm:ml-auto self-center shrink-0">
                        {isAndroid && (
                            <BigStoreLogoLink
                                platform="Play Store"
                                icon={<PlayStoreIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
                                url={playStoreUrl}
                                onSave={v => saveStoreUrl('playStoreUrl', v)}
                                canEdit={isAdmin}
                            />
                        )}
                        {isIos && (
                            <BigStoreLogoLink
                                platform="App Store"
                                icon={<AppStoreIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
                                url={appStoreUrl}
                                onSave={v => saveStoreUrl('appStoreUrl', v)}
                                canEdit={isAdmin}
                            />
                        )}
                        <BigStoreLogoLink
                            platform="GitLab"
                            icon={<GitlabIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
                            url={gitlabUrl}
                            onSave={v => saveStoreUrl('gitlabUrl', v)}
                            canEdit={isAdmin}
                        />
                    </div>
                </div>
            </div>

            {/* ── Stat cards ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Android Version"
                    value={latestAndroid?.versionName || '—'}
                    subtitle={latestAndroid ? `Build ${latestAndroid.buildNumber} · ${latestAndroid.status}` : 'No releases yet'}
                    icon={Smartphone}
                    accent="green"
                />
                <StatCard
                    title="iOS Version"
                    value={latestIos?.versionName || '—'}
                    subtitle={latestIos ? `Build ${latestIos.buildNumber} · ${latestIos.status}` : 'No releases yet'}
                    icon={MonitorPlay}
                    accent="blue"
                />
                <StatCard
                    title="Environments"
                    value={environmentsCount}
                    subtitle={`${environmentsCount} of 3 configured`}
                    icon={Server}
                    accent="purple"
                />
                <StatCard
                    title="Total Releases"
                    value={releases.length}
                    subtitle={`${liveReleases.length} currently live`}
                    icon={Activity}
                    accent="amber"
                />
            </div>

            {/* ── Bottom section ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 glass-panel rounded-xl border border-zinc-800/50 overflow-hidden">
                    <div className="p-5 border-b border-zinc-800/50 bg-[#111114] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers size={15} className="text-zinc-500" />
                            <h2 className="text-sm font-semibold text-white">Recent Releases</h2>
                        </div>
                        <span className="text-xs text-zinc-600">{releases.length} total</span>
                    </div>
                    {releases.length === 0 ? (
                        <div className="p-10 text-center text-zinc-600 text-sm">No releases found.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-600 bg-zinc-900/40 border-b border-zinc-800/50">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Version</th>
                                    <th className="px-5 py-3 font-medium">Platform</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/40">
                                {releases.map((release, i) => (
                                    <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-zinc-200">
                                            {release.versionName}
                                            <span className="text-zinc-600 font-normal ml-1.5 text-xs">#{release.buildNumber}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-zinc-400">{release.platform}</td>
                                        <td className="px-5 py-3.5"><StatusBadge status={release.status} /></td>
                                        <td className="px-5 py-3.5 text-zinc-600 text-xs">
                                            {new Date(release.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="glass-panel rounded-xl p-6 border border-zinc-800/50 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-full flex items-center justify-center mb-5 shadow-inner">
                            <ExternalLink size={24} className="text-violet-400" />
                        </div>
                        <h2 className="text-lg font-bold text-white mb-2">Developer Consoles</h2>
                        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                            Quickly jump to the developer portals to manage this game's store listings and production builds.
                        </p>
                        <div className="w-full space-y-3">
                            {isAndroid && (
                                <a href="https://play.google.com/console/u/0/developers" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm text-zinc-200 transition-colors font-medium">
                                    <PlayStoreIcon className="w-5 h-5" />
                                    <span>Google Play Console</span>
                                </a>
                            )}
                            {isIos && (
                                <a href="https://appstoreconnect.apple.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm text-zinc-200 transition-colors font-medium">
                                    <AppStoreIcon className="w-5 h-5" />
                                    <span>App Store Connect</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
