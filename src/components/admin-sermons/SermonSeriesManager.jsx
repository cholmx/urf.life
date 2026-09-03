import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { toTitleCase } from '../../utils/textFormat';
import { formatDate } from '../../utils/dateFormat';
import { useSupabaseCrud } from '../../hooks/useSupabaseCrud';
import { useConfirm } from '../../hooks/useConfirm';

const { FiTrash2, FiSave, FiX, FiAlertTriangle, FiCheckCircle } = FiIcons;

const emptyForm = { name: '', description: '', start_date: '', end_date: '' };

// Manages sermon series independently of individual sermons - a series is
// created/deleted here and referenced by id from SermonsManager's sermon
// form (which fetches its own copy of the series list for the dropdown).
const SermonSeriesManager = ({ showForm, onCloseForm }) => {
  const confirm = useConfirm();
  const { items: series, saving, insertItem, deleteItem } = useSermonSeries();
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    try {
      await insertItem({
        name: toTitleCase(formData.name),
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null
      });
      setSuccess('Sermon series created successfully!');
      setFormData(emptyForm);
      onCloseForm();
    } catch (err) {
      console.error('Error saving sermon series:', err);
      setError('Error saving sermon series: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Are you sure you want to delete this sermon series? This will not delete the sermons in the series.'))) return;
    try {
      await deleteItem(id);
      setSuccess('Sermon series deleted successfully!');
    } catch (err) {
      console.error('Error deleting sermon series:', err);
      setError('Error deleting sermon series: ' + err.message);
    }
  };

  return (
    <>
      {success && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-600" />
            <p className="text-green-700 font-inter">{success}</p>
          </div>
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-red-600" />
            <p className="text-red-700 font-inter">{error}</p>
          </div>
        </motion.div>
      )}

      {series.length > 0 && (
        <div className="admin-card mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
            Sermon Series
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {series.map((s) => (
              <div key={s.id} className="border border-accent-dark rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-text-primary font-inter">{s.name}</h4>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-text-light mb-2 font-inter">{s.description}</p>
                <div className="text-xs text-text-light font-inter">
                  {formatDate(s.start_date)} - {s.end_date ? formatDate(s.end_date) : 'Ongoing'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
            Create New Sermon Series
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Series Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="admin-input"
                  placeholder="e.g., Faith in Action"
                />
              </div>
              <div>
                <label className="admin-label">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="admin-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-inter"
                  placeholder="Brief description of the sermon series"
                />
              </div>
              <div>
                <label className="admin-label">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button type="submit" disabled={saving} className="admin-btn-primary">
                <SafeIcon icon={FiSave} className="h-4 w-4" />
                <span>Create Series</span>
              </button>
              <button type="button" onClick={onCloseForm} className="admin-btn-secondary">
                <SafeIcon icon={FiX} className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </>
  );
};

// Small wrapper so the hook's insertItem tracks its own "saving" flag
// separately from the shared fetch/loading state, matching the pattern
// used across the other Admin panels.
function useSermonSeries() {
  const { items, insertItem: baseInsert, deleteItem, ...rest } = useSupabaseCrud(
    'sermon_series_portal123',
    { orderBy: 'start_date', ascending: false }
  );
  const [saving, setSaving] = useState(false);
  const insertItem = async (payload) => {
    setSaving(true);
    try {
      return await baseInsert(payload);
    } finally {
      setSaving(false);
    }
  };
  return { items, insertItem, deleteItem, saving, ...rest };
}

export { useSermonSeries };
export default SermonSeriesManager;
