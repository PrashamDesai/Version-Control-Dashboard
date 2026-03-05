import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Clock, PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const defaultReport = {
    recruitmentMethod: 'We asked our friends and family to test our application.',
    testerDifficulty: 'Neither difficult or easy',
    engagementSummary: 'Yes, testers has used the app for quite some time and used the app feature. We have received good feedback from the team.',
    feedbackSummary: 'We have received positive feedback with some suggestions of the new feature and enhancements in the existing functionalities - which we will be working on in the future.\nWe have collected feedback using Google form and with one to one meetings with our testers.',
    intendedAudience: 'Children above age of 8+ is our target audience',
    gameStandOut: 'Think Sudoku blends a clean UI with smart hints, logical difficulty progression, and a bold black-red theme—making it a sleek, strategy-first puzzle game for all skill levels, playable offline anytime.',
    installExpectation: '0 - 10K',
    productionImprovements: 'Improved the hint system, polished the UI, fine-tuned difficulty levels, and optimized performance based on internal feedback during closed testing.',
    productionReadiness: 'Thorough in-house testing ensured stable gameplay, accurate logic, and great user experience. Positive internal feedback confirmed it\'s ready for release.'
};

export default function ClosedTestReports() {
    const { game } = useOutletContext();
    const [formData, setFormData] = useState({ ...defaultReport });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/games/${game._id}/closed-test`);
                const reports = res.data.data;

                if (reports && reports.length > 0) {
                    const latest = reports[0];
                    setFormData({
                        _id: latest._id,
                        recruitmentMethod: latest.recruitmentMethod || defaultReport.recruitmentMethod,
                        testerDifficulty: latest.testerDifficulty || defaultReport.testerDifficulty,
                        engagementSummary: latest.engagementSummary || defaultReport.engagementSummary,
                        feedbackSummary: latest.feedbackSummary || defaultReport.feedbackSummary,
                        intendedAudience: latest.intendedAudience || defaultReport.intendedAudience,
                        gameStandOut: latest.gameStandOut || defaultReport.gameStandOut,
                        installExpectation: latest.installExpectation || defaultReport.installExpectation,
                        productionImprovements: latest.productionImprovements || defaultReport.productionImprovements,
                        productionReadiness: latest.productionReadiness || defaultReport.productionReadiness
                    });
                    setLastSaved(new Date(latest.updatedAt));
                }
            } catch (error) {
                toast.error('Failed to load QA report');
            } finally {
                setLoading(false);
            }
        };
        if (game) fetchReport();
    }, [game]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.productionImprovements.length > 300) {
            return toast.error("Production Improvements must be under 300 characters");
        }
        if (formData.productionReadiness.length > 300) {
            return toast.error("Production Readiness must be under 300 characters");
        }

        try {
            setSaving(true);
            const payload = { ...formData };
            const res = await api.post(`/games/${game._id}/closed-test`, payload);
            setFormData(res.data.data);
            setLastSaved(new Date(res.data.data.createdAt || res.data.data.updatedAt));
            toast.success('QA Report submitted!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit QA Report');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-shrink-0">
                <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Closed Test QA Answers</h1>
                <p className="text-zinc-400 text-sm">Pre-filled answers required by Google Play Console.</p>
            </div>

            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-5 flex gap-4 flex-shrink-0">
                <PlayCircle className="text-violet-500 shrink-0 mt-1" size={24} />
                <div className="space-y-2">
                    <h3 className="font-semibold text-blue-100/90 text-sm">Automated QA Pre-fill</h3>
                    <p className="text-sm text-blue-200/70 leading-relaxed">
                        These fields are pre-filled based on standard production-ready game testing metrics. You can edit any field before submitting if your specific case deviates from the established template.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-xl border border-zinc-800/50 space-y-10 flex-1 overflow-y-auto">

                {/* Section 1: About your closed test */}
                <div className="space-y-6">
                    <h2 className="text-lg font-medium text-white border-b border-zinc-800 pb-2">About your closed test</h2>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-200">How did you recruit users for your closed test?</label>
                        <p className="text-xs text-zinc-500 mb-2">For example, did you ask friends and family, or use a paid testing provider?</p>
                        <textarea
                            name="recruitmentMethod"
                            value={formData.recruitmentMethod}
                            onChange={handleChange}
                            rows={2} required
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-sm text-zinc-100 focus:border-violet-500 outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-200">How easy was it to recruit testers for your game?</label>
                        <div className="flex items-center gap-6 mt-2">
                            {['Very difficult', 'Difficult', 'Neither difficult or easy', 'Easy', 'Very easy'].map(option => (
                                <label key={option} className="flex items-center gap-2 text-sm text-zinc-300">
                                    <input
                                        type="radio" name="testerDifficulty" value={option}
                                        checked={formData.testerDifficulty === option}
                                        onChange={handleChange}
                                        className="text-violet-500 bg-zinc-900 border-zinc-700"
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-200">Describe the engagement you received from testers during your closed test</label>
                        <textarea
                            name="engagementSummary"
                            value={formData.engagementSummary}
                            onChange={handleChange}
                            rows={3} required
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-sm text-zinc-100 focus:border-violet-500 outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-200">Provide a summary of the feedback that you received from testers.</label>
                        <p className="text-xs text-zinc-500 mb-2">Include how you collected the feedback.</p>
                        <textarea
                            name="feedbackSummary"
                            value={formData.feedbackSummary}
                            onChange={handleChange}
                            rows={4} required
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-sm text-zinc-100 focus:border-violet-500 outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Section 2: About your game */}
                <div className="space-y-6">
                    <h2 className="text-lg font-medium text-white border-b border-zinc-800 pb-2">About your game</h2>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-200">Who is the intended audience of your game?</label>
                        <textarea
                            name="intendedAudience"
                            value={formData.intendedAudience}
                            onChange={handleChange}
                            rows={2} required
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-sm text-zinc-100 focus:border-violet-500 outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-200">Describe what makes your game stand out</label>
                        <textarea
                            name="gameStandOut"
                            value={formData.gameStandOut}
                            onChange={handleChange}
                            rows={3} required
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-sm text-zinc-100 focus:border-violet-500 outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-200">How many installs do you expect your game to have in your first year?</label>
                        <div className="flex items-center gap-6 mt-2">
                            {['0 - 10K', '10K - 100K', '100K - 1M', '1M - 10M', '10M+'].map(option => (
                                <label key={option} className="flex items-center gap-2 text-sm text-zinc-300">
                                    <input
                                        type="radio" name="installExpectation" value={option}
                                        checked={formData.installExpectation === option}
                                        onChange={handleChange}
                                        className="text-violet-500 bg-zinc-900 border-zinc-700"
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 3: Your production readiness */}
                <div className="space-y-6">
                    <h2 className="text-lg font-medium text-white border-b border-zinc-800 pb-2">Your production readiness</h2>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-200">What changes did you make to your game based on what you learned during your closed test?</label>
                        <textarea
                            name="productionImprovements"
                            value={formData.productionImprovements}
                            onChange={handleChange}
                            rows={3} required maxLength={300}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-sm text-zinc-100 focus:border-violet-500 outline-none resize-none"
                        />
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-red-400 font-medium">Need details under 300 characters</span>
                            <span className={formData.productionImprovements.length > 300 ? 'text-red-500' : 'text-zinc-500'}>
                                {formData.productionImprovements.length}/300
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-200">How did you decide that your game is ready for production?</label>
                        <textarea
                            name="productionReadiness"
                            value={formData.productionReadiness}
                            onChange={handleChange}
                            rows={3} required maxLength={300}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-sm text-zinc-100 focus:border-violet-500 outline-none resize-none"
                        />
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-red-400 font-medium">Need details under 300 characters</span>
                            <span className={formData.productionReadiness.length > 300 ? 'text-red-500' : 'text-zinc-500'}>
                                {formData.productionReadiness.length}/300
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <Clock size={16} /> {lastSaved ? `Last saved ${lastSaved.toLocaleString()}` : 'Never saved'}
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm shadow-violet-500/20"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

