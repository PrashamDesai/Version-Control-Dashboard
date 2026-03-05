import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
    LayoutGrid,
    Settings,
    LogOut,
    Trash2,
    User,
    Users,
    ShieldCheck,
    PanelLeft,
    PanelLeftClose,
} from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';
import ProfileEditModal from './ProfileEditModal';
import api from '../services/api';

export default function MainSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userData, setUserData] = useState(null);

    // Seed from localStorage immediately so UI isn't blank
    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (stored) {
            setUserData(JSON.parse(stored)?.user || null);
        }
    }, []);

    // Fetch fresh user data from backend
    const fetchMe = useCallback(async () => {
        try {
            const res = await api.get('/auth/me');
            const fresh = res.data.data;
            setUserData(fresh);
            // Sync localStorage
            const stored = localStorage.getItem('userInfo');
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.user = { ...parsed.user, ...fresh };
                localStorage.setItem('userInfo', JSON.stringify(parsed));
            }
        } catch {
            // Silently fall back to cached data
        }
    }, []);

    useEffect(() => { fetchMe(); }, [fetchMe]);

    const role = userData?.role || 'user';
    const isAdminOrSuper = role === 'admin' || role === 'super_admin';

    const roleBadge = {
        super_admin: { label: 'Super Admin', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
        admin: { label: 'Admin', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        user: { label: 'User', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' },
    }[role] || { label: 'User', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' };

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
        } catch (err) {
            toast.error('Failed to delete account');
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    const handleProfileUpdated = (updated) => {
        // Updated data is already fresh from DB (ProfileEditModal re-fetches /auth/me)
        setUserData(prev => ({ ...prev, ...updated, id: updated._id }));
        // Also re-sync from DB in case other components need it
        fetchMe();
    };

    // Resolve avatar URL (relative backend path → full URL)
    const avatarSrc = userData?.avatarUrl
        ? userData.avatarUrl.startsWith('http')
            ? userData.avatarUrl
            : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${userData.avatarUrl}`
        : null;

    return (
        <>
            <aside
                className={cn(
                    'flex flex-col h-full bg-[#0a0a0a] border-r border-zinc-800/50 transition-all duration-300 relative flex-shrink-0',
                    collapsed ? 'w-16' : 'w-60'
                )}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center px-4 border-b border-zinc-800/50 gap-3 flex-shrink-0">
                    <Link to="/" className="flex items-center gap-3 overflow-hidden group">
                        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-sm font-black text-white italic">EG</span>
                        </div>
                        {!collapsed && (
                            <span className="text-sm font-bold text-white tracking-tight group-hover:text-violet-400 transition-colors">EchoGames</span>
                        )}
                    </Link>
                </div>

                {/* Floating collapse button — same as in-game Sidebar */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white rounded-full p-1 z-10 transition-colors shadow-sm shadow-black/50"
                >
                    {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
                </button>

                {/* Nav items */}
                <nav className="flex-1 py-4 px-2 pr-4 space-y-1 overflow-y-auto">
                    {!collapsed && (
                        <div className="px-2 mb-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                            Navigation
                        </div>
                    )}

                    <SidebarLink
                        to="/games"
                        icon={LayoutGrid}
                        label="Games"
                        collapsed={collapsed}
                        active={location.pathname === '/games' || location.pathname === '/'}
                    />

                    <SidebarLink
                        to="/team"
                        icon={Users}
                        label="Team"
                        collapsed={collapsed}
                        active={location.pathname === '/team'}
                    />

                    <SidebarLink
                        to="/settings"
                        icon={Settings}
                        label="Settings"
                        collapsed={collapsed}
                        active={location.pathname === '/settings'}
                    />

                    {isAdminOrSuper && (
                        <>
                            {!collapsed && (
                                <div className="px-2 pt-3 mb-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                                    Administration
                                </div>
                            )}
                            <SidebarLink
                                to="/admin"
                                icon={ShieldCheck}
                                label="Admin Dashboard"
                                collapsed={collapsed}
                                active={location.pathname === '/admin'}
                                accent="purple"
                            />
                        </>
                    )}
                </nav>

                {/* Profile section – click to edit */}
                <div className="border-t border-zinc-800/50 p-3 flex-shrink-0">
                    {!collapsed ? (
                        <div className="space-y-2">
                            {/* Clickable profile card */}
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 transition-colors text-left group"
                                title="Edit profile"
                            >
                                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={14} className="text-zinc-400" />
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
                                <LogOut size={13} /> Logout
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-500/80 hover:text-red-400 hover:bg-zinc-800/60 transition-colors"
                            >
                                <Trash2 size={13} /> Delete Account
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
                                <User size={18} />
                            )}
                        </button>
                    )}
                </div>
            </aside>

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

function SidebarLink({ to, icon: Icon, label, collapsed, active, accent = 'violet' }) {
    const accentClasses = {
        violet: active ? 'bg-violet-500/10 text-violet-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40',
        purple: active ? 'bg-purple-500/10 text-purple-400' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40',
    };
    const iconAccent = {
        violet: active ? 'text-violet-500' : 'text-zinc-500 group-hover:text-zinc-300',
        purple: active ? 'text-purple-500' : 'text-zinc-500 group-hover:text-zinc-300',
    };

    return (
        <Link
            to={to}
            title={collapsed ? label : undefined}
            className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                accentClasses[accent]
            )}
        >
            <Icon size={17} className={cn('flex-shrink-0', iconAccent[accent])} />
            {!collapsed && <span>{label}</span>}
        </Link>
    );
}
