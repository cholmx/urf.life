
import React from 'react';

const CalendarPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <section className="bg-brand-secondary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-header font-extrabold text-5xl md:text-6xl tracking-tight">Events Calendar</h1>
          <p className="font-accent italic text-2xl mt-2 text-gray-600">Admin Area: Manage Church Events</p>
        </div>
      </section>

      <section className="py-20 bg-brand-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-white p-8 rounded-lg shadow-md">
            <h2 className="font-header font-extrabold text-3xl tracking-tight">Under Construction</h2>
            <p className="mt-4 text-lg text-gray-700 leading-relaxed">
              This is the admin-only section for managing the church's event calendar. Functionality to add, edit, and remove events will be implemented here.
            </p>
            <div className="mt-8">
                <button className="bg-brand-primary text-white font-header font-extrabold uppercase tracking-widest py-3 px-8 rounded-full transition-all transform hover:scale-105 duration-300 shadow-lg">
                    Add New Event (Coming Soon)
                </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CalendarPage;
