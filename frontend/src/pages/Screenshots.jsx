import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import ScreenshotGallery from '../components/ScreenshotGallery';

export default function Screenshots() {
    const { game } = useOutletContext();
    const [loading, setLoading] = useState(false);

    // Local mutable state for instantaneous updates
    const [androidScreenshots, setAndroidScreenshots] = useState(game?.androidScreenshots || []);
    const [iosScreenshots, setIosScreenshots] = useState(game?.iosScreenshots || []);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.user?.role === 'admin' || userInfo?.user?.role === 'super_admin';

    useEffect(() => {
        if (game) {
            setAndroidScreenshots(game.androidScreenshots || []);
            setIosScreenshots(game.iosScreenshots || []);
        }
    }, [game]);

    if (!game) return null;

    const isAndroid = game.platformsSupported?.includes('Android');
    const isIos = game.platformsSupported?.includes('iOS');

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">Game Screenshots</h1>
                <p className="text-sm text-zinc-400">Manage and showcase your in-game visuals for Android and iOS store listings.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {isAndroid && (
                    <div className="space-y-4">
                        <ScreenshotGallery
                            gameId={game._id}
                            screenshots={androidScreenshots}
                            isAdmin={isAdmin}
                            onUpdate={setAndroidScreenshots}
                            platform="android"
                        />
                    </div>
                )}

                {isIos && (
                    <div className="space-y-4">
                        <ScreenshotGallery
                            gameId={game._id}
                            screenshots={iosScreenshots}
                            isAdmin={isAdmin}
                            onUpdate={setIosScreenshots}
                            platform="ios"
                        />
                    </div>
                )}

                {!isAndroid && !isIos && (
                    <div className="glass-panel p-12 rounded-2xl border border-zinc-800/50 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon size={32} className="text-zinc-600" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">No Platforms Configured</h2>
                        <p className="text-zinc-400 max-w-md">
                            Please enable Android or iOS support in the game settings to start managing screenshots for those platforms.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
