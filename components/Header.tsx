
import React, { useState } from 'react';
import type { Page } from '../App';

interface NavLinkProps {
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: React.ReactNode;
  className?: string;
}

const SimpleNavLink: React.FC<NavLinkProps> = ({ page, currentPage, setCurrentPage, children, className }) => (
  <button
    onClick={() => setCurrentPage(page)}
    className={`font-header font-extrabold tracking-normal uppercase transition-colors duration-300 ${
      currentPage === page ? 'text-brand-primary' : 'text-brand-text hover:text-brand-primary'
    } ${className}`}
  >
    {children}
  </button>
);

const navLinks: ({ name: string; page: Page; children?: undefined; } | { name: string; children: { name: string; page: Page; }[]; page?: undefined; })[] = [
    { name: 'Home', page: 'Home' },
    {
        name: 'About',
        children: [
            { name: 'About Us', page: 'About Us' },
            { name: 'Core Values', page: 'Core Values' },
        ],
    },
    {
        name: 'Connect',
        children: [
            { name: 'New Here?', page: 'New Here?' },
            { name: 'Ministries', page: 'Ministries' },
            { name: 'Prayer', page: 'Prayer' },
            { name: 'Contact', page: 'Contact' },
        ],
    },
    { name: 'Messages', page: 'Messages' },
    { name: 'Give', page: 'Give' },
];


const Header: React.FC<{ currentPage: Page; setCurrentPage: (page: Page) => void; isAdmin: boolean; }> = ({ currentPage, setCurrentPage, isAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);

  return (
    <header className="bg-brand-bg/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <button onClick={() => setCurrentPage('Home')} className="flex items-center space-x-3">
              <img src="/logonegtransblack.png" alt="Grace Hill Church" className="h-10 w-10" />
              <span className="font-header font-extrabold text-2xl tracking-tight">UPPER ROOM</span>
            </button>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navLinks.map((item) => (
                item.children ? (
                  <div key={item.name} className="relative group">
                    <button className="px-4 py-2 font-header font-extrabold tracking-normal uppercase text-brand-text hover:text-brand-primary flex items-center gap-1">
                      <span>{item.name}</span>
                       <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        {item.children.map((child) => (
                          <button key={child.name} onClick={() => setCurrentPage(child.page)} className={`block w-full text-left px-4 py-2 text-sm ${currentPage === child.page ? 'text-brand-primary' : 'text-brand-text'} hover:bg-gray-100`} role="menuitem">
                            {child.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <SimpleNavLink key={item.name} page={item.page!} currentPage={currentPage} setCurrentPage={setCurrentPage} className="px-4 py-2">{item.name}</SimpleNavLink>
                )
              ))}
               {isAdmin && (
                 <div className="relative group">
                    <button className="px-4 py-2 font-header font-extrabold tracking-normal uppercase text-red-600 hover:text-red-800 flex items-center gap-1">
                      <span>Admin</span>
                       <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                          <button onClick={() => setCurrentPage('Calendar')} className={`block w-full text-left px-4 py-2 text-sm ${currentPage === 'Calendar' ? 'text-brand-primary' : 'text-brand-text'} hover:bg-gray-100`} role="menuitem">
                            Events Calendar
                          </button>
                           <button onClick={() => setCurrentPage('AdminSettings')} className={`block w-full text-left px-4 py-2 text-sm ${currentPage === 'AdminSettings' ? 'text-brand-primary' : 'text-brand-text'} hover:bg-gray-100`} role="menuitem">
                            Settings
                          </button>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-brand-text hover:text-brand-primary focus:outline-none">
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((item) => (
              item.children ? (
                <div key={item.name}>
                  <button onClick={() => setOpenMobileMenu(openMobileMenu === item.name ? null : item.name)} className="w-full text-left px-4 py-3 text-lg font-header font-extrabold tracking-normal uppercase text-brand-text flex justify-between items-center">
                    <span>{item.name}</span>
                    <svg className={`w-5 h-5 transform transition-transform duration-300 ${openMobileMenu === item.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openMobileMenu === item.name ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="pl-4 border-l-2 border-brand-secondary">
                      {item.children.map((child) => (
                        <SimpleNavLink key={child.name} page={child.page} currentPage={currentPage} setCurrentPage={(page) => { setCurrentPage(page); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-lg">{child.name}</SimpleNavLink>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <SimpleNavLink key={item.name} page={item.page!} currentPage={currentPage} setCurrentPage={(page) => { setCurrentPage(page); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-lg">{item.name}</SimpleNavLink>
              )
            ))}
             {isAdmin && (
                <div>
                   <SimpleNavLink page='Calendar' currentPage={currentPage} setCurrentPage={(page) => { setCurrentPage(page); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-lg text-red-600">Events Calendar</SimpleNavLink>
                   <SimpleNavLink page='AdminSettings' currentPage={currentPage} setCurrentPage={(page) => { setCurrentPage(page); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-lg text-red-600">Settings</SimpleNavLink>
                </div>
              )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
