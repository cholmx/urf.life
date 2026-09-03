
import React, { useState } from 'react';
import type { Sermon } from '../types';
import { generateSermonInsights, AiSermonInsights } from '../ai';

const SermonDetailModal: React.FC<{ sermon: Sermon; onClose: () => void; onUpdateSermon: (sermon: Sermon) => void; }> = ({ sermon, onClose, onUpdateSermon }) => {
    const hasInitialAiContent = sermon.summary && sermon.discussionQuestions && sermon.themes && sermon.scriptures;
    
    const [aiContent, setAiContent] = useState<AiSermonInsights | null>(
        hasInitialAiContent ? {
            summary: sermon.summary!,
            discussionQuestions: sermon.discussionQuestions!,
            themes: sermon.themes!,
            scriptures: sermon.scriptures!
        } : null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateInsights = async () => {
        if (!sermon.transcript) {
            setError("Sorry, a transcript for this sermon is not available to generate insights.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const insights = await generateSermonInsights(sermon.transcript);
            setAiContent(insights);
            const updatedSermon = { ...sermon, ...insights };
            onUpdateSermon(updatedSermon);

        } catch (err) {
            console.error("Error generating sermon insights:", err);
            setError("We couldn't generate insights for this sermon at the moment. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyQuestions = () => {
        if (aiContent?.discussionQuestions) {
            const questionsText = aiContent.discussionQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');
            navigator.clipboard.writeText(questionsText);
            // Optionally, add a visual confirmation
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-brand-bg rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="font-header uppercase tracking-widest text-sm text-brand-primary font-extrabold">{sermon.series}</p>
                            <h2 className="font-header font-extrabold text-4xl tracking-tight mt-1">{sermon.title}</h2>
                            <p className="font-accent italic text-2xl text-gray-600 mt-1">{sermon.speaker}</p>
                             <p className="text-sm text-gray-400 mt-1">{new Date(sermon.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="mt-6 aspect-video bg-black rounded-md overflow-hidden">
                        {sermon.youtubeVideoId ? (
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${sermon.youtubeVideoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                             <div className="w-full h-full flex items-center justify-center">
                                <p className="text-white font-header">Video Player Coming Soon</p>
                             </div>
                        )}
                    </div>
                     <p className="mt-6 text-gray-700 leading-relaxed">{sermon.description}</p>
                     
                     <div className="mt-8 pt-8 border-t-2 border-brand-secondary">
                        <h3 className="font-header font-extrabold text-3xl tracking-tight text-center">AI Sermon Assistant ✨</h3>
                        
                        {!aiContent && !isLoading && (
                             <div className="text-center mt-6">
                                <p className="max-w-xl mx-auto text-gray-600">Go deeper with this message. Generate a concise summary, discussion questions for your small group, key themes, and more.</p>
                                <button
                                    onClick={handleGenerateInsights}
                                    disabled={!sermon.transcript}
                                    className="mt-6 bg-brand-primary text-white font-header font-extrabold uppercase tracking-widest py-3 px-8 rounded-full transition-all transform hover:scale-105 duration-300 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Generate Study Tools
                                </button>
                                {!sermon.transcript && <p className="text-sm text-red-500 mt-2">A transcript is not available for this sermon.</p>}
                            </div>
                        )}

                        {isLoading && (
                            <div className="text-center mt-8">
                                <svg className="animate-spin h-10 w-10 text-brand-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-4 font-header font-bold text-lg text-brand-text">Analyzing sermon... this may take a moment.</p>
                            </div>
                        )}

                        {error && <p className="text-center text-red-600 mt-6 bg-red-100 p-4 rounded-md">{error}</p>}

                        {aiContent && (
                            <div className="mt-8 grid md:grid-cols-2 gap-8 animate-fade-in">
                                <div>
                                    <h4 className="font-header font-extrabold text-xl tracking-normal">Summary</h4>
                                    <p className="mt-2 text-gray-600 leading-relaxed bg-white p-4 rounded-md shadow-sm">{aiContent.summary}</p>

                                     <h4 className="font-header font-extrabold text-xl tracking-normal mt-6">Key Themes & Topics</h4>
                                     <div className="mt-2 flex flex-wrap gap-2">
                                        {aiContent.themes.map(theme => (
                                            <span key={theme} className="bg-brand-secondary text-brand-text text-sm font-semibold px-3 py-1 rounded-full">{theme}</span>
                                        ))}
                                     </div>

                                      <h4 className="font-header font-extrabold text-xl tracking-normal mt-6">Scripture References</h4>
                                     <div className="mt-2 flex flex-wrap gap-2">
                                        {aiContent.scriptures.map(scripture => (
                                            <span key={scripture} className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">{scripture}</span>
                                        ))}
                                     </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-header font-extrabold text-xl tracking-normal">Discussion Questions</h4>
                                        <button onClick={handleCopyQuestions} className="text-sm font-semibold text-brand-primary hover:underline">Copy</button>
                                    </div>
                                    <ul className="mt-2 space-y-3 text-gray-700 bg-white p-4 rounded-md shadow-sm">
                                        {aiContent.discussionQuestions.map((q, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="font-bold text-brand-primary mr-2">{i + 1}.</span>
                                                <span>{q}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default SermonDetailModal;
