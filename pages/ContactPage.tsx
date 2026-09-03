
import React, { useState } from 'react';
import FadeInOnScroll from '../components/FadeInOnScroll';

const ContactPage: React.FC = () => {
    // State for Connect Card
    const [connectData, setConnectData] = useState({
        firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', spouseName: '', hasChildren: '', childrenInfo: '', visitDate: ''
    });
    const [isConnectCardSubmitted, setIsConnectCardSubmitted] = useState(false);

    const handleConnectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setConnectData({ ...connectData, [e.target.name]: e.target.value });
    };
    
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConnectData({ ...connectData, hasChildren: e.target.value });
    };

    const handleConnectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle connect card submission logic (e.g., send to an API)
        setIsConnectCardSubmitted(true);
    };

  return (
    <>
      <div className="animate-fade-in">
        <section className="relative py-20 bg-cover bg-center text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742044-538253a6c175?q=80&w=1935&auto=format&fit=crop')"}}>
           <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-header font-extrabold text-5xl md:text-6xl tracking-tight">Connect With Us</h1>
            <p className="font-accent italic text-2xl mt-2">We'd Love to Hear From You</p>
          </div>
        </section>

        <section className="py-20 bg-brand-light-gray">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <FadeInOnScroll className="max-w-3xl mx-auto">
                   <p className="text-center text-lg text-gray-700 leading-relaxed mb-12">
                      Whether you're planning your first visit or you've just been with us, we want to connect with you! Fill out the form here so we can welcome you properly, answer any questions, and help you find your place in our church family.
                   </p>

                  <div className="bg-white p-8 rounded-lg shadow-xl">
                      <h2 className="font-header font-extrabold text-3xl tracking-tight text-center">Connect Card</h2>
                      
                      {isConnectCardSubmitted ? (
                          <div className="mt-8 bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-md" role="alert">
                              <p className="font-bold">Thank You!</p>
                              <p>Your information has been submitted. We look forward to connecting with you soon!</p>
                          </div>
                      ) : (
                      <form onSubmit={handleConnectSubmit} className="mt-8 space-y-6">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div>
                                  <label htmlFor="firstName" className="block text-sm font-bold text-gray-700">First Name</label>
                                  <input type="text" name="firstName" id="firstName" value={connectData.firstName} required onChange={handleConnectChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                              </div>
                              <div>
                                  <label htmlFor="lastName" className="block text-sm font-bold text-gray-700">Last Name</label>
                                  <input type="text" name="lastName" id="lastName" value={connectData.lastName} required onChange={handleConnectChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                              </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div>
                                  <label htmlFor="email" className="block text-sm font-bold text-gray-700">Email</label>
                                  <input type="email" name="email" id="email" value={connectData.email} required onChange={handleConnectChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                              </div>
                              <div>
                                  <label htmlFor="phone" className="block text-sm font-bold text-gray-700">Telephone</label>
                                  <input type="tel" name="phone" id="phone" value={connectData.phone} onChange={handleConnectChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                              </div>
                          </div>
                          {/* ... other connect card fields ... */}
                          <div>
                              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-header font-extrabold uppercase tracking-widest text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                                  Submit Card
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

export default ContactPage;