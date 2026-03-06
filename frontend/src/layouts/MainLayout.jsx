import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from '../components/TopNav';
import MainSidebar from '../components/MainSidebar';

export default function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans relative">
            <MainSidebar mobileOpen={isMobileMenuOpen} setMobileOpen={setIsMobileMenuOpen} />
            <div className="flex flex-col flex-1 min-w-0">
                <TopNav showGameSwitcher={false} onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                <main className="flex-1 overflow-y-auto py-6 md:py-8 px-4 md:px-6 lg:px-10 xl:px-16">
                    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

