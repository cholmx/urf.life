import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { parseLocalDate } from '../utils/dateFormat';
import { useSupabaseCrud } from '../hooks/useSupabaseCrud';
import DevotionalForm from './admin-devotionals/DevotionalForm';
import DevotionalBulkImport from './admin-devotionals/DevotionalBulkImport';
import DevotionalList from './admin-devotionals/DevotionalList';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';

const { FiUpload, FiDownload, FiTrash2, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiPlus } = FiIcons;

const AdminDevotionals = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const {
    items: devotionals, loading, fetchItems, insertItem, updateItem, deleteItem
  } = useSupabaseCrud('daily_devotionals_portal123', { orderBy: 'devotional_date', ascending: true });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingDevotional, setEditingDevotional] = useState(null);

  const handleSaved = (message) => {
    setSuccess(message);
    setError('');
    setShowForm(false);
    setEditingDevotional(null);
  };

  const handleImported = (message) => {
    setSuccess(message);
    setError('');
    setShowBulkImport(false);
    fetchItems();
  };

  const handleEdit = (devotional) => {
    setEditingDevotional(devotional);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Are you sure you want to delete this devotional?'))) return;
    try {
      await deleteItem(id);
      setSuccess('Devotional deleted successfully!');
    } catch (err) {
      console.error('Error deleting devotional:', err);
      setError('Error deleting devotional: ' + err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDevotional(null);
    setError('');
    setSuccess('');
  };

  const exportDevotionals = () => {
    if (devotionals.length === 0) {
      toast.error('No devotionals to export.');
      return;
    }

    let exportText = '';
    devotionals.forEach((devotional, index) => {
      const date = parseLocalDate(devotional.devotional_date);
      const monthName = date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
      const day = date.getDate();

      exportText += `${monthName} ${day}: ${devotional.title}\n\n`;
      if (devotional.subtitle) exportText += `${devotional.subtitle}\n\n`;
      if (devotional.scripture_reference) exportText += `${devotional.scripture_reference}\n\n`;
      if (devotional.content) exportText += `${devotional.content}\n\n`;
      if (devotional.response) exportText += `Response: ${devotional.response}\n\n`;
      if (devotional.prayer) exportText += `Prayer: ${devotional.prayer}\n\n`;
      if (index < devotionals.length - 1) exportText += '\n';
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devotionals.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllDevotionals = async () => {
    if (!(await confirm('Are you sure you want to delete ALL devotionals? This cannot be undone.'))) return;
    try {
      const { error: deleteError } = await supabase
        .from('daily_devotionals_portal123')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      if (deleteError) throw deleteError;
      setSuccess('All devotionals deleted successfully!');
      fetchItems();
    } catch (err) {
      console.error('Error deleting devotionals:', err);
      setError('Error deleting devotionals: ' + err.message);
    }
  };

  const monthsCovered = new Set(
    devotionals.map((d) => parseLocalDate(d.devotional_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
  ).size;

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
          Manage Daily Devotionals
        </h2>
        <div className="space-x-2">
          <button
            onClick={fetchItems}
            className="bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary-dark transition-colors inline-flex items-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiRefreshCw} className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowBulkImport(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiUpload} className="h-4 w-4" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => { setEditingDevotional(null); setShowForm(true); }}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors inline-flex items-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            <span>New Devotional</span>
          </button>
          {devotionals.length > 0 && (
            <>
              <button
                onClick={exportDevotionals}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center space-x-2 font-inter"
              >
                <SafeIcon icon={FiDownload} className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={clearAllDevotionals}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors inline-flex items-center space-x-2 font-inter"
              >
                <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <DevotionalForm
          editingDevotional={editingDevotional}
          insertItem={insertItem}
          updateItem={updateItem}
          onSaved={handleSaved}
          onCancel={handleCancel}
          onError={setError}
        />
      )}

      {showBulkImport && (
        <DevotionalBulkImport
          onImported={handleImported}
          onCancel={() => setShowBulkImport(false)}
          onError={setError}
        />
      )}

      {devotionals.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
            Devotionals Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary font-inter">{devotionals.length}</div>
              <div className="text-sm text-text-light font-inter">Total Devotionals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary font-inter">{monthsCovered}</div>
              <div className="text-sm text-text-light font-inter">Months Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 font-inter">
                {Math.round((devotionals.length / 365) * 100)}%
              </div>
              <div className="text-sm text-text-light font-inter">Year Coverage</div>
            </div>
          </div>
        </div>
      )}

      <DevotionalList devotionals={devotionals} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default AdminDevotionals;
