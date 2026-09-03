
import React from 'react';
import type { Page } from '../App';
import FadeInOnScroll from '../components/FadeInOnScroll';

const NextStepCard: React.FC<{ title: string, description: string, buttonText: string, onClick: () => void }> = ({ title, description, buttonText, onClick }) => (
    <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col">
        <h3 className="font-header font-extrabold text-2xl">{title}</h3>
        <p className="mt-2 text-gray-600 flex-grow">{description}</p>
        <button onClick={onClick} className="mt-6 bg-brand-primary text-white font-header font-extrabold uppercase tracking-widest py-2 px-6 rounded-full self-center transition-transform transform hover:scale-105 duration-300">
            {buttonText}
        </button>
    </div>
);

const NewHerePage: React.FC = () => {

  return (
    <div className="animate-fade-in">
       {/* Page Header */}
      <section className="relative py-20 bg-cover bg-center text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop')"}}>
         <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-header font-extrabold text-5xl md:text-6xl tracking-tight">Welcome!</h1>
          <p className="font-accent italic text-2xl mt-2">We're so glad you found us.</p>
        </div>
      </section>
      
      <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <FadeInOnScroll className="max-w-4xl mx-auto">
                 <h2 className="text-center font-header font-extrabold text-4xl tracking-tight">What to Expect on Sundays</h2>
                 <p className="text-center mt-4 text-lg text-gray-700 leading-relaxed">
                    Visiting a new church can be intimidating. We've put together this guide to help you know what to expect. We can't wait to meet you!
                 </p>
                 <div className="mt-12 space-y-10">
                    <div>
                        <h3 className="font-header font-extrabold text-2xl text-brand-primary">Family Worship Together</h3>
                        <p className="mt-2 text-gray-600">Our gatherings begin with everyone worshiping together. You'll hear contemporary music with lyrics on screens. Feel free to participate however you're comfortable.</p>
                    </div>
                     <div>
                        <h3 className="font-header font-extrabold text-2xl text-brand-primary">Coffee & Connection Break</h3>
                        <p className="mt-2 text-gray-600">After worship, we take a short break to grab coffee and greet each other. It's a perfect opportunity to meet someone new. We never single out visitors!</p>
                    </div>
                     <div>
                        <h3 className="font-header font-extrabold text-2xl text-brand-primary">Message Time & Kids' Programs</h3>
                        <p className="mt-2 text-gray-600">Adults and youth remain for a practical, Bible-based message. Children (birth-5th grade) are dismissed to age-appropriate programs. A nursery is also available.</p>
                    </div>
                    <div>
                        <h3 className="font-header font-extrabold text-2xl text-brand-primary">Casual Atmosphere & Accessibility</h3>
                        <p className="mt-2 text-gray-600">Don't worry about what to wear—come as you are! Our building is fully wheelchair accessible, and we offer the Listen Everywhere app for hearing assistance.</p>
                    </div>
                 </div>
              </FadeInOnScroll>
          </div>
      </section>

      <section className="py-20 bg-brand-light-gray">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <FadeInOnScroll>
                    <h2 className="text-center font-header font-extrabold text-4xl tracking-tight">Your First Visit</h2>
                </FadeInOnScroll>
               <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <FadeInOnScroll>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-header font-extrabold text-xl">When You Arrive</h3>
                            <p className="mt-2 text-gray-600">Our friendly greeters will be at the doors to say hello and help you find your way around. If you have children, they'll direct you to our secure check-in area.</p>
                        </div>
                    </FadeInOnScroll>
                    <FadeInOnScroll style={{ transitionDelay: '150ms' }}>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-header font-extrabold text-xl">For Your Kids</h3>
                            <p className="mt-2 text-gray-600">We value your children's safety. All volunteers are background-checked. Our check-in system ensures only authorized adults can pick up your child.</p>
                        </div>
                    </FadeInOnScroll>
                    <FadeInOnScroll style={{ transitionDelay: '300ms' }}>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-header font-extrabold text-xl">After the Service</h3>
                            <p className="mt-2 text-gray-600">The service usually ends around 11:45am. Our team is available to talk or pray. First-time guests can receive a special gift at our Connection Center!</p>
                        </div>
                    </FadeInOnScroll>
               </div>
          </div>
      </section>

      <section className="py-20 text-center">
        <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-header font-extrabold text-4xl tracking-tight">Ready to check us out?</h2>
          <p className="mt-4 text-lg text-gray-600">We meet every Sunday at 10:30am<br />500 Sponseller Road, Columbiana, OH 44408</p>
        </FadeInOnScroll>
      </section>

      {/* Map Section */}
      <section className="pb-20">
        <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="rounded-lg shadow-xl overflow-hidden">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3014.288219416174!2d-80.6826018235338!3d40.9094040263666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8833e213b1e32bfd%3A0xe543324c1a7c7891!2s500%20Sponseller%20Rd%2C%20Columbiana%2C%20OH%2044408!5e0!3m2!1sen!2sus!4v1722026850239!5m2!1sen!2sus"
                        className="w-full h-96"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Map of Upper Room Fellowship location">
                    </iframe>
                </div>
                <div className="mt-8 text-center">
                    <a
                        href="https://www.google.com/maps/dir/?api=1&destination=500+Sponseller+Road,+Columbiana,+OH+44408"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-brand-primary text-white font-header font-extrabold uppercase tracking-widest py-3 px-8 rounded-full transition-all transform hover:scale-105 duration-300 shadow-lg"
                    >
                        Get Directions
                    </a>
                </div>
            </div>
        </FadeInOnScroll>
      </section>

    </div>
  );
};

export default NewHerePage;