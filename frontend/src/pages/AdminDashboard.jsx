import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, Trash2, ChevronDown, User, Shield } from 'lucide-react';
import api from '../services/api';
import { cn } from '../lib/utils';
import ConfirmDialog from '../components/ConfirmDialog';

const ROLES = ['user', 'admin', 'super_admin'];

const roleBadge = (role) => ({
    super_admin: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    admin: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    user: 'text-zinc-400 bg-zinc-800/60 border-zinc-700',
}[role] || 'text-zinc-400 bg-zinc-800/60 border-zinc-700');

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }

    const userInfoString = localStorage.getItem('userInfo');
    const me = userInfoString ? JSON.parse(userInfoString)?.user : null;
    const isSuperAdmin = me?.role === 'super_admin';

    // Redirect non-admins away
    useEffect(() => {
        if (me && me.role === 'user') {
            toast.error('Access denied');
            navigate('/games');
        }
    }, [me, navigate]);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users');
            setUsers(res.data.data);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            setUpdatingId(userId);
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            toast.success('Role updated');
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (userId) => {
        try {
            setUpdatingId(userId);
            await api.delete(`/admin/users/${userId}`);
            toast.success('User deleted');
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setUpdatingId(null);
            setConfirmDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <ShieldCheck size={18} className="text-purple-400" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
                    <p className="text-xs text-zinc-500">
                        {isSuperAdmin ? 'Manage user roles and accounts' : 'View registered users'}
                    </p>
                </div>
                <div className="ml-auto text-xs text-zinc-500">{users.length} user{users.length !== 1 ? 's' : ''}</div>
            </div>

            {/* Permissions info */}
            {!isSuperAdmin && (
                <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/15 rounded-xl px-4 py-3">
                    <Shield size={14} className="text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-amber-300">
                        You're viewing as <strong>Admin</strong>. Role editing and account deletion require Super Admin access.
                    </p>
                </div>
            )}

            {/* Users table */}
            <div className="rounded-xl border border-zinc-800/60 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={28} className="animate-spin text-violet-500" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500 text-sm">No users found.</div>
                ) : (
                    <>
                        {/* PC Table View */}
                        <div className="hidden xl:block overflow-x-auto">
                            <div className="min-w-full">
                                <div className="grid grid-cols-[1fr_auto_auto_auto] text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3 bg-zinc-900/60 border-b border-zinc-800/60">
                                    <span>User</span>
                                    <span className="text-center px-8">Role</span>
                                    {isSuperAdmin && <span className="text-center px-4">Change Role</span>}
                                    {isSuperAdmin && <span className="text-center px-4">Actions</span>}
                                </div>
                                <div className="divide-y divide-zinc-800/40">
                                    {users.map(u => (
                                        <div
                                            key={u._id}
                                            className={cn(
                                                'grid grid-cols-[1fr_auto_auto_auto] items-center px-6 py-4 transition-colors',
                                                u._id === me?._id ? 'bg-violet-500/5' : 'hover:bg-zinc-900/40'
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                                    {u.avatarUrl ? (
                                                        <img src={u.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <User size={16} className="text-zinc-500" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-zinc-100 truncate">
                                                        {u.name}
                                                        {u._id === me?._id && <span className="ml-2 text-[10px] text-violet-400 font-semibold">(you)</span>}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 truncate">{u.email || u.phone || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-center px-8">
                                                <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize', roleBadge(u.role))}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {isSuperAdmin && (
                                                <div className="flex justify-center px-4">
                                                    <div className="relative">
                                                        <select
                                                            value={u.role}
                                                            disabled={updatingId === u._id || u._id === me?._id}
                                                            onChange={e => handleRoleChange(u._id, e.target.value)}
                                                            className="appearance-none bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                                    </div>
                                                </div>
                                            )}
                                            {isSuperAdmin && (
                                                <div className="flex justify-center px-4">
                                                    {updatingId === u._id ? <Loader2 size={14} className="animate-spin text-zinc-500" /> : (
                                                        <button
                                                            disabled={u._id === me?._id}
                                                            onClick={() => setConfirmDelete({ id: u._id, name: u.name })}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile/Tablet Card View */}
                        <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                            {users.map(u => (
                                <div key={u._id} className={cn("p-4 space-y-4 border border-zinc-800/50 rounded-xl", u._id === me?._id ? 'bg-violet-500/5' : 'bg-zinc-900/40')}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User size={18} className="text-zinc-500" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-zinc-100 truncate">
                                                    {u.name}
                                                    {u._id === me?._id && <span className="ml-1 text-[10px] text-violet-400">(you)</span>}
                                                </p>
                                                <p className="text-xs text-zinc-500 truncate">{u.email || u.phone || '—'}</p>
                                            </div>
                                        </div>
                                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize shrink-0', roleBadge(u.role))}>
                                            {u.role.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {isSuperAdmin && (
                                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800/40">
                                            <div className="flex-1 relative">
                                                <select
                                                    value={u.role}
                                                    disabled={updatingId === u._id || u._id === me?._id}
                                                    onChange={e => handleRoleChange(u._id, e.target.value)}
                                                    className="w-full appearance-none bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 pr-8 focus:border-violet-500 outline-none transition-colors disabled:opacity-40"
                                                >
                                                    {ROLES.map(r => <option key={r} value={r}>Role: {r.replace('_', ' ')}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                                            </div>
                                            <button
                                                disabled={u._id === me?._id || updatingId === u._id}
                                                onClick={() => setConfirmDelete({ id: u._id, name: u.name })}
                                                className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 active:bg-red-500/20 transition-colors disabled:opacity-30"
                                            >
                                                {updatingId === u._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                title={`Delete "${confirmDelete?.name}"?`}
                message="This account will be permanently deactivated and cannot be recovered."
                confirmLabel="Delete Account"
                onConfirm={() => handleDelete(confirmDelete.id)}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
}

