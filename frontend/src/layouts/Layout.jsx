import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

export default function Layout() {
    return (
        <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <TopNav />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
