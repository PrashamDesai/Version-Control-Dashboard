import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Mail, Shield, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const LOGIN_TYPES = [
    { id: 'user', label: 'User', icon: Mail },
    { id: 'admin', label: 'Admin', icon: Shield },
];

export default function Login() {
    const navigate = useNavigate();
    const [loginType, setLoginType] = useState('user');
    const [loading, setLoading] = useState(false);

    const getDefaultCreds = (type) =>
        type === 'admin' ? { id: '9726733369', pw: '' } : { id: '', pw: '' };

    const defaults = getDefaultCreds(loginType);
    const [emailOrPhone, setEmailOrPhone] = useState(defaults.id);
    const [password, setPassword] = useState(defaults.pw);

    const switchType = (type) => {
        setLoginType(type);
        const d = getDefaultCreds(type);
        setEmailOrPhone(d.id);
        setPassword(d.pw);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.post('/auth/login', { emailOrPhone, password });
            const { token, user } = res.data.data;

            if (loginType === 'admin' && user.role === 'user') {
                return toast.error('This account does not have admin privileges.');
            }

            localStorage.setItem('userInfo', JSON.stringify({ token, user }));
            toast.success('Login successful!');
            navigate('/games');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 flex-col">
            <div className="glass-panel w-full max-w-sm p-8 rounded-2xl border border-zinc-800/80 mb-6">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex flex-col items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                        <span className="text-xl font-black text-white">VC</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Welcome Back</h1>
                    <p className="text-zinc-400 text-sm">Sign in to manage your games.</p>
                </div>

                {/* Login type selector */}
                <div className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    {LOGIN_TYPES.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => switchType(id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${loginType === id ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {loginType === 'admin' && (
                    <div className="mb-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                        <ShieldCheck size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-300">
                            Admin &amp; Super Admin both use this login. Your role determines access level.
                        </p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Email / Phone</label>
                        <input
                            type="text"
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
                            placeholder="name@company.com or phone number"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2.5 rounded-lg transition-colors flex justify-center items-center mt-6 shadow-sm shadow-blue-500/20"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : `Sign In as ${loginType === 'admin' ? 'Admin' : 'User'}`}
                    </button>
                </form>
            </div>

            <p className="text-sm text-zinc-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
                    Sign Up
                </Link>
            </p>
        </div>
    );
}
