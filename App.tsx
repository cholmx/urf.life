
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import NewHerePage from './pages/NewHerePage';
import AboutUsPage from './pages/AboutUsPage';
import CoreValuesPage from './pages/CoreValuesPage';
import MinistriesPage from './pages/MinistriesPage';
import MessagesPage from './pages/MessagesPage';
import ContactPage from './pages/ContactPage';
import PrayerPage from './pages/PrayerPage';
import GivePage from './pages/GivePage';
import CalendarPage from './pages/CalendarPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ScrollToTopButton from './components/ScrollToTopButton';

export type Page = 'Home' | 'New Here?' | 'About Us' | 'Core Values' | 'Ministries' | 'Messages' | 'Contact' | 'Prayer' | 'Give' | 'Calendar' | 'AdminSettings';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for admin query parameter on initial load
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('admin') === 'true') {
      setIsAdmin(true);
    }
  }, []);


  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'New Here?':
        return <NewHerePage />;
      case 'About Us':
        return <AboutUsPage />;
      case 'Core Values':
        return <CoreValuesPage />;
      case 'Ministries':
        return <MinistriesPage />;
      case 'Messages':
        return <MessagesPage isAdmin={isAdmin} />;
      case 'Contact':
        return <ContactPage />;
      case 'Prayer':
        return <PrayerPage />;
      case 'Give':
        return <GivePage />;
      case 'Calendar':
        return isAdmin ? <CalendarPage /> : <HomePage setCurrentPage={setCurrentPage} />;
      case 'AdminSettings':
        return isAdmin ? <AdminSettingsPage /> : <HomePage setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="bg-brand-bg text-brand-text font-body font-medium min-h-screen flex flex-col">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} isAdmin={isAdmin} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
      <ScrollToTopButton />
    </div>
  );
};

export default App;
