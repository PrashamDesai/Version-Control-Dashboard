import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
    LayoutDashboard,
    Rocket,
    Settings2,
    Link as LinkIcon,
    MonitorSmartphone,
    CheckSquare,
    Store,
    FileCheck,
    PanelLeftClose,
    PanelLeft,
    ChevronLeft,
    Database,
    User,
    LogOut,
    Trash2,
    Bug,
} from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';
import ProfileEditModal from './ProfileEditModal';
import api from '../services/api';

const navItems = [
    { name: 'Overview', path: 'overview', icon: LayoutDashboard },
    { name: 'Releases', path: 'releases', icon: Rocket },
    { name: 'Env & Configs', path: 'environments', icon: Settings2 },
    { name: 'Ads Config', path: 'ads', icon: MonitorSmartphone },
    { name: 'Deploy Details', path: 'store', icon: Store },
    { name: 'CBD', path: 'checklist', icon: CheckSquare },
    { name: 'Links', path: 'links', icon: LinkIcon },
    { name: 'Closed Test', path: 'closed-test', icon: FileCheck },
    { name: 'QA Bug', path: 'qa-bug', icon: Bug },
    { name: 'Firestore Rules', path: 'firestore-rules', icon: Database },
];

export default function Sidebar({ game }) {
    const [collapsed, setCollapsed] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userData, setUserData] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const slug = game?.slug;

    // Seed from localStorage immediately
    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (stored) setUserData(JSON.parse(stored)?.user || null);
    }, []);

    // Fetch fresh user data from backend
    const fetchMe = useCallback(async () => {
        try {
            const res = await api.get('/auth/me');
            const fresh = res.data.data;
            setUserData(fresh);
            const stored = localStorage.getItem('userInfo');
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.user = { ...parsed.user, ...fresh };
                localStorage.setItem('userInfo', JSON.stringify(parsed));
            }
        } catch {
            // Fall back to cached data
        }
    }, []);

    useEffect(() => { fetchMe(); }, [fetchMe]);

    const role = userData?.role || 'user';

    const roleBadge = {
        super_admin: { label: 'Super Admin', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
        admin: { label: 'Admin', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        user: { label: 'User', color: 'text-zinc-500 bg-zinc-800 border-zinc-700' },
    }[role] || { label: 'User', color: 'text-zinc-500 bg-zinc-800 border-zinc-700' };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete('/auth/delete');
            localStorage.removeItem('userInfo');
            navigate('/login');
            toast.success('Account deleted');
        } catch {
            toast.error('Failed to delete account');
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    const handleProfileUpdated = (updated) => {
        setUserData(prev => ({ ...prev, ...updated }));
    };

    // Resolve avatar URL
    const avatarSrc = userData?.avatarUrl
        ? userData.avatarUrl.startsWith('http')
            ? userData.avatarUrl
            : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${userData.avatarUrl}`
        : null;

    return (
        <>
            <div
                className={cn(
                    'flex flex-col h-full bg-[#0a0a0a] border-r border-zinc-800/50 transition-all duration-300 relative',
                    collapsed ? 'w-20' : 'w-64'
                )}
            >
                {/* Back to games header */}
                <div className="h-16 flex flex-col justify-center px-4 border-b border-zinc-800/50 flex-shrink-0 relative">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Link to="/games" className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-500 flex items-center justify-center flex-shrink-0 transition-colors group">
                            <ChevronLeft size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
                        </Link>
                        {!collapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Back to Games</span>
                                <span className="font-semibold text-sm tracking-tight truncate text-white" title={game?.name}>
                                    {game?.name || 'Unknown Game'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 bg-zinc-800 border-zinc-700 border text-zinc-400 hover:text-white rounded-full p-1 z-10 transition-colors shadow-black/50 shadow-sm"
                >
                    {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
                </button>

                {/* Nav items */}
                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {!collapsed && (
                        <div className="px-3 mb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Game Management
                        </div>
                    )}
                    {navItems.map((item) => {
                        const fullPath = `/games/${slug}/${item.path}`;
                        const isActive = location.pathname.includes(`/${item.path}`);
                        return (
                            <Link
                                key={item.path}
                                to={fullPath}
                                title={collapsed ? item.name : undefined}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative',
                                    isActive
                                        ? 'bg-blue-500/10 text-blue-400 font-medium'
                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                                )}
                            >
                                <item.icon size={18} className={cn('flex-shrink-0', isActive ? 'text-blue-500' : 'text-zinc-500 group-hover:text-zinc-300')} />
                                {!collapsed && <span>{item.name}</span>}
                                {isActive && collapsed && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-md" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Profile section at the bottom – click to edit */}
                <div className="border-t border-zinc-800/50 p-3 flex-shrink-0">
                    {!collapsed ? (
                        <div className="space-y-1.5">
                            {/* Clickable profile card */}
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 transition-colors text-left group"
                                title="Edit profile"
                            >
                                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={13} className="text-zinc-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                                        {userData?.name || 'User'}
                                    </p>
                                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', roleBadge.color)}>
                                        {roleBadge.label}
                                    </span>
                                </div>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                            >
                                <LogOut size={12} /> Logout
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-500/80 hover:text-red-400 hover:bg-zinc-800/60 transition-colors"
                            >
                                <Trash2 size={12} /> Delete Account
                            </button>
                        </div>
                    ) : (
                        <button
                            title="Edit profile"
                            onClick={() => setShowProfileModal(true)}
                            className="w-full flex items-center justify-center py-2 text-zinc-500 hover:text-white transition-colors overflow-hidden"
                        >
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                                <User size={14} className="text-zinc-500" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Your Account?"
                message="Your account will be permanently deleted. This cannot be undone."
                confirmLabel="Delete Account"
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            <ProfileEditModal
                isOpen={showProfileModal}
                user={userData}
                onClose={() => setShowProfileModal(false)}
                onUpdated={handleProfileUpdated}
            />
        </>
    );
}
