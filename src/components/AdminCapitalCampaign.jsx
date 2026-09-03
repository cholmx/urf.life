import React, { useState, useEffect, useCallback } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import CampaignUpdatesManager from './admin-capital-campaign/CampaignUpdatesManager';
import CampaignVisionManager from './admin-capital-campaign/CampaignVisionManager';
import CampaignFaqsManager from './admin-capital-campaign/CampaignFaqsManager';
import LivingStonesModeration from './admin-capital-campaign/LivingStonesModeration';

const { FiFileText, FiEye, FiHelpCircle, FiCamera } = FiIcons;

// Each tab owns its own table via useSupabaseCrud (see the four
// sub-components); this component is just the tab switcher. The pending
// photo count seeds from a lightweight count-only query on mount (so the
// badge is right even before the Living Stones tab is ever opened), then
// LivingStonesModeration keeps it fresh once mounted.
const AdminCapitalCampaign = () => {
  const [activeSection, setActiveSection] = useState('updates');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    supabase
      .from('living_stones_photos')
      .select('*', { count: 'exact', head: true })
      .eq('approved', false)
      .then(({ count }) => setPendingCount(count || 0));
  }, []);

  const handlePendingCountChange = useCallback((count) => setPendingCount(count), []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl text-text-primary">Manage Growth Campaign</h2>

      <div className="flex flex-wrap gap-1 border-b border-accent">
        <button
          onClick={() => setActiveSection('updates')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'updates' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-text-primary'
          }`}
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiFileText} className="h-4 w-4" />
            <span>Updates</span>
          </div>
        </button>
        <button
          onClick={() => setActiveSection('vision')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'vision' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-text-primary'
          }`}
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiEye} className="h-4 w-4" />
            <span>Vision</span>
          </div>
        </button>
        <button
          onClick={() => setActiveSection('faqs')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'faqs' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-text-primary'
          }`}
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiHelpCircle} className="h-4 w-4" />
            <span>FAQs</span>
          </div>
        </button>
        <button
          onClick={() => setActiveSection('living-stones')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeSection === 'living-stones' ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-text-primary'
          }`}
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCamera} className="h-4 w-4" />
            <span>Living Stones</span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#E2BA49' }}>
                {pendingCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {activeSection === 'updates' && <CampaignUpdatesManager />}
      {activeSection === 'vision' && <CampaignVisionManager />}
      {activeSection === 'faqs' && <CampaignFaqsManager />}
      {activeSection === 'living-stones' && <LivingStonesModeration onPendingCountChange={handlePendingCountChange} />}
    </div>
  );
};

export default AdminCapitalCampaign;
