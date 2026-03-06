import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Mail, Phone, User, Lock, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function Auth() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    // Combined form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // Login logic
                const res = await api.post('/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                // Backend returns flat: { _id, name, email, phone, avatarUrl, role, token }
                const { token, ...user } = res.data.data;
                localStorage.setItem('userInfo', JSON.stringify({ token, user }));
                toast.success('Login successful!');
                navigate('/games');
            } else {
                // Signup logic
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                const res = await api.post('/auth/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                const { token, ...user } = res.data.data;
                localStorage.setItem('userInfo', JSON.stringify({ token, user }));
                toast.success('Registration successful!');
                navigate('/games');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-violet-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
                        <span className="text-xl font-black text-white">EG</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        {isLogin ? 'Sign in to manage your games' : 'Join to start managing your game versions'}
                    </p>
                </div>

                <div className="glass-panel p-8 rounded-2xl border border-zinc-800/80 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <User size={14} className="text-zinc-500" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600"
                                    placeholder="John Doe"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <Mail size={14} className="text-zinc-500" /> Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600"
                                placeholder="name@company.com"
                                required
                            />
                        </div>



                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <Lock size={14} className="text-zinc-500" /> Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-100 focus:border-violet-500 outline-none transition-all placeholder:text-zinc-600"
                                    placeholder="••••••••"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium p-2.5 rounded-lg transition-all flex justify-center items-center mt-6 shadow-md shadow-violet-500/20 active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={16} />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            {isLogin ? (
                                <>Don't have an account? <span className="text-violet-500 font-medium">Sign up</span></>
                            ) : (
                                <>Already have an account? <span className="text-violet-500 font-medium">Log in</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

