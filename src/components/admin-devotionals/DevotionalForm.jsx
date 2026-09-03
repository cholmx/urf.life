import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import RichTextEditor from '../RichTextEditor';
import { toTitleCase } from '../../utils/textFormat';

const { FiSave, FiX } = FiIcons;

const emptyForm = {
  devotional_date: '',
  title: '',
  subtitle: '',
  scripture_reference: '',
  content: '',
  response: '',
  prayer: ''
};

// Create/edit form for a single devotional. The parent owns the
// useSupabaseCrud instance (and the shared devotionals list) and passes
// down insertItem/updateItem so this form doesn't need its own copy of
// the list just to save one record.
const DevotionalForm = ({ editingDevotional, insertItem, updateItem, onSaved, onCancel, onError }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    setFormData(
      editingDevotional
        ? {
            devotional_date: editingDevotional.devotional_date,
            title: editingDevotional.title,
            subtitle: editingDevotional.subtitle || '',
            scripture_reference: editingDevotional.scripture_reference || '',
            content: editingDevotional.content,
            response: editingDevotional.response || '',
            prayer: editingDevotional.prayer || ''
          }
        : emptyForm
    );
  }, [editingDevotional]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const devotionalData = {
        devotional_date: formData.devotional_date,
        title: toTitleCase(formData.title),
        subtitle: formData.subtitle ? toTitleCase(formData.subtitle) : null,
        scripture_reference: formData.scripture_reference || null,
        content: formData.content,
        response: formData.response || null,
        prayer: formData.prayer || null
      };

      if (editingDevotional) {
        await updateItem(editingDevotional.id, devotionalData);
        onSaved('Devotional updated successfully!');
      } else {
        await insertItem(devotionalData);
        onSaved('Devotional created successfully!');
      }
    } catch (err) {
      console.error('Error saving devotional:', err);
      onError('Error saving devotional: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
        {editingDevotional ? 'Edit Devotional' : 'New Devotional'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
              Date *
            </label>
            <input
              type="date"
              value={formData.devotional_date}
              onChange={(e) => setFormData({ ...formData, devotional_date: e.target.value })}
              required
              className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
              placeholder="Devotional title"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
            Subtitle
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
            placeholder="Optional subtitle"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
            Scripture Reference
          </label>
          <input
            type="text"
            value={formData.scripture_reference}
            onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })}
            className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
            placeholder="e.g., John 1:14; Ephesians 4:15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
            Content *
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Main devotional content..."
            rows={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
            Response
          </label>
          <RichTextEditor
            value={formData.response}
            onChange={(e) => setFormData({ ...formData, response: e.target.value })}
            placeholder="Response section..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
            Prayer
          </label>
          <RichTextEditor
            value={formData.prayer}
            onChange={(e) => setFormData({ ...formData, prayer: e.target.value })}
            placeholder="Prayer section..."
            rows={4}
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 inline-flex items-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiSave} className="h-4 w-4" />
            <span>{editingDevotional ? 'Update' : 'Create'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors inline-flex items-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiX} className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default DevotionalForm;
