
import React from 'react';
import type { Page } from '../App';

interface FooterProps {
    setCurrentPage: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  return (
    <footer className="bg-brand-text text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div>
            <h3 className="font-header font-extrabold uppercase tracking-wider">Upper Room Fellowship</h3>
            <p className="mt-4 text-gray-400 font-body text-sm">Transforming lives that transform communities.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <h3 className="font-header font-extrabold uppercase tracking-wider">About</h3>
              <ul className="mt-4 space-y-2 font-body">
                <li><button onClick={() => setCurrentPage('About Us')} className="hover:text-brand-primary transition-colors">About Us</button></li>
                <li><button onClick={() => setCurrentPage('Core Values')} className="hover:text-brand-primary transition-colors">Core Values</button></li>
                <li><button onClick={() => setCurrentPage('Messages')} className="hover:text-brand-primary transition-colors">Messages</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-header font-extrabold uppercase tracking-wider">Connect</h3>
              <ul className="mt-4 space-y-2 font-body">
                <li><button onClick={() => setCurrentPage('New Here?')} className="hover:text-brand-primary transition-colors">New Here?</button></li>
                <li><button onClick={() => setCurrentPage('Ministries')} className="hover:text-brand-primary transition-colors">Ministries</button></li>
                <li><button onClick={() => setCurrentPage('Prayer')} className="hover:text-brand-primary transition-colors">Prayer</button></li>
                <li><button onClick={() => setCurrentPage('Contact')} className="hover:text-brand-primary transition-colors">Contact</button></li>
                <li><button onClick={() => setCurrentPage('Give')} className="hover:text-brand-primary transition-colors">Give</button></li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="font-header font-extrabold uppercase tracking-wider">Service Times</h3>
            <div className="mt-4 text-gray-300 font-body">
                <p>Sundays at 10:30 AM</p>
                <p className="mt-2">500 Sponseller Road, Columbiana OH 44408</p>
            </div>
          </div>

        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 text-center">
          <p className="text-base text-gray-400 font-body">&copy; {new Date().getFullYear()} Upper Room Fellowship. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;