
import React, { useState } from 'react';
import FadeInOnScroll from '../components/FadeInOnScroll';

const GivePage: React.FC = () => {
    const [testimonyData, setTestimonyData] = useState({ name: '', email: '', message: '' });
    const [isTestimonySubmitted, setIsTestimonySubmitted] = useState(false);

    const handleTestimonyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTestimonyData({ ...testimonyData, [e.target.name]: e.target.value });
    };

    const handleTestimonySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsTestimonySubmitted(true);
    };

  return (
    <div className="animate-fade-in">
      <section className="relative py-20 bg-cover bg-center text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop')"}}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-header font-extrabold text-5xl md:text-6xl tracking-tight">Give Generously</h1>
          <p className="font-accent italic text-2xl mt-2">"God loves a cheerful giver." - 2 Corinthians 9:7</p>
        </div>
      </section>

      <section className="py-20 bg-brand-bg">
        <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="font-header font-extrabold text-4xl tracking-tight">An Act of Worship</h2>
                 <div className="mt-6 text-lg text-gray-700 leading-relaxed space-y-4">
                    <p>Your generosity fuels our mission to transform lives and communities. Through your faithful giving, you're partnering with us to create spaces where people can treasure God's presence, build healthy relationships, and find purpose through serving others.</p>
                    <p>At Upper Room Fellowship, we believe in living the Gospel through overwhelming generosity. Just as Jesus gave everything for us, opening the way for our complete salvation, healing, and deliverance, we're called to give freely and joyfully to further His kingdom on earth. When we give, we reflect God's character and participate in His work of restoration.</p>
                 </div>
            </div>
        </FadeInOnScroll>
      </section>

      <section className="py-20 bg-brand-light-gray">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <FadeInOnScroll>
                <h2 className="text-center font-header font-extrabold text-4xl tracking-tight mb-12">Why We Give</h2>
                <p className="max-w-3xl mx-auto text-center text-lg text-gray-700 leading-relaxed mb-12">The Bible teaches that generous giving is an act of worship that reflects our trust in God's provision and our commitment to His mission. In 2 Corinthians 9:6-7, we're encouraged to give cheerfully, not reluctantly or under compulsion, because God loves a cheerful giver. Giving is not about obligation but opportunity—the opportunity to:</p>
             </FadeInOnScroll>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                 {whyGiveItems.map((item, index) => (
                    <FadeInOnScroll key={item.number} style={{ transitionDelay: `${index * 100}ms` }}>
                        <div className="flex items-start space-x-6">
                            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-brand-primary text-white font-header font-extrabold text-3xl">
                                {item.number}
                            </div>
                            <div>
                                <h3 className="font-header font-extrabold text-xl">{item.title}</h3>
                                <p className="mt-1 text-gray-600">{item.description}</p>
                            </div>
                        </div>
                    </FadeInOnScroll>
                 ))}
             </div>
        </div>
      </section>
      
      <section className="py-20 bg-brand-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll>
                <h2 className="text-center font-header font-extrabold text-4xl tracking-tight">Ways to Give</h2>
            </FadeInOnScroll>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <FadeInOnScroll>
                    <GiveCard title="Online Giving" description="Make a secure one-time gift or set up recurring donations through our online giving platform.">
                        <a href="#" className="mt-6 inline-block bg-brand-primary text-white font-header font-extrabold uppercase tracking-widest py-3 px-8 rounded-full transition-all transform hover:scale-105 duration-300 shadow-lg">Give Online</a>
                    </GiveCard>
                </FadeInOnScroll>
                 <FadeInOnScroll style={{ transitionDelay: '150ms' }}>
                    <GiveCard title="Text to Give" description="Text ​'urf $50' (or any amount) ​to 73256 to give instantly from your phone." />
                 </FadeInOnScroll>
                 <FadeInOnScroll style={{ transitionDelay: '300ms' }}>
                    <GiveCard title="In-Person Giving" description="Place your gift in the offering boxes located at the Connection Center during Sunday services, or drop by the church office." />
                 </FadeInOnScroll>
            </div>
            <FadeInOnScroll className="mt-8 text-center text-gray-600">
                <h3 className="font-header font-bold">Other Ways</h3>
                <p className="mt-2">You can also mail checks to 500 Sponseller Rd, Columbiana, OH 44408, or contact our finance team about legacy giving and stock donations.</p>
            </FadeInOnScroll>
        </div>
      </section>
      
      <section className="py-20 bg-brand-secondary">
        <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-center font-header font-extrabold text-4xl tracking-tight">Financial Accountability</h2>
                <p className="text-center mt-4 text-lg text-gray-700 leading-relaxed mb-8">
                    We're committed to stewarding your gifts with integrity and transparency. Upper Room Fellowship follows strict financial protocols. Your contributions primarily support our local church ministries, facilities, staff, and outreach efforts, with a portion designated to missions.
                </p>
            </div>
        </FadeInOnScroll>
      </section>
      
       <section className="py-20 bg-brand-bg">
            <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-center font-header font-extrabold text-4xl tracking-tight">Share Your Story</h2>
                    <p className="text-center mt-4 text-lg text-gray-700 leading-relaxed mb-12">
                        Your story of generosity can inspire others. Consider sharing how giving has impacted your life by submitting a testimony.
                    </p>
                    <div className="bg-white p-8 rounded-lg shadow-xl">
                      {isTestimonySubmitted ? (
                          <div className="text-center bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-md" role="alert">
                              <p className="font-bold">Thank You!</p>
                              <p>Your testimony has been submitted. We appreciate you sharing your story!</p>
                          </div>
                      ) : (
                        <form onSubmit={handleTestimonySubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-700">Your Name</label>
                                <input type="text" name="name" id="name" value={testimonyData.name} required onChange={handleTestimonyChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700">Email Address</label>
                                <input type="email" name="email" id="email" value={testimonyData.email} required onChange={handleTestimonyChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                            </div>
                             <div>
                                <label htmlFor="message" className="block text-sm font-bold text-gray-700">Your message</label>
                                <textarea name="message" id="message" value={testimonyData.message} required onChange={handleTestimonyChange} rows={5} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"></textarea>
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-header font-extrabold uppercase tracking-widest text-white bg-brand-text hover:bg-opacity-90">
                                    Drop us a testimony
                                </button>
                            </div>
                        </form>
                      )}
                    </div>
                </div>
            </FadeInOnScroll>
      </section>

    </div>
  );
};

const whyGiveItems = [
    { number: "01", title: "Worship God", description: "By honoring Him with our finances" },
    { number: "02", title: "Grow Spiritually", description: "As we trust God with our resources" },
    { number: "03", title: "Invest in Ministry", description: "That transforms lives locally and globally" },
    { number: "04", title: "Express Gratitude", description: "For God's generosity toward us" },
    { number: "05", title: "Partner with God", description: "In building His kingdom on earth" },
];

const GiveCard: React.FC<{ title: string; description: string; children?: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center h-full">
        <h3 className="font-header font-extrabold text-2xl">{title}</h3>
        <p className="mt-2 text-gray-600 flex-grow">{description}</p>
        {children}
    </div>
);

export default GivePage;