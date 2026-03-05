import { Outlet } from 'react-router-dom';
import TopNav from '../components/TopNav';
import MainSidebar from '../components/MainSidebar';

export default function MainLayout() {
    return (
        <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
            <MainSidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <TopNav showGameSwitcher={false} />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

