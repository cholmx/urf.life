import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { toTitleCase } from '../../utils/textFormat';

const { FiSave, FiX } = FiIcons;

const emptyForm = { title: '', author: '', description: '', amazon_link: '', category_id: '', image_url: '' };

const ResourceForm = ({ categories, editingResource, insertItem, updateItem, onSaved, onCancel, onError }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    setFormData(
      editingResource
        ? {
            title: editingResource.title,
            author: editingResource.author || '',
            description: editingResource.description || '',
            amazon_link: editingResource.amazon_link,
            category_id: editingResource.category_id || '',
            image_url: editingResource.image_url || ''
          }
        : emptyForm
    );
  }, [editingResource]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const resourceData = {
        title: toTitleCase(formData.title),
        author: toTitleCase(formData.author),
        description: formData.description.trim() || '',
        amazon_link: formData.amazon_link,
        category_id: formData.category_id || null,
        image_url: formData.image_url
      };

      if (editingResource) {
        await updateItem(editingResource.id, resourceData);
        onSaved('Resource updated successfully!');
      } else {
        await insertItem(resourceData);
        onSaved('Resource created successfully!');
      }
    } catch (err) {
      console.error('Error saving resource:', err);
      onError('Error saving resource: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card">
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
              placeholder="Book title or link name"
            />
          </div>
          <div>
            <label className="admin-label">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="admin-input"
              placeholder="Author name (for books)"
            />
          </div>
        </div>

        <div>
          <label className="admin-label">Category</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="admin-input"
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} {category.is_link_group ? '(Link Group)' : '(Books)'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="admin-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="admin-input resize-none"
            placeholder="Brief description (optional)"
          />
        </div>

        <div>
          <label className="admin-label">
            Links * <span className="text-sm text-text-light">(one per line for multiple links)</span>
          </label>
          <textarea
            value={formData.amazon_link}
            onChange={(e) => setFormData({ ...formData, amazon_link: e.target.value })}
            required
            rows={4}
            className="admin-input resize-none"
            placeholder={`https://www.amazon.com/dp/...
https://www.barnesandnoble.com/...
https://www.christianbook.com/...`}
          />
        </div>

        <div>
          <label className="admin-label">Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="admin-input"
            placeholder="https://example.com/image.jpg (optional)"
          />
        </div>

        <div className="flex space-x-4">
          <button type="submit" disabled={saving} className="admin-btn-primary">
            <SafeIcon icon={FiSave} className="h-4 w-4" />
            <span>{editingResource ? 'Update' : 'Create'}</span>
          </button>
          <button type="button" onClick={onCancel} className="admin-btn-secondary">
            <SafeIcon icon={FiX} className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ResourceForm;
