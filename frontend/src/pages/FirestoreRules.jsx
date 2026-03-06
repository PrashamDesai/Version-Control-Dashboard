import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

export default function FirestoreRules() {
    const { game } = useOutletContext();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.user?.role === 'admin' || userInfo?.user?.role === 'super_admin';

    const [data, setData] = useState({
        productionRules: '',
        developmentRules: ''
    });

    useEffect(() => {
        const fetchRules = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/games/${game._id}/firestore-rules`);
                if (res.data.data) {
                    setData({
                        productionRules: res.data.data.productionRules || '',
                        developmentRules: res.data.data.developmentRules || ''
                    });
                }
            } catch (error) {
                toast.error('Failed to load firestore rules');
            } finally {
                setLoading(false);
            }
        };
        if (game) fetchRules();
    }, [game]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await api.put(`/games/${game._id}/firestore-rules`, data);
            setData({
                productionRules: res.data.data.productionRules || '',
                developmentRules: res.data.data.developmentRules || ''
            });
            toast.success('Firestore Rules saved successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save rules');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Keep tabs pressed down style functionality for desktop tab selection simulation
    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white mb-1 flex items-center gap-2">
                        <Database className="text-violet-500" size={24} />
                        Firestore Rules
                    </h1>
                    <p className="text-zinc-400 text-sm">Manage security rules for Production and Development databases.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm shadow-violet-500/20"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Rules'}
                    </button>
                )}
            </div>

            <div className="glass-panel flex-1 rounded-xl border border-zinc-800/50 p-6 md:p-8 flex flex-col overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

                    {/* Production Rules */}
                    <div className="flex flex-col space-y-4 h-full">
                        <div className="bg-yellow-500/20 border border-yellow-500/50 p-3 rounded-t-lg -mb-4 z-10">
                            <h3 className="text-yellow-500 font-bold tracking-wide">Secure Rules (Prod, Dev, QA)</h3>
                        </div>
                        <textarea
                            name="productionRules"
                            value={data.productionRules}
                            onChange={handleChange}
                            readOnly={!isAdmin}
                            spellCheck="false"
                            className="flex-1 w-full bg-[#1e1e1e] border-2 border-zinc-800 rounded-b-lg p-4 text-sm text-zinc-300 focus:border-yellow-500/50 outline-none transition-all resize-none font-mono"
                            placeholder="// Write your production rules here..."
                        />
                    </div>

                    {/* Development Rules */}
                    <div className="flex flex-col space-y-4 h-full">
                        <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-t-lg -mb-4 z-10">
                            <h3 className="text-green-500 font-bold tracking-wide">Testing Rule for Editor</h3>
                        </div>
                        <textarea
                            name="developmentRules"
                            value={data.developmentRules}
                            onChange={handleChange}
                            readOnly={!isAdmin}
                            spellCheck="false"
                            className="flex-1 w-full bg-[#1e1e1e] border-2 border-zinc-800 rounded-b-lg p-4 text-sm text-zinc-300 focus:border-green-500/50 outline-none transition-all resize-none font-mono"
                            placeholder="// Write your development/editor rules here..."
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}

