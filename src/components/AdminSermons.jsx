import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SermonSeriesManager, { useSermonSeries } from './admin-sermons/SermonSeriesManager';
import SermonsManager from './admin-sermons/SermonsManager';

const { FiLayers } = FiIcons;

// Sermons and sermon series are managed by two sub-components, but the
// series list itself is fetched once here and passed down to both - so
// creating/deleting a series in SermonSeriesManager is immediately
// reflected in SermonsManager's series dropdown, rather than each owning
// its own disconnected copy of the same table.
const AdminSermons = () => {
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const { items: series, saving: seriesSaving, insertItem: insertSeries, deleteItem: deleteSeries } = useSermonSeries();

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

      <SermonSeriesManager
        showForm={showSeriesForm}
        onCloseForm={() => setShowSeriesForm(false)}
        series={series}
        saving={seriesSaving}
        insertItem={insertSeries}
        deleteItem={deleteSeries}
      />
      <SermonsManager sermonSeries={series} />
    </div>
  );
};

export default AdminSermons;
