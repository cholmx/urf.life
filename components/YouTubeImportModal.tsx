
import React, { useState, useEffect } from 'react';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: { url: string };
    };
    publishedAt: string;
  };
}

interface YouTubeImportModalProps {
    onImport: (videoData: { title: string; description: string; thumbnail: string; videoId: string; publishedAt: string }) => void;
    onClose: () => void;
}

const YouTubeImportModal: React.FC<YouTubeImportModalProps> = ({ onImport, onClose }) => {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            const apiKey = localStorage.getItem('youtubeApiKey');
            const channelId = localStorage.getItem('youtubeChannelId');

            if (!apiKey || !channelId) {
                setError('YouTube API Key or Channel ID not set. Please configure them in the Admin Settings.');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=25&type=video`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error.message || 'Failed to fetch videos from YouTube.');
                }
                const data = await response.json();
                setVideos(data.items);
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const handleSelectVideo = (video: YouTubeVideo) => {
        onImport({
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high.url,
            videoId: video.id.videoId,
            publishedAt: video.snippet.publishedAt,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-brand-bg rounded-lg shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="font-header font-extrabold text-2xl">Import Sermon from YouTube</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {isLoading && (
                        <div className="text-center py-10">
                            <svg className="animate-spin h-8 w-8 text-brand-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="mt-3 font-semibold">Fetching latest videos...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center py-10 bg-red-50 p-6 rounded-md">
                            <h3 className="font-header font-bold text-red-700">Error</h3>
                            <p className="text-red-600 mt-2">{error}</p>
                            <p className="text-sm text-gray-500 mt-2">Please verify your credentials in the Admin Settings and ensure the YouTube Data API is enabled for your project.</p>
                        </div>
                    )}
                    {!isLoading && !error && (
                        <div className="space-y-4">
                            {videos.map(video => (
                                <div key={video.id.videoId} className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                                    <img src={video.snippet.thumbnails.high.url} alt={video.snippet.title} className="w-32 h-20 object-cover rounded-md" />
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-sm leading-tight">{video.snippet.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => handleSelectVideo(video)} className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-md hover:bg-opacity-90">
                                        Import
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YouTubeImportModal;
