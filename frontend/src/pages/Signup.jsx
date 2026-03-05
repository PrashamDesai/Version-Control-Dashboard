import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Phone, Mail, User, Shield } from 'lucide-react';
import api from '../services/api';

const SIGNUP_TYPES = [
    { id: 'user', label: 'User', icon: User },
    { id: 'admin', label: 'Admin', icon: Shield },
];

export default function Signup() {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState('user');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!formData.email) return toast.error('Email is required');
        if (!formData.phone) return toast.error('Phone number is required');
        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: accountType,
            });
            const { token, ...user } = res.data.data;
            localStorage.setItem('userInfo', JSON.stringify({ token, user }));
            toast.success('Registration successful!');
            navigate('/games');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 py-12">
            <div className="glass-panel w-full max-w-sm p-8 rounded-2xl border border-zinc-800/80">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex flex-col items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                        <span className="text-xl font-black text-white">VC</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create an Account</h1>
                    <p className="text-zinc-400 text-sm">Join to start managing your game versions.</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    {/* Account type selector */}
                    <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800 mb-2">
                        {SIGNUP_TYPES.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setAccountType(id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${accountType === id ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                                    }`}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <User size={14} className="text-zinc-500" /> Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
                            placeholder="e.g. John Doe"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Mail size={14} className="text-zinc-500" /> Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
                            placeholder="name@company.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Phone size={14} className="text-zinc-500" /> Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
                            placeholder="+91 98765 43210"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-zinc-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
