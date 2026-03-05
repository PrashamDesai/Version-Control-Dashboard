import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Shield, Zap, Globe, LogOut, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Using the generated image paths
const HERO_BG = '/hero_bg.png';
const ARTIFIACT = '/artifact.png';

export default function Landing() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        setIsLoggedIn(!!userInfo);
    }, []);

    const handleMainAction = () => {
        if (isLoggedIn) {
            navigate('/games');
        } else {
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setIsLoggedIn(false);
        toast.success('Logged out successfully');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 overflow-x-hidden font-inter">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <span className="text-sm font-black italic">EG</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight">EchoGames</span>
                </div>
                <div className="flex items-center gap-6">
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
                        >
                            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" /> Logout
                        </button>
                    ) : (
                        <button onClick={() => navigate('/login')} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            Sign In
                        </button>
                    )}
                    <button
                        onClick={handleMainAction}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25"
                    >
                        {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

                <div className="text-center space-y-6 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-violet-400 animate-pulse">
                        <Zap size={12} /> The Future of Game Management
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                        Control Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Game Echoes</span>
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        The unified control center for game versioning, release management, and live-ops. Built for developers who value speed and precision.
                    </p>
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={handleMainAction}
                            className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-2xl text-lg font-bold transition-all hover:scale-105 shadow-xl shadow-violet-500/20 flex items-center justify-center gap-2 group"
                        >
                            {isLoggedIn ? 'Open Dashboard' : 'Start Managing Free'}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-lg font-bold transition-all">
                            View Demo
                        </button>
                    </div>
                </div>

                {/* Interactive Game Component */}
                <div className="mt-20 w-full max-w-5xl relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-sm px-10 group">
                    {!gameStarted ? (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 transition-opacity duration-500">
                            <img src={ARTIFIACT} alt="Game Core" className="w-32 h-32 mb-6 animate-bounce" />
                            <h2 className="text-2xl font-bold mb-2 text-white">Echo Catcher</h2>
                            <p className="text-zinc-400 mb-6 font-medium">Click the violet orbs to collect score!</p>
                            <button
                                onClick={() => setGameStarted(true)}
                                className="px-6 py-3 bg-white text-black rounded-xl font-black hover:scale-110 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-white/10"
                            >
                                <Play size={18} fill="black" /> PLAY MINI-GAME
                            </button>
                        </div>
                    ) : (
                        <div className="relative w-full h-full overflow-hidden py-10">
                            <div className="absolute top-6 left-6 text-xl font-black text-violet-400 flex items-center gap-2 z-20">
                                <Zap size={20} className="fill-violet-400" /> SCORE: {score}
                            </div>

                            <button
                                onClick={() => { setGameStarted(false); setScore(0); }}
                                className="absolute top-6 right-6 px-4 py-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/50 rounded-xl text-xs font-black text-red-500 hover:text-red-400 transition-all flex items-center gap-2 z-20 active:scale-95 group/exit"
                            >
                                <XCircle size={16} /> EXIT GAME
                            </button>

                            <GameArea onScore={() => setScore(s => s + 10)} />
                        </div>
                    )}
                    <img
                        src={HERO_BG}
                        alt="Hero"
                        className="absolute inset-0 w-full h-full object-cover opacity-20 -z-10 group-hover:scale-105 transition-transform duration-1000"
                    />
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Shield, title: 'Secure Deployments', desc: 'Enterprise-grade versioning with atomic rollbacks.' },
                        { icon: Zap, title: 'Lightning Fast', desc: 'Proprietary sync engine for global distribution.' },
                        { icon: Globe, title: 'Multi-Region Support', desc: 'Deploy to specific environments with one click.' }
                    ].map((f, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <f.icon className="text-violet-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 opacity-50">
                        <div className="w-6 h-6 bg-zinc-600 rounded flex items-center justify-center">
                            <span className="text-[10px] font-black italic">EG</span>
                        </div>
                        <span className="text-sm font-bold tracking-tight">EchoGames &copy; 2026</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function GameArea({ onScore }) {
    const [orbs, setOrbs] = useState([]);
    const areaRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (orbs.length < 5) {
                const id = Math.random();
                const newOrb = {
                    id,
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 80 + 10,
                    size: Math.random() * 20 + 30
                };
                setOrbs(prev => [...prev, newOrb]);

                setTimeout(() => {
                    setOrbs(prev => prev.filter(o => o.id !== id));
                }, 2000);
            }
        }, 800);
        return () => clearInterval(interval);
    }, [orbs]);

    return (
        <div ref={areaRef} className="w-full h-full relative cursor-crosshair">
            {orbs.map(orb => (
                <button
                    key={orb.id}
                    onClick={(e) => {
                        e.stopPropagation();
                        onScore();
                        setOrbs(prev => prev.filter(o => o.id !== orb.id));
                    }}
                    style={{
                        left: `${orb.x}%`,
                        top: `${orb.y}%`,
                        width: `${orb.size}px`,
                        height: `${orb.size}px`
                    }}
                    className="absolute bg-violet-500 rounded-full shadow-lg shadow-violet-500/50 animate-pulse border-2 border-white/20 active:scale-150 hover:brightness-125 hover:shadow-violet-400/80 transition-all"
                />
            ))}
        </div>
    );
}
