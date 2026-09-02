import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import RichTextEditor from './RichTextEditor';
import supabase from '../lib/supabase';
import { useSupabaseCrud } from '../hooks/useSupabaseCrud';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';

const { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiBookOpen, FiUpload, FiDownload } = FiIcons;

const AdminScriptures = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const {items: scriptures,loading,fetchItems,insertItem,updateItem,deleteItem}=useSupabaseCrud(
    'daily_scriptures_portal123',
    {orderBy: 'created_at',ascending: true}
  );
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    verse_text: '',
    reference: '',
    notes: ''
  });

  const parseImportText = (text) => {
    const entries = [];
    const lines = text.split('\n').filter(line => line.trim() !== '');

    let currentEntry = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if this line looks like a reference (contains numbers and colons)
      const referencePattern = /^[A-Za-z0-9\s]+\s+\d+[:\d\s,-]+$/;

      if (referencePattern.test(line)) {
        // This is a reference line
        if (currentEntry && currentEntry.verse_text) {
          entries.push(currentEntry);
        }
        currentEntry = {
          reference: line,
          verse_text: '',
          notes: ''
        };
      } else if (currentEntry) {
        // This is verse text or notes
        if (currentEntry.verse_text === '') {
          currentEntry.verse_text = line;
        } else {
          // Additional lines could be notes
          if (currentEntry.notes) {
            currentEntry.notes += '\n' + line;
          } else {
            currentEntry.notes = line;
          }
        }
      } else {
        // No current entry, this might be verse text without a reference above it
        // Look ahead to see if next line is a reference
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        if (referencePattern.test(nextLine)) {
          currentEntry = {
            reference: '',
            verse_text: line,
            notes: ''
          };
        }
      }
    }

    // Don't forget the last entry
    if (currentEntry && currentEntry.verse_text) {
      entries.push(currentEntry);
    }

    return entries;
  };

  const handleBulkImport = async () => {
    if (!importText.trim()) {
      toast.error('Please paste your scripture text first.');
      return;
    }

    setImporting(true);

    try {
      const parsedEntries = parseImportText(importText);

      if (parsedEntries.length === 0) {
        toast.error('No valid scripture entries found. Please check your format.');
        setImporting(false);
        return;
      }

      // Show preview and confirm
      const confirmMessage = `Found ${parsedEntries.length} scripture entries. Import them all?`;
      if (!(await confirm(confirmMessage))) {
        setImporting(false);
        return;
      }

      // Import all entries
      const importPromises = parsedEntries.map(entry =>
        supabase
          .from('daily_scriptures_portal123')
          .insert([{
            verse_text: `<p>${entry.verse_text}</p>`,
            reference: entry.reference,
            notes: entry.notes ? `<p>${entry.notes}</p>` : null
          }])
      );

      await Promise.all(importPromises);

      toast.success(`Successfully imported ${parsedEntries.length} scriptures!`);
      setImportText('');
      setShowBulkImport(false);
      fetchItems();

    } catch (error) {
      console.error('Error importing scriptures:', error);
      toast.error('Error importing scriptures. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportText(e.target.result);
    };
    reader.readAsText(file);
  };

  const exportScriptures = () => {
    if (scriptures.length === 0) {
      toast.error('No scriptures to export.');
      return;
    }

    let exportText = '';
    scriptures.forEach((scripture, index) => {
      exportText += `${scripture.reference}\n`;
      exportText += `${scripture.verse_text.replace(/<[^>]*>/g, '')}\n`;
      if (scripture.notes) {
        exportText += `${scripture.notes.replace(/<[^>]*>/g, '')}\n`;
      }
      if (index < scriptures.length - 1) {
        exportText += '\n';
      }
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scriptures.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const scriptureData = {
        verse_text: formData.verse_text,
        reference: formData.reference,
        notes: formData.notes || null
      };

      if (editingId) {
        await updateItem(editingId, scriptureData);
      } else {
        await insertItem(scriptureData);
      }

      setFormData({ verse_text: '', reference: '', notes: '' });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving scripture:', error);
      toast.error('Error saving scripture. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (scripture) => {
    setFormData({
      verse_text: scripture.verse_text,
      reference: scripture.reference,
      notes: scripture.notes || ''
    });
    setEditingId(scripture.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Are you sure you want to delete this scripture verse?'))) return;

    try {
      await deleteItem(id);
    } catch (error) {
      console.error('Error deleting scripture:', error);
      toast.error('Error deleting scripture. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({ verse_text: '', reference: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleVerseChange = (e) => {
    setFormData({ ...formData, verse_text: e.target.value });
  };

  const handleNotesChange = (e) => {
    setFormData({ ...formData, notes: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary font-inter">
          Daily Scripture Verses
        </h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowBulkImport(true)}
            className="bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary-dark transition-colors inline-flex items-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiUpload} className="h-4 w-4" />
            <span>Bulk Import</span>
          </button>
          {scriptures.length > 0 && (
            <button
              onClick={exportScriptures}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center space-x-2 font-inter"
            >
              <SafeIcon icon={FiDownload} className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors inline-flex items-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            <span>Add Scripture</span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <SafeIcon icon={FiBookOpen} className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-1 font-inter">
              How Daily Scriptures Work
            </h4>
            <p className="text-blue-700 text-sm font-inter">
              Add scripture verses that will rotate daily on the home page. The system cycles through all verses in order, showing a different verse each day. When it reaches the end of the list, it starts over from the beginning.
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
            Bulk Import Scriptures
          </h3>

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2 font-inter">
              Format Instructions
            </h4>
            <p className="text-yellow-700 text-sm font-inter mb-2">
              Use this format for each scripture (one per section):
            </p>
            <pre className="text-xs text-yellow-800 bg-yellow-100 p-2 rounded font-mono">
{`John 3:16
For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.

Psalm 23:1
The Lord is my shepherd, I lack nothing.

Romans 8:28
And we know that in all things God works for the good of those who love him, who have been called according to his purpose.`}
            </pre>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                Upload Text File
              </label>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                Or Paste Text Here
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={10}
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-inter"
                placeholder="Paste your scriptures here using the format shown above..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleBulkImport}
                disabled={importing || !importText.trim()}
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 inline-flex items-center space-x-2 font-inter"
              >
                <SafeIcon icon={FiUpload} className="h-4 w-4" />
                <span>{importing ? 'Importing...' : 'Import All'}</span>
              </button>
              <button
                onClick={() => {
                  setShowBulkImport(false);
                  setImportText('');
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors inline-flex items-center space-x-2 font-inter"
              >
                <SafeIcon icon={FiX} className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                Scripture Verse *
              </label>
              <RichTextEditor
                value={formData.verse_text}
                onChange={handleVerseChange}
                placeholder="Enter the scripture verse text here..."
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                Scripture Reference *
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                required
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
                placeholder="e.g., John 3:16, Psalm 23:1, Romans 8:28"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
                Notes (Optional)
              </label>
              <RichTextEditor
                value={formData.notes}
                onChange={handleNotesChange}
                placeholder="Add any notes or commentary about this verse..."
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
                <span>{editingId ? 'Update' : 'Add'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors inline-flex items-center space-x-2 font-inter"
              >
                <SafeIcon icon={FiX} className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Scriptures List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-primary font-inter">Loading...</p>
          </div>
        ) : scriptures.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-primary font-inter">No scripture verses yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-accent">
            {scriptures.map((scripture, index) => (
              <div key={scripture.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white font-inter">
                        Day {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-text-primary font-inter">
                        {scripture.reference}
                      </h3>
                    </div>
                    <div className="text-text-primary font-inter mb-3 prose prose-sm max-w-none rendered-content">
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(scripture.verse_text) }} />
                    </div>
                    {scripture.notes && (
                      <div className="text-sm text-text-light">
                        <strong>Notes:</strong>
                        <div className="mt-1 prose prose-sm max-w-none rendered-content">
                          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(scripture.notes) }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(scripture)}
                      className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
                    >
                      <SafeIcon icon={FiEdit} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(scripture.id)}
                      className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {scriptures.length > 0 && (
        <div className="bg-accent p-4 rounded-lg">
          <p className="text-text-primary text-sm font-inter">
            <strong>Total verses:</strong> {scriptures.length} |{' '}
            <strong>Cycle length:</strong> {scriptures.length} days |{' '}
            <strong>Current verse:</strong> Day{' '}
            {(Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % scriptures.length) + 1}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminScriptures;
