
import React, { useState } from 'react';
import YouTubeImportModal from './YouTubeImportModal';

export interface SermonFormData {
    title: string;
    speaker: string;
    series: string;
    date: string;
    imageUrl: string;
    description: string;
    transcript: string;
    youtubeVideoId?: string;
}

interface AddSermonFormProps {
    onSubmit: (formData: SermonFormData) => Promise<void>;
    onCancel: () => void;
}

const AddSermonForm: React.FC<AddSermonFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<SermonFormData>({
        title: '',
        speaker: '',
        series: '',
        date: new Date().toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1517866345380-189BC54e5246?q=80&w=2070&auto=format&fit=crop',
        description: '',
        transcript: '',
        youtubeVideoId: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImport = (videoData: { title: string; description: string; thumbnail: string; videoId: string; publishedAt: string }) => {
        setFormData(prev => ({
            ...prev,
            title: videoData.title,
            description: videoData.description,
            imageUrl: videoData.thumbnail,
            youtubeVideoId: videoData.videoId,
            date: new Date(videoData.publishedAt).toISOString().split('T')[0],
        }));
        setIsImportModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.transcript.trim()) {
            setError('A transcript is required to generate AI insights.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            setError('Failed to add sermon. Please check the console for details and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isImportModalOpen && <YouTubeImportModal onImport={handleImport} onClose={() => setIsImportModalOpen(false)} />}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-xl">
                    <div className="flex justify-between items-center mb-8 border-b pb-4">
                        <h2 className="font-header font-extrabold text-3xl tracking-tight">Add New Sermon</h2>
                        <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-header font-bold text-sm py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.407-.501-9.407-.501s-7.537 0-9.407.501A3.007 3.007 0 00.502 6.205C0 8.075 0 12 0 12s0 3.925.502 5.795a3.007 3.007 0 002.088 2.088c1.87.501 9.407.501 9.407.501s7.537 0 9.407-.501a3.007 3.007 0 002.088-2.088C24 15.925 24 12 24 12s0-3.925-.505-5.795zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
                            Import from YouTube
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-bold text-gray-700">Title</label>
                                <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                            </div>
                            <div>
                                <label htmlFor="speaker" className="block text-sm font-bold text-gray-700">Speaker</label>
                                <input type="text" name="speaker" id="speaker" value={formData.speaker} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="series" className="block text-sm font-bold text-gray-700">Series</label>
                                <input type="text" name="series" id="series" value={formData.series} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-bold text-gray-700">Date</label>
                                <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-bold text-gray-700">Image URL</label>
                            <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-gray-700">Description</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"></textarea>
                        </div>
                        <div>
                            <label htmlFor="transcript" className="block text-sm font-bold text-gray-700">Transcript</label>
                            <textarea name="transcript" id="transcript" value={formData.transcript} onChange={handleChange} required rows={10} placeholder="Paste the full sermon transcript here..." className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"></textarea>
                        </div>
                        
                        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <button type="button" onClick={onCancel} disabled={isLoading} className="py-2 px-6 border border-gray-300 rounded-full shadow-sm text-sm font-header font-extrabold uppercase tracking-widest text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                            <button type="submit" disabled={isLoading} className="py-2 px-6 border border-transparent rounded-full shadow-sm text-sm font-header font-extrabold uppercase tracking-widest text-white bg-brand-primary hover:bg-opacity-90 disabled:bg-gray-400">
                                {isLoading ? 'Generating & Saving...' : 'Add Sermon'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddSermonForm;
