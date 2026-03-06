import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TopNav({ showGameSwitcher = false, game = null, onMenuToggle }) {
    const [isGameSwitcherOpen, setIsGameSwitcherOpen] = useState(false);
    const [games, setGames] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const gameSwitcherRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/games').then(res => setGames(res.data.data)).catch(console.error);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (gameSwitcherRef.current && !gameSwitcherRef.current.contains(event.target)) {
                setIsGameSwitcherOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchTargets = showGameSwitcher && game ? [
        { name: 'Dashboard Overview', path: `/games/${game.slug}/overview` },
        { name: 'Releases & Tasks', path: `/games/${game.slug}/releases` },
        { name: 'Store Listing', path: `/games/${game.slug}/store` },
        { name: 'Env & Configs', path: `/games/${game.slug}/environments` },
        { name: 'Ads Config', path: `/games/${game.slug}/ads` },
        { name: 'Build Checklist', path: `/games/${game.slug}/checklist` },
        { name: 'Firestore Rules', path: `/games/${game.slug}/firestore-rules` },
        { name: 'Important Links', path: `/games/${game.slug}/links` },
        { name: 'Closed Test Reports', path: `/games/${game.slug}/closed-test` },
    ] : games.map(g => ({ name: `Game: ${g.name}`, path: `/games/${g.slug}` }));

    const filteredSearch = searchQuery.trim()
        ? searchTargets.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    return (
        <header className="h-16 border-b border-zinc-800/50 flex bg-[#09090b]/80 backdrop-blur-md px-4 md:px-6 lg:px-10 xl:px-16 z-30 sticky top-0">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuToggle}
                    className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <Menu size={20} />
                </button>

                {/* Search Bar - Aligned with content left edge */}
                <div className="flex-1 flex justify-start">
                    <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-zinc-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-1.5 border border-zinc-800/80 rounded-md leading-5 bg-zinc-900/40 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:border-zinc-700 mb-0 sm:text-sm transition-colors text-left"
                            placeholder={showGameSwitcher ? "Search releases, envs..." : "Search entire portfolio..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                        />

                        {isSearchFocused && searchQuery.trim() !== '' && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-2 z-50 max-h-64 overflow-y-auto">
                                {filteredSearch.length > 0 ? (
                                    filteredSearch.map((result, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSearchQuery('');
                                                setIsSearchFocused(false);
                                                navigate(result.path);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                        >
                                            {result.name}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-sm text-zinc-500 text-center">No results found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section - Game Switcher */}
                <div className="flex-shrink-0 flex justify-end">
                    {showGameSwitcher && game && (
                        <div className="relative" ref={gameSwitcherRef}>
                            <div
                                onClick={() => setIsGameSwitcherOpen(!isGameSwitcherOpen)}
                                className="flex items-center gap-2 cursor-pointer group bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/80 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <div className="w-5 h-5 rounded overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
                                    {game.iconUrl ? (
                                        <img src={`${import.meta.env.VITE_IMAGE_BASE_URL}${game.iconUrl}`} alt="Icon" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-zinc-500 text-xs font-bold">{game.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors truncate max-w-[120px]">
                                    {game.name}
                                </div>
                                <ChevronDown size={14} className="text-zinc-500 ml-1 group-hover:text-zinc-300" />
                            </div>

                            {isGameSwitcherOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-2 z-50">
                                    <div className="px-3 pb-2 mb-2 border-b border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
                                        Switch Game
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {games.map(g => (
                                            <button
                                                key={g._id}
                                                onClick={() => {
                                                    setIsGameSwitcherOpen(false);
                                                    navigate(`/games/${g.slug}`);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 transition-colors ${g._id === game._id ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
                                            >
                                                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {g.iconUrl ? (
                                                        <img src={`${import.meta.env.VITE_IMAGE_BASE_URL}${g.iconUrl}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-zinc-500">{g.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <span className="truncate">{g.name}</span>
                                            </button>
                                        ))}
                                        {games.length === 0 && (
                                            <div className="px-3 py-2 text-sm text-zinc-500 text-center">No other games found</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

