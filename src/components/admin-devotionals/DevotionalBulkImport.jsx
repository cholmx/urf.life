import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';
import { parseDevotionalFile } from '../../utils/devotionalParser';
import { useConfirm } from '../../hooks/useConfirm';

const { FiUpload, FiX } = FiIcons;

// Replaces every existing devotional with a freshly parsed batch from a
// pasted or uploaded .txt file. Uses the raw supabase client directly
// (rather than useSupabaseCrud) since this is a bulk delete-then-insert,
// not a single-record mutation - the parent refetches once via onImported.
const DevotionalBulkImport = ({ onImported, onCancel, onError }) => {
  const confirm = useConfirm();
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setImportText(e.target.result);
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (!importText.trim()) {
      onError('Please paste your devotional text first.');
      return;
    }

    setImporting(true);
    try {
      const parsedEntries = parseDevotionalFile(importText);

      if (parsedEntries.length === 0) {
        throw new Error('No valid devotionals found in the file. Please check the format.');
      }

      const confirmMessage = `Found ${parsedEntries.length} devotional entries. This will replace ALL existing devotionals with this new set - continue?`;
      if (!(await confirm(confirmMessage))) {
        setImporting(false);
        return;
      }

      const { error: deleteError } = await supabase
        .from('daily_devotionals_portal123')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      // Stop rather than continuing to insert on top of a failed clear -
      // that would silently leave old and new devotionals mixed together
      // with no indication anything went wrong.
      if (deleteError) {
        throw new Error('Could not clear existing devotionals before import: ' + deleteError.message);
      }

      const { error: insertError } = await supabase
        .from('daily_devotionals_portal123')
        .insert(parsedEntries);

      if (insertError) throw insertError;

      setImportText('');
      onImported(`Successfully uploaded ${parsedEntries.length} devotionals!`);
    } catch (err) {
      console.error('Error importing devotionals:', err);
      onError('Error importing devotionals: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
        Bulk Import Devotionals
      </h3>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2 font-inter">Expected Format</h4>
        <p className="text-blue-700 text-sm font-inter mb-3">
          Upload a .txt file with devotionals in this format:
        </p>
        <pre className="text-xs text-blue-800 bg-blue-100 p-3 rounded font-mono overflow-x-auto">
{`JANUARY 4: PURSUING HEALTHY RELATIONSHIPS

Truth and Grace Together

John 1:14; Ephesians 4:15

Jesus embodied both grace and truth perfectly...

Response: Identify one conversation where you need...

Prayer: Jesus, give me Your heart to speak truth...`}
        </pre>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 font-inter">
            Upload Text File (.txt)
          </label>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            disabled={importing}
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
            placeholder="Paste your devotionals here using the format shown above..."
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
            onClick={() => { setImportText(''); onCancel(); }}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors inline-flex items-center space-x-2 font-inter"
          >
            <SafeIcon icon={FiX} className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DevotionalBulkImport;
