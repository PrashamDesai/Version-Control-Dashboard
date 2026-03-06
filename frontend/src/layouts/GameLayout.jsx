import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import api from '../services/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GameLayout() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchGameContext = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/games/slug/${slug}`);
                setGame(res.data.data);
            } catch (error) {
                toast.error('Failed to load game context');
                navigate('/games'); // redirect back if game not found
            } finally {
                setLoading(false);
            }
        };

        fetchGameContext();
    }, [slug, navigate]);

    if (loading) {
        return (
            <div className="flex h-screen bg-[#09090b] text-zinc-100 items-center justify-center">
                <Loader2 className="animate-spin text-violet-500" size={40} />
            </div>
        );
    }

    if (!game) return null;

    return (
        <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans relative">
            <Sidebar game={game} mobileOpen={isMobileMenuOpen} setMobileOpen={setIsMobileMenuOpen} />
            <div className="flex flex-col flex-1 min-w-0">
                <TopNav showGameSwitcher={true} game={game} onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                <main className="flex-1 overflow-y-auto py-6 md:py-8 px-4 md:px-6 lg:px-10 xl:px-16">
                    <div key={location.pathname} className="tab-panel max-w-7xl mx-auto space-y-6 md:space-y-8">
                        <Outlet context={{ game }} />
                    </div>
                </main>
            </div>
        </div>
    );
}

