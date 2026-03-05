import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Store as StoreIcon, Smartphone, MonitorPlay, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import api from '../services/api';

const defaultListing = {
    title: '',
    shortDescription: '',
    longDescription: '',
    address: '',
    postalCode: '',

    // iOS
    subtitle: '',
    primaryLanguage: '',
    primaryCategory: '',
    preOrders: '',
    countriesAvailable: '',
    priceSchedule: '',
    promotionalText: '',
    keywords: '',
    versionRelease: '',
    tradeRepresentativeContactInfo: '',
    doesAppRequireSignIn: '',
    appleContentDescription: '',
    additionalInfo: '',

    // Android
    projectApplicationName: '',
    keyAlias: '',
    password: '',
    validityYears: '',
    organizationalUnit: '',
    cityLocality: '',
    stateProvince: '',
    countryCode: '',
    defaultLanguage: '',
    designProvidedByIndiaNIC: '',
    applicationType: '',
    gameCategory: ''
};

export default function StoreListing() {
    const { game } = useOutletContext();
    const [platform, setPlatform] = useState('Android');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [data, setData] = useState({
        Android: { ...defaultListing },
        iOS: { ...defaultListing }
    });

    useEffect(() => {
        const fetchStore = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/games/${game._id}/store`);
                const listings = res.data.data;

                setData(prev => {
                    const next = { ...prev };
                    if (Array.isArray(listings)) {
                        listings.forEach(list => {
                            if (next[list.platform]) {
                                next[list.platform] = list;
                            }
                        });
                    }
                    return next;
                });
            } catch (error) {
                toast.error('Failed to load store listing');
            } finally {
                setLoading(false);
            }
        };
        if (game) fetchStore();
    }, [game]);

    const currentData = data[platform];

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                platform,
                ...currentData
            };

            const res = await api.put(`/games/${game._id}/store`, payload);

            setData(prev => ({
                ...prev,
                [platform]: res.data.data
            }));

            toast.success(`Store Listing for ${platform} saved!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save store listing');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({
            ...prev,
            [platform]: {
                ...prev[platform],
                [name]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    const iosFields = [
        { name: 'subtitle', label: 'Subtitle' },
        { name: 'primaryLanguage', label: 'Primary Language' },
        { name: 'primaryCategory', label: 'Primary Category' },
        { name: 'preOrders', label: 'Pre-Orders' },
        { name: 'countriesAvailable', label: 'Countries where your app is available' },
        { name: 'priceSchedule', label: 'Price Schedule' },
        { name: 'promotionalText', label: 'Promotional Text' },
        { name: 'keywords', label: 'Keywords', isTextarea: true },
        { name: 'versionRelease', label: 'Version Release' },
        { name: 'tradeRepresentativeContactInfo', label: 'Trade Representative Contact Information' },
        { name: 'doesAppRequireSignIn', label: 'Does your app require Sign-In?' },
        { name: 'appleContentDescription', label: 'Apple Content Description' },
        { name: 'additionalInfo', label: 'Additional Info' }
    ];

    const androidFields = [
        { name: 'projectApplicationName', label: 'Project / Application Name' },
        { name: 'keyAlias', label: 'Key Alias' },
        { name: 'password', label: 'Password' },
        { name: 'validityYears', label: 'Validity (years)' },
        { name: 'organizationalUnit', label: 'Organizational Unit' },
        { name: 'cityLocality', label: 'City or Locality' },
        { name: 'stateProvince', label: 'State or Province' },
        { name: 'countryCode', label: 'Country Code (XX)' },
        { name: 'defaultLanguage', label: 'Default Language' },
        { name: 'designProvidedByIndiaNIC', label: 'Design provided by IndiaNIC?' },
        { name: 'applicationType', label: 'Application type' },
        { name: 'gameCategory', label: 'Game Category' }
    ];

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Deploy Details</h1>
                    <p className="text-zinc-400 text-sm">Manage app store metadata and descriptive content.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm shadow-blue-500/20"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="flex gap-4 border-b border-zinc-800/80 mb-6 shrink-0">
                {game.platformsSupported.includes('Android') && (
                    <button
                        onClick={() => setPlatform('Android')}
                        className={cn(
                            "px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all",
                            platform === 'Android'
                                ? "border-green-500 text-green-400 bg-green-500/5 rounded-t-lg"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Smartphone size={16} /> Google Play
                    </button>
                )}
                {game.platformsSupported.includes('iOS') && (
                    <button
                        onClick={() => setPlatform('iOS')}
                        className={cn(
                            "px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all",
                            platform === 'iOS'
                                ? "border-blue-500 text-blue-400 bg-blue-500/5 rounded-t-lg"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <MonitorPlay size={16} /> App Store
                    </button>
                )}
            </div>

            <div key={platform} className="tab-panel glass-panel rounded-xl flex-1 overflow-y-auto p-6 md:p-8 space-y-8 border border-zinc-800/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    <div className="flex flex-col space-y-6 h-full">
                        <h3 className="text-lg font-medium text-zinc-200 border-b border-zinc-800 pb-2 flex-shrink-0">Common Information</h3>

                        <div className="flex flex-col flex-1 gap-4">
                            <div className="space-y-2 flex-shrink-0">
                                <label className="text-sm font-medium text-zinc-300">Title</label>
                                <input
                                    name="title"
                                    value={currentData.title || ''}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600 focus:bg-zinc-800/50"
                                />
                            </div>

                            <div className="space-y-2 flex-shrink-0">
                                <label className="text-sm font-medium text-zinc-300">Short Description (1 liner)</label>
                                <textarea
                                    name="shortDescription"
                                    value={currentData.shortDescription || ''}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-zinc-600 focus:bg-zinc-800/50"
                                />
                            </div>

                            <div className="flex flex-col flex-1 space-y-2 pb-2">
                                <label className="text-sm font-medium text-zinc-300">Long Description</label>
                                <textarea
                                    name="longDescription"
                                    value={currentData.longDescription || ''}
                                    onChange={handleChange}
                                    className="w-full flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-3 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-zinc-600 focus:bg-zinc-800/50 font-mono min-h-[200px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 flex-shrink-0 mt-auto">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Address</label>
                                    <input
                                        name="address"
                                        value={currentData.address || ''}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600 focus:bg-zinc-800/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Postal Code</label>
                                    <input
                                        name="postalCode"
                                        value={currentData.postalCode || ''}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600 focus:bg-zinc-800/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-zinc-200 border-b border-zinc-800 pb-2">
                            {platform === 'iOS' ? 'App Store (iOS) Details' : 'Play Store (Android) Details'}
                        </h3>

                        <div className="space-y-4">
                            {(platform === 'iOS' ? iosFields : androidFields).map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">{field.label}</label>
                                    {field.isTextarea ? (
                                        <textarea
                                            name={field.name}
                                            value={currentData[field.name] || ''}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-zinc-600 focus:bg-zinc-800/50"
                                        />
                                    ) : (
                                        <input
                                            name={field.name}
                                            value={currentData[field.name] || ''}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600 focus:bg-zinc-800/50"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
