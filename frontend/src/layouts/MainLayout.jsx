import { Outlet } from 'react-router-dom';
import TopNav from '../components/TopNav';
import MainSidebar from '../components/MainSidebar';

export default function MainLayout() {
    return (
        <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
            <MainSidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <TopNav showGameSwitcher={false} />
                <main className="flex-1 overflow-y-auto py-10 px-6 md:px-16 pl-20 md:pl-28">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

