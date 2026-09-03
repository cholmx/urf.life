
import React from 'react';
import type { Page } from '../App';
import { SERMONS } from '../data/mockData';
import SermonCard from '../components/SermonCard';
import FadeInOnScroll from '../components/FadeInOnScroll';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  const latestSermon = SERMONS[0];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
       <section className="relative h-[80vh] min-h-[500px] bg-cover bg-center text-white flex flex-col justify-center items-center text-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507925921958-b49247b3617b?q=80&w=2070&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-header font-extrabold text-5xl md:text-7xl tracking-tight leading-tight">Know God, Share Life, Serve Others</h1>
            <p className="font-accent text-2xl md:text-3xl mt-4 max-w-2xl mx-auto">A place to find hope, community and purpose.</p>
            <button 
                onClick={() => setCurrentPage('New Here?')}
                className="mt-8 bg-brand-primary text-white font-header font-extrabold uppercase tracking-widest py-3 px-8 rounded-full transition-all transform hover:scale-105 duration-300 shadow-lg">
                Plan a Visit
            </button>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-20 bg-brand-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12 text-center">
                <FadeInOnScroll>
                    <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                        <h3 className="font-header font-extrabold text-3xl tracking-tight mt-4">Know God</h3>
                        <p className="mt-2 text-gray-600">Encounter God's presence through worship, prayer, and biblical teaching that transforms you from the inside out.</p>
                    </div>
                </FadeInOnScroll>
                <FadeInOnScroll style={{ transitionDelay: '150ms' }}>
                    <div className="flex flex-col items-center">
                         <svg className="h-12 w-12 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                        <h3 className="font-header font-extrabold text-3xl tracking-tight mt-4">Find Freedom</h3>
                        <p className="mt-2 text-gray-600">Experience healing and wholeness by accessing the abundant life Jesus made possible through healthy relationships and supernatural living.</p>
                    </div>
                </FadeInOnScroll>
                <FadeInOnScroll style={{ transitionDelay: '300ms' }}>
                    <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.548L16.5 21.75l-.398-1.201a3.375 3.375 0 00-2.456-2.456L12.75 18l1.201-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.201a3.375 3.375 0 002.456 2.456L20.25 18l-1.201.398a3.375 3.375 0 00-2.456 2.456z" /></svg>
                        <h3 className="font-header font-extrabold text-3xl tracking-tight mt-4">Discover Purpose</h3>
                        <p className="mt-2 text-gray-600">Uncover your unique greatness and make a difference by serving with God in your unique and personal way.</p>
                    </div>
                </FadeInOnScroll>
            </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 bg-brand-light-gray">
        <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-header font-extrabold text-4xl md:text-5xl tracking-tight">Welcome to the Upper Room Fellowship</h2>
            <p className="max-w-3xl mx-auto mt-6 text-lg text-gray-600 font-body leading-relaxed">
                For over 50 years, our congregation has been gathering in Columbiana to worship, grow, and serve together. We love this city and are proud to call it home—you'll see images of Columbiana throughout our site.
            </p>
            <p className="max-w-3xl mx-auto mt-4 text-lg text-gray-600 font-body leading-relaxed">
                Together, we're learning to live with more love, joy, and purpose. We support each other and reach out to make our community better. Whether you're just exploring faith or looking for a church family, we'd love to meet you and welcome you into ours.
            </p>
        </FadeInOnScroll>
      </section>
      
       {/* Latest Sermon Section */}
       <section className="py-20 bg-brand-bg">
        <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-header font-extrabold text-4xl md:text-5xl tracking-tight">Latest Message</h2>
            <div className="mt-12 max-w-4xl mx-auto">
                <SermonCard sermon={latestSermon} isFeatured={true} onSelect={() => setCurrentPage('Messages')} />
            </div>
             <div className="text-center mt-8">
                <button 
                    onClick={() => setCurrentPage('Messages')}
                    className="bg-brand-text text-white font-header font-extrabold uppercase tracking-widest py-3 px-8 rounded-full transition-transform transform hover:scale-105 duration-300 shadow-lg"
                >
                    View All Messages
                </button>
            </div>
        </FadeInOnScroll>
      </section>

      {/* Quick Links */}
       <section className="py-20 bg-brand-light-gray">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <FadeInOnScroll>
                <h2 className="text-center font-header font-extrabold text-4xl md:text-5xl tracking-tight">
                    Get Connected
                </h2>
             </FadeInOnScroll>
            <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <FadeInOnScroll>
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <h3 className="font-header font-extrabold text-2xl">Plan Your Visit</h3>
                        <p className="mt-2 text-gray-600 h-24">Find service times, directions, and helpful information for your first Sunday with us.</p>
                        <button onClick={() => setCurrentPage('New Here?')} className="mt-4 text-brand-primary font-header font-bold uppercase tracking-widest">Learn More</button>
                    </div>
                </FadeInOnScroll>
                 <FadeInOnScroll style={{ transitionDelay: '150ms' }}>
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <h3 className="font-header font-extrabold text-2xl">Watch Latest Message</h3>
                        <p className="mt-2 text-gray-600 h-24">Catch up on recent teachings that will help you grow in faith and apply biblical truths to your daily life.</p>
                        <button onClick={() => setCurrentPage('Messages')} className="mt-4 text-brand-primary font-header font-bold uppercase tracking-widest">Watch Now</button>
                    </div>
                </FadeInOnScroll>
                 <FadeInOnScroll style={{ transitionDelay: '300ms' }}>
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <h3 className="font-header font-extrabold text-2xl">Give Online</h3>
                        <p className="mt-2 text-gray-600 h-24">Partner with us in transforming lives and communities through your generous support.</p>
                        <button onClick={() => setCurrentPage('Give')} className="mt-4 text-brand-primary font-header font-bold uppercase tracking-widest">Give Now</button>
                    </div>
                </FadeInOnScroll>
            </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;