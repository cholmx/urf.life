import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { toTitleCase } from '../../utils/textFormat';

const { FiTrash2, FiSave, FiX, FiBookOpen, FiLink } = FiIcons;

const emptyForm = { name: '', description: '', is_link_group: false };

// Categories are owned by the parent (AdminResources) since the bulk
// importer needs to create categories on the fly against the same list
// the resource form's dropdown reads from - this component is
// presentational plus the create-category form.
const ResourceCategoriesManager = ({ categories, showForm, onCancel, insertCategory, onSaved, onError, onDeleteCategory }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await insertCategory({ ...formData, name: toTitleCase(formData.name) });
      setFormData(emptyForm);
      onSaved('Category created successfully!');
    } catch (err) {
      console.error('Error saving category:', err);
      onError('Error saving category: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {categories.length > 0 && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
            Categories ({categories.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border border-accent-dark rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-text-primary font-inter">{category.name}</h4>
                      <SafeIcon
                        icon={category.is_link_group ? FiLink : FiBookOpen}
                        className="h-4 w-4 text-primary"
                      />
                    </div>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        category.is_link_group ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      } font-inter`}
                    >
                      {category.is_link_group ? 'Link Group' : 'Book Category'}
                    </span>
                  </div>
                  <button onClick={() => onDeleteCategory(category.id)} className="text-red-500 hover:text-red-700 ml-2">
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
                {category.description && (
                  <p className="text-sm text-text-light font-inter mt-2">{category.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
            Create New Category
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="admin-label">Category Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="admin-input"
                placeholder="e.g., Biblical Studies, Useful Links"
              />
            </div>

            <div>
              <label className="admin-label">Category Type *</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="category_type"
                    checked={!formData.is_link_group}
                    onChange={() => setFormData({ ...formData, is_link_group: false })}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiBookOpen} className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-text-primary font-inter">Book Category (for individual books)</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="category_type"
                    checked={formData.is_link_group}
                    onChange={() => setFormData({ ...formData, is_link_group: true })}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiLink} className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-text-primary font-inter">Link Group (for website collections)</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="admin-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="admin-input resize-none"
                placeholder="Brief description of this category"
              />
            </div>

            <div className="flex space-x-4">
              <button type="submit" disabled={saving} className="admin-btn-primary">
                <SafeIcon icon={FiSave} className="h-4 w-4" />
                <span>Create Category</span>
              </button>
              <button type="button" onClick={onCancel} className="admin-btn-secondary">
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

export default ResourceCategoriesManager;
