import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import RichTextEditor from '../RichTextEditor';
import { SkeletonTable, LoadingTransition } from '../LoadingSkeletons';
import { toTitleCase } from '../../utils/textFormat';
import { formatDate } from '../../utils/dateFormat';
import { useSupabaseCrud } from '../../hooks/useSupabaseCrud';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

const { FiPlus, FiEdit, FiTrash2, FiSave, FiX } = FiIcons;

const emptyForm = { title: '', content: '', type: 'written', video_url: '', thumbnail_url: '', published: false, display_order: 0 };

const CampaignUpdatesManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { items: updates, loading, insertItem, updateItem, deleteItem } = useSupabaseCrud(
    'campaign_updates',
    { orderBy: 'display_order', ascending: true }
  );
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: toTitleCase(formData.title),
        content: formData.content,
        type: formData.type,
        video_url: formData.video_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        published: formData.published,
        display_order: formData.display_order
      };
      if (editingId) {
        await updateItem(editingId, data);
      } else {
        await insertItem(data);
      }
      handleCancel();
    } catch (error) {
      console.error('Error saving update:', error);
      toast.error(`Error saving update: ${error.message}`);
    }
  };

  const handleEdit = (update) => {
    setFormData({
      title: update.title,
      content: update.content,
      type: update.type,
      video_url: update.video_url || '',
      thumbnail_url: update.thumbnail_url || '',
      published: update.published,
      display_order: update.display_order
    });
    setEditingId(update.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Are you sure you want to delete this item?'))) return;
    try {
      await deleteItem(id);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error deleting item. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-text-primary">Campaign Updates</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          <span>New Update</span>
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="written">Written Update</option>
                  <option value="video">Video Update</option>
                </select>
              </div>
            </div>

            {formData.type === 'video' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Video URL</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="YouTube or video URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Content *</label>
              <RichTextEditor
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex items-center pt-7">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-primary"
                  />
                  <span className="ml-2 text-text-primary">Published</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={handleCancel} className="bg-gray-300 text-text-primary px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors inline-flex items-center space-x-2">
                <SafeIcon icon={FiX} className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center space-x-2">
                <SafeIcon icon={FiSave} className="h-4 w-4" />
                <span>{editingId ? 'Update' : 'Create'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <LoadingTransition isLoading={loading} skeleton={<SkeletonTable />}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-accent">
            <thead className="bg-accent">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-accent">
              {updates.map((update) => (
                <tr key={update.id}>
                  <td className="px-6 py-4 text-sm text-text-primary">{update.title}</td>
                  <td className="px-6 py-4 text-sm text-text-light capitalize">{update.type}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${update.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {update.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-light">{update.display_order}</td>
                  <td className="px-6 py-4 text-sm text-text-light">{formatDate(update.created_at, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button onClick={() => handleEdit(update)} className="text-primary hover:text-primary-dark">
                      <SafeIcon icon={FiEdit} className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(update.id)} className="text-red-500 hover:text-red-700">
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadingTransition>
    </div>
  );
};

export default CampaignUpdatesManager;
