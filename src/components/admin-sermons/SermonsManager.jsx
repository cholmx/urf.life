import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import RichTextEditor from '../RichTextEditor';
import { toTitleCase } from '../../utils/textFormat';
import { formatDate } from '../../utils/dateFormat';
import { useSupabaseCrud } from '../../hooks/useSupabaseCrud';
import { useSermonSeries } from './SermonSeriesManager';
import { useConfirm } from '../../hooks/useConfirm';

const { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiLayers, FiAlertTriangle, FiCheckCircle } = FiIcons;

const emptyForm = {
  title: '',
  speaker: '',
  sermon_date: '',
  youtube_url: '',
  summary: '',
  discussion_questions: '',
  sermon_series_id: ''
};

const SermonsManager = () => {
  const confirm = useConfirm();
  const { items: sermons, loading, insertItem, updateItem, deleteItem } = useSupabaseCrud(
    'sermons_portal123',
    { orderBy: 'sermon_date', ascending: false }
  );
  // Read-only copy of the series list, just for the dropdown and the
  // series-name lookup on each sermon card - series themselves are
  // managed in SermonSeriesManager.
  const { items: sermonSeries } = useSermonSeries();

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess('');

    try {
      const sermonData = {
        title: toTitleCase(formData.title),
        speaker: toTitleCase(formData.speaker),
        sermon_date: formData.sermon_date,
        youtube_url: formData.youtube_url,
        summary: formData.summary,
        discussion_questions: formData.discussion_questions,
        sermon_series_id: formData.sermon_series_id || null
      };

      if (editingId) {
        await updateItem(editingId, sermonData);
        setSuccess('Sermon updated successfully!');
      } else {
        await insertItem(sermonData);
        setSuccess('Sermon created successfully!');
      }

      handleCancel();
    } catch (err) {
      console.error('Error saving sermon:', err);
      setError('Error saving sermon: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (sermon) => {
    setFormData({
      title: sermon.title,
      speaker: sermon.speaker || '',
      sermon_date: sermon.sermon_date,
      youtube_url: sermon.youtube_url || '',
      summary: sermon.summary,
      discussion_questions: sermon.discussion_questions,
      sermon_series_id: sermon.sermon_series_id || ''
    });
    setEditingId(sermon.id);
    setShowForm(true);
    setError(null);
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Are you sure you want to delete this sermon?'))) return;
    try {
      await deleteItem(id);
      setSuccess('Sermon deleted successfully!');
    } catch (err) {
      console.error('Error deleting sermon:', err);
      setError('Error deleting sermon: ' + err.message);
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
    setSuccess('');
  };

  const getSeriesName = (seriesId) => {
    const series = sermonSeries.find(s => s.id === seriesId);
    return series ? series.name : 'Standalone Sermon';
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

      <div className="flex justify-end mb-6">
        <button onClick={() => setShowForm(true)} className="admin-btn-primary">
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          <span>New Sermon</span>
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="admin-input"
                  placeholder="Sermon title"
                />
              </div>
              <div>
                <label className="admin-label">Speaker</label>
                <input
                  type="text"
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                  className="admin-input"
                  placeholder="Speaker name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Sermon Date *</label>
                <input
                  type="date"
                  value={formData.sermon_date}
                  onChange={(e) => setFormData({ ...formData, sermon_date: e.target.value })}
                  required
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Sermon Series</label>
                <select
                  value={formData.sermon_series_id}
                  onChange={(e) => setFormData({ ...formData, sermon_series_id: e.target.value })}
                  className="admin-input"
                >
                  <option value="">Standalone Sermon</option>
                  {sermonSeries.map((series) => (
                    <option key={series.id} value={series.id}>
                      {series.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="admin-label">YouTube URL</label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                className="admin-input"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="admin-label">Sermon Summary</label>
              <RichTextEditor
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Paste your sermon summary here... Formatting will be preserved!"
                rows={6}
              />
            </div>

            <div>
              <label className="admin-label">Discussion Questions</label>
              <RichTextEditor
                value={formData.discussion_questions}
                onChange={(e) => setFormData({ ...formData, discussion_questions: e.target.value })}
                placeholder="Paste your discussion questions here... Lists and formatting will be preserved!"
                rows={6}
              />
            </div>

            <div className="flex space-x-4">
              <button type="submit" disabled={saving} className="admin-btn-primary">
                <SafeIcon icon={FiSave} className="h-4 w-4" />
                <span>{editingId ? 'Update' : 'Create'}</span>
              </button>
              <button type="button" onClick={handleCancel} className="admin-btn-secondary">
                <SafeIcon icon={FiX} className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl shadow-modern overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-primary font-inter">Loading...</p>
          </div>
        ) : sermons.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-primary font-inter">No sermons yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-accent">
            {sermons.map((sermon) => (
              <div key={sermon.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary font-inter mb-2">
                      {sermon.title}
                    </h3>
                    {sermon.sermon_series_id && (
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white font-inter">
                          <SafeIcon icon={FiLayers} className="h-3 w-3 mr-1" />
                          {getSeriesName(sermon.sermon_series_id)}
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-text-light font-inter mb-2">
                      {sermon.speaker && `${sermon.speaker} • `}
                      {formatDate(sermon.sermon_date)}
                    </div>
                    {sermon.youtube_url && (
                      <div className="text-sm text-primary font-inter mb-2">
                        YouTube: {sermon.youtube_url}
                      </div>
                    )}
                    {sermon.summary && (
                      <div className="text-sm text-text-primary font-inter mb-2">
                        Summary: {sermon.summary.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1 ml-4">
                    <button onClick={() => handleEdit(sermon)} className="admin-btn-edit">
                      <SafeIcon icon={FiEdit} className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(sermon.id)} className="admin-btn-danger">
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SermonsManager;
