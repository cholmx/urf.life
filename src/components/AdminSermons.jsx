import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SermonSeriesManager from './admin-sermons/SermonSeriesManager';
import SermonsManager from './admin-sermons/SermonsManager';

const { FiLayers } = FiIcons;

// Sermons and sermon series are managed by two independent sub-components
// (each owning its own Supabase table via useSupabaseCrud); this component
// just composes them and owns the "New Series" form toggle, since that
// button lives in the shared header.
const AdminSermons = () => {
  const [showSeriesForm, setShowSeriesForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary font-inter">
          Manage Sermons
        </h2>
        <button onClick={() => setShowSeriesForm(true)} className="admin-btn-secondary">
          <SafeIcon icon={FiLayers} className="h-4 w-4" />
          <span>New Series</span>
        </button>
      </div>

      <SermonSeriesManager showForm={showSeriesForm} onCloseForm={() => setShowSeriesForm(false)} />
      <SermonsManager />
    </div>
  );
};

export default AdminSermons;
