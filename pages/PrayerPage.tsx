
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import FadeInOnScroll from '../components/FadeInOnScroll';

const EncouragementModal: React.FC<{ encouragement: string, onClose: () => void }> = ({ encouragement, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-8 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="font-header font-extrabold text-2xl text-brand-primary tracking-normal">An Encouragement For You</h3>
            <p className="mt-4 text-gray-600">Thank you for sharing your heart with us. Please know our prayer team will be lifting you up. We hope this encouragement and scripture brings you comfort.</p>
            <div className="mt-6 bg-brand-light-gray p-4 rounded-md text-gray-700 whitespace-pre-wrap font-body leading-relaxed">
                {encouragement}
            </div>
            <div className="mt-8 text-right">
                <button onClick={onClose} className="bg-brand-text text-white font-header font-extrabold uppercase tracking-widest py-2 px-6 rounded-full transition-transform transform hover:scale-105 duration-300">
                    Close
                </button>
            </div>
        </div>
    </div>
);


const PrayerPage: React.FC = () => {
    const [prayerData, setPrayerData] = useState({ name: '', request: '' });
    const [isPrayerSubmitted, setIsPrayerSubmitted] = useState(false);
    const [generateEncouragement, setGenerateEncouragement] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedEncouragement, setGeneratedEncouragement] = useState<string | null>(null);

    const handlePrayerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPrayerData({ ...prayerData, [e.target.name]: e.target.value });
    };

    const handlePrayerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPrayerSubmitted(true);
        if (prayerData.request && generateEncouragement) {
            setIsGenerating(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const prompt = `
                    You are a caring and compassionate assistant for the Upper Room Fellowship church. Your role is to provide a brief, encouraging, and biblically-grounded response to prayer requests.

                    Here are the church's core values:
                    - Pursuing Healthy Relationships: We thrive through authentic, kind, and honorable connections.
                    - Accessing Abundant Wholeness: We believe Jesus provides for complete salvation, healing, and deliverance.
                    - Knowing Our Greatness: We serve God in our unique way, knowing every person has value and destiny.
                    - Owning A Supernatural Lifestyle: We partner with the Holy Spirit for a life of faith, miracles, and freedom.
                    - Treasuring His Presence: We grow through daily interaction with God in worship, prayer, and His Word.
                    - Living the Gospel: We model and share Christ's life through servanthood and generosity.

                    A person named ${prayerData.name || 'Friend'} submitted a prayer request. Their request is: "${prayerData.request}". 
                    
                    Your task:
                    1. Read the user's prayer request carefully.
                    2. Select ONE of the church's core values that is most relevant to the request.
                    3. Find ONE encouraging and relevant Bible verse (include the full reference, e.g., Philippians 4:13).
                    4. Write a short (2-3 sentences) message of encouragement. This message should briefly mention the selected core value and explain how it relates to their situation, pointing them to God's character and the hope found in the scripture you chose.
                    5. Address the person by their first name if it is provided. If no name is provided, use a general greeting like "Friend,".
                    
                    IMPORTANT: DO NOT write a prayer. Your response must be an encouragement. It should be warm, hopeful, and sensitive. Combine the message and the verse into a single response.`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                });

                setGeneratedEncouragement(response.text);

            } catch (error) {
                console.error("Error generating encouragement:", error);
                setGeneratedEncouragement("We're sorry, but we couldn't generate an encouragement at this moment. Please know that our team has received your request and is praying for you.");
            } finally {
                setIsGenerating(false);
            }
        }
    };
    
    const closeEncouragementModal = () => {
        setGeneratedEncouragement(null);
        setPrayerData({ name: '', request: '' });
        setGenerateEncouragement(false);
        setIsPrayerSubmitted(false); // Reset for a new submission
    };

  return (
    <>
      {isGenerating && (
        <div className="fixed inset-0 bg-white/80 z-50 flex justify-center items-center">
            <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-brand-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="mt-4 font-header font-bold text-lg text-brand-text">Finding an encouragement for you...</p>
            </div>
        </div>
      )}
      {generatedEncouragement && !isGenerating && <EncouragementModal encouragement={generatedEncouragement} onClose={closeEncouragementModal} />}
      <div className="animate-fade-in">
        <section className="bg-brand-secondary py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-header font-extrabold text-5xl md:text-6xl tracking-tight">Prayer</h1>
            <p className="font-accent italic text-2xl mt-2 text-gray-600">"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." - Philippians 4:6</p>
          </div>
        </section>

        <section className="py-20 bg-brand-light-gray">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll className="max-w-3xl mx-auto">
                <p className="text-center text-lg text-gray-700 leading-relaxed mb-12">
                    Prayer is foundational to our relationship with God. At Upper Room Fellowship, we consider it a profound privilege to stand with you in prayer. Whether you're facing a challenge, celebrating a victory, or seeking guidance, we are here to support you. Every request is confidential and will be shared only with our dedicated prayer team.
                </p>

                <div className="bg-white p-8 rounded-lg shadow-xl">
                  <h2 className="font-header font-extrabold text-3xl tracking-tight text-center">Submit a Prayer Request</h2>
                  
                   {isPrayerSubmitted && !generatedEncouragement && !isGenerating ? (
                          <div className="mt-8 bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-md" role="alert">
                              <p className="font-bold">Thank You for Trusting Us</p>
                              <p>Your prayer request has been received. Our team will be praying for you this week.</p>
                          </div>
                      ) : (
                  <form onSubmit={handlePrayerSubmit} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700">Name <span className="font-normal text-gray-500">(optional)</span></label>
                            <input type="text" name="name" id="name" value={prayerData.name} onChange={handlePrayerChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                        <div>
                             <label htmlFor="request" className="block text-sm font-bold text-gray-700">Your Prayer Request</label>
                             <textarea id="request" name="request" rows={5} value={prayerData.request} onChange={handlePrayerChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"></textarea>
                        </div>
                        {prayerData.request && (
                          <div className="mt-4">
                              <label htmlFor="generateEncouragement" className="flex items-start text-sm text-gray-600">
                                  <input
                                      type="checkbox"
                                      id="generateEncouragement"
                                      checked={generateEncouragement}
                                      onChange={(e) => setGenerateEncouragement(e.target.checked)}
                                      className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary mt-0.5"
                                  />
                                  <span className="ml-3">Yes, I'd like to receive an immediate, scripture-based encouragement.</span>
                              </label>
                          </div>
                          )}
                        <div>
                          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-header font-extrabold uppercase tracking-widest text-white bg-brand-text hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-text">
                              Submit Prayer Request
                          </button>
                      </div>
                  </form>
                  )}
                </div>
            </FadeInOnScroll>
          </div>
        </section>
      </div>
    </>
  );
};

export default PrayerPage;