
import React, { useState, useEffect } from 'react';

const AdminSettingsPage: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [channelId, setChannelId] = useState('');
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        // Load saved settings from local storage on component mount
        const savedApiKey = localStorage.getItem('youtubeApiKey');
        const savedChannelId = localStorage.getItem('youtubeChannelId');
        if (savedApiKey) setApiKey(savedApiKey);
        if (savedChannelId) setChannelId(savedChannelId);
    }, []);

    const handleSave = () => {
        localStorage.setItem('youtubeApiKey', apiKey);
        localStorage.setItem('youtubeChannelId', channelId);
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000); // Clear message after 3 seconds
    };

    return (
        <div className="animate-fade-in">
            <section className="bg-brand-secondary py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-header font-extrabold text-5xl md:text-6xl tracking-tight">Admin Settings</h1>
                    <p className="font-accent italic text-2xl mt-2 text-gray-600">Configure integrations and site settings.</p>
                </div>
            </section>

            <section className="py-20 bg-brand-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
                        <h2 className="font-header font-extrabold text-3xl tracking-tight">YouTube Integration</h2>
                        <p className="mt-2 text-gray-600">
                            Enter your YouTube Data API v3 key and your YouTube channel ID to enable importing sermons directly from your channel. Your credentials will be saved securely in your browser's local storage.
                        </p>
                        
                        <div className="mt-8 space-y-6">
                            <div>
                                <label htmlFor="apiKey" className="block text-sm font-bold text-gray-700">YouTube API Key</label>
                                <input
                                    type="password"
                                    name="apiKey"
                                    id="apiKey"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                    placeholder="Enter your API Key"
                                />
                            </div>
                            <div>
                                <label htmlFor="channelId" className="block text-sm font-bold text-gray-700">YouTube Channel ID</label>
                                <input
                                    type="text"
                                    name="channelId"
                                    id="channelId"
                                    value={channelId}
                                    onChange={(e) => setChannelId(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                    placeholder="e.g., UCDVYQldq2IFl2Q9o_a_4Tmg"
                                />
                            </div>
                            <div className="text-sm text-gray-500">
                                Need help finding these? Check out the <a href="https://developers.google.com/youtube/v3/getting-started" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline">YouTube API documentation</a> to get an API key and find your <a href="https://commentpicker.com/youtube-channel-id.php" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline">Channel ID</a>.
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end items-center gap-4">
                            {saveMessage && <p className="text-green-600 text-sm font-semibold">{saveMessage}</p>}
                            <button
                                onClick={handleSave}
                                className="py-2 px-6 border border-transparent rounded-full shadow-sm text-sm font-header font-extrabold uppercase tracking-widest text-white bg-brand-primary hover:bg-opacity-90"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminSettingsPage;
