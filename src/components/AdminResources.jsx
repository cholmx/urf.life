import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { useSupabaseCrud } from '../hooks/useSupabaseCrud';
import ResourceCategoriesManager from './admin-resources/ResourceCategoriesManager';
import ResourceForm from './admin-resources/ResourceForm';
import ResourceBulkImport from './admin-resources/ResourceBulkImport';
import ResourceList, { getCleanDescription } from './admin-resources/ResourceList';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';

const { FiPlus, FiTag, FiBookOpen, FiAlertCircle, FiCheckCircle, FiUpload, FiDownload, FiRefreshCw } = FiIcons;

const AdminResources = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const {
    items: resources, loading, fetchItems: fetchResources, insertItem: insertResource,
    updateItem: updateResource, deleteItem: deleteResource
  } = useSupabaseCrud('resources_portal123', { orderBy: 'created_at', ascending: false });

  const {
    items: categories, fetchItems: fetchCategories, insertItem: insertCategory, deleteItem: deleteCategory
  } = useSupabaseCrud('resource_categories_portal123', { orderBy: 'name', ascending: true });

  const [editingResource, setEditingResource] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const handleSaved = (message) => {
    setSuccess(message);
    setError(null);
    setShowForm(false);
    setEditingResource(null);
  };

  const handleCategorySaved = (message) => {
    setSuccess(message);
    setError(null);
    setShowCategoryForm(false);
  };

  const handleImported = (message) => {
    setSuccess(message);
    setError(null);
    setShowBulkImport(false);
    fetchResources();
    fetchCategories();
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setShowForm(true);
    setError(null);
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Are you sure you want to delete this resource?'))) return;
    try {
      await deleteResource(id);
      setSuccess('Resource deleted successfully!');
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError('Error deleting resource: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!(await confirm('Are you sure you want to delete this category? Resources in this category will become uncategorized.'))) return;
    try {
      await deleteCategory(id);
      setSuccess('Category deleted successfully!');
      fetchResources(); // categories become uncategorized on their cards
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Error deleting category: ' + err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingResource(null);
    setError(null);
    setSuccess('');
  };

  // Cleans up leftover "Available from multiple sources" boilerplate that
  // used to get pasted into descriptions before the bulk-import format
  // changed. Applies getCleanDescription (shared with the list display) to
  // every resource and persists only the ones that actually changed.
  const cleanExistingDescriptions = async () => {
    setCleaning(true);
    setError(null);
    setSuccess('');
    try {
      let cleanedCount = 0;
      for (const resource of resources) {
        if (!resource.description) continue;
        const cleanDescription = getCleanDescription(resource.description);
        if (cleanDescription !== resource.description.trim()) {
          const { error: updateError } = await supabase
            .from('resources_portal123')
            .update({ description: cleanDescription })
            .eq('id', resource.id);
          if (updateError) {
            console.error(`Error updating resource ${resource.id}:`, updateError);
          } else {
            cleanedCount++;
          }
        }
      }
      setSuccess(`Successfully cleaned ${cleanedCount} resource descriptions!`);
      fetchResources();
    } catch (err) {
      console.error('Error cleaning descriptions:', err);
      setError('Error cleaning descriptions: ' + err.message);
    } finally {
      setCleaning(false);
    }
  };

  const exportResources = () => {
    if (resources.length === 0) {
      toast.error('No resources to export.');
      return;
    }

    const getCategoryName = (categoryId) => {
      const category = categories.find(c => c.id === categoryId);
      return category ? category.name : 'Uncategorized';
    };

    let exportText = '';
    resources.forEach((resource, index) => {
      exportText += `Category: ${getCategoryName(resource.category_id)}\n`;
      exportText += `Title: ${resource.title}\n`;
      if (resource.author) exportText += `Author: ${resource.author}\n`;
      exportText += `Links to Books:\n\n`;

      const links = (resource.amazon_link || '').split('\n').filter(link => link.trim());
      links.forEach(link => { exportText += `${link.trim()}\n`; });

      if (index < resources.length - 1) exportText += '\n\n\n';
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'book-recommendations.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {success && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-600" />
            <p className="text-green-700 font-inter">{success}</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-red-600" />
            <p className="text-red-700 font-inter">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary font-inter">
          Manage Resources
        </h2>
        <div className="space-x-2">
          <button
            onClick={cleanExistingDescriptions}
            disabled={cleaning}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors inline-flex items-center space-x-2 font-inter disabled:opacity-50"
          >
            <SafeIcon icon={FiRefreshCw} className="h-4 w-4" />
            <span>{cleaning ? 'Cleaning...' : 'Clean Descriptions'}</span>
          </button>
          <button
            onClick={() => setShowBulkImport(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiUpload} className="h-4 w-4" />
            <span>Bulk Import</span>
          </button>
          {resources.length > 0 && (
            <button
              onClick={exportResources}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center space-x-2 font-inter"
            >
              <SafeIcon icon={FiDownload} className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
          <button onClick={() => setShowCategoryForm(true)} className="admin-btn-secondary">
            <SafeIcon icon={FiTag} className="h-4 w-4" />
            <span>New Category</span>
          </button>
          <button
            onClick={() => { setEditingResource(null); setShowForm(true); }}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors inline-flex items-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            <span>New Resource</span>
          </button>
        </div>
      </div>

      {showBulkImport && (
        <ResourceBulkImport
          resources={resources}
          categories={categories}
          onImported={handleImported}
          onCancel={() => setShowBulkImport(false)}
          onError={setError}
        />
      )}

      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <SafeIcon icon={FiBookOpen} className="h-5 w-5 text-neutral-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-neutral-800 mb-1 font-inter">
              Resource Categories
            </h4>
            <p className="text-neutral-700 text-sm font-inter">
              <strong>Book Categories:</strong> For individual books with multiple purchase links<br />
              <strong>Link Groups:</strong> For collections of website links and online resources
            </p>
          </div>
        </div>
      </div>

      <ResourceCategoriesManager
        categories={categories}
        showForm={showCategoryForm}
        insertCategory={insertCategory}
        onSaved={handleCategorySaved}
        onCancel={() => setShowCategoryForm(false)}
        onError={setError}
        onDeleteCategory={handleDeleteCategory}
      />

      {showForm && (
        <ResourceForm
          categories={categories}
          editingResource={editingResource}
          insertItem={insertResource}
          updateItem={updateResource}
          onSaved={handleSaved}
          onCancel={handleCancel}
          onError={setError}
        />
      )}

      <ResourceList
        resources={resources}
        categories={categories}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminResources;
