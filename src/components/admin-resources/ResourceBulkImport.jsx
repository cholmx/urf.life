import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';
import { parseResourcesFile } from '../../utils/resourceParser';
import { useConfirm } from '../../hooks/useConfirm';

const { FiUpload, FiX } = FiIcons;

// Bulk import needs the live resources/categories lists (to dedupe against
// existing titles and find-or-create categories on the fly), so the parent
// passes down its current state. Writes go straight through the raw
// supabase client rather than useSupabaseCrud's insertItem/updateItem,
// since those refetch the whole table after every call - fine for a single
// form submission, wasteful for a loop of dozens of inserts. The parent
// refetches once via onImported when the whole batch is done.
const ResourceBulkImport = ({ resources, categories, onImported, onCancel, onError }) => {
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
      onError('Please paste your book recommendations text first.');
      return;
    }

    setImporting(true);
    try {
      const parsedResources = parseResourcesFile(importText);

      if (parsedResources.length === 0) {
        throw new Error('No valid book recommendations found in the file. Please check the format.');
      }

      const confirmMessage = `Found ${parsedResources.length} book recommendations. Import them all?`;
      if (!(await confirm(confirmMessage))) {
        setImporting(false);
        return;
      }

      // Local working copies so category find-or-create and resource
      // dedupe both see records created earlier in this same loop.
      const workingCategories = [...categories];
      const workingResources = [...resources];
      const failedTitles = [];

      for (const resource of parsedResources) {
        let categoryId = null;
        if (resource.category) {
          let category = workingCategories.find(
            c => c.name.toLowerCase() === resource.category.toLowerCase()
          );

          if (!category) {
            const { data: newCategory, error: categoryError } = await supabase
              .from('resource_categories_portal123')
              .insert([{
                name: resource.category,
                description: `Books about ${resource.category.toLowerCase()}`,
                is_link_group: false
              }])
              .select()
              .single();

            if (categoryError) {
              console.warn('Error creating category:', categoryError);
            } else {
              category = newCategory;
              workingCategories.push(newCategory);
            }
          }

          categoryId = category?.id || null;
        }

        const existingResource = workingResources.find(
          r => r.title.toLowerCase() === resource.title.toLowerCase() &&
            (r.author || '').toLowerCase() === (resource.author || '').toLowerCase()
        );

        if (existingResource) {
          const existingLinks = existingResource.amazon_link.split('\n').filter(link => link.trim());
          const newLinks = resource.links.filter(link => !existingLinks.includes(link));

          if (newLinks.length > 0) {
            const allLinks = [...existingLinks, ...newLinks].join('\n');
            const { error: updateError } = await supabase
              .from('resources_portal123')
              .update({ amazon_link: allLinks })
              .eq('id', existingResource.id);
            if (updateError) {
              console.warn(`Error updating resource "${resource.title}":`, updateError);
              failedTitles.push(resource.title);
            } else {
              existingResource.amazon_link = allLinks;
            }
          }
        } else {
          const allLinks = resource.links.join('\n');
          const resourceData = {
            title: resource.title,
            author: resource.author,
            description: '',
            amazon_link: allLinks,
            category_id: categoryId
          };

          const { data: newResource, error: insertError } = await supabase
            .from('resources_portal123')
            .insert([resourceData])
            .select()
            .single();

          if (insertError) {
            console.warn(`Error inserting resource "${resource.title}":`, insertError);
            failedTitles.push(resource.title);
          } else {
            workingResources.push(newResource);
          }
        }
      }

      setImportText('');
      if (failedTitles.length > 0) {
        onImported(`Imported ${parsedResources.length - failedTitles.length} of ${parsedResources.length} book recommendations - ${failedTitles.length} failed (${failedTitles.join(', ')}). Check console for details.`);
      } else {
        onImported(`Successfully imported ${parsedResources.length} book recommendations!`);
      }
    } catch (err) {
      console.error('Error importing resources:', err);
      onError('Error importing resources: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card">
      <h3 className="text-lg font-semibold text-text-primary mb-4 font-inter">
        Bulk Import Book Recommendations
      </h3>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2 font-inter">Expected Format</h4>
        <p className="text-blue-700 text-sm font-inter mb-3">
          Upload a .txt file with book recommendations in this format:
        </p>
        <pre className="text-xs text-blue-800 bg-blue-100 p-3 rounded font-mono overflow-x-auto">
{`Category: SUFFERING & HEALING
Title: The Problem of Pain
Author: C.S. Lewis
Links to Books:

https://www.amazon.com/Problem-Pain-C-S-Lewis/dp/0060652969
https://www.barnesandnoble.com/w/the-problem-of-pain-c-s-lewis/1100421588
https://www.christianbook.com/problem-pain-s-lewis/s-lewis/9780060652968


Category: CHRISTIAN LIVING
Title: Mere Christianity
Author: C.S. Lewis
Links to Books:

https://www.amazon.com/Mere-Christianity-C-S-Lewis/dp/0060652926`}
        </pre>
      </div>

      <div className="space-y-4">
        <div>
          <label className="admin-label">Upload Text File (.txt)</label>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            disabled={importing}
            className="admin-input"
          />
        </div>

        <div>
          <label className="admin-label">Or Paste Text Here</label>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={10}
            className="admin-input resize-none"
            placeholder="Paste your book recommendations here using the format shown above..."
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleBulkImport}
            disabled={importing || !importText.trim()}
            className="admin-btn-primary"
          >
            <SafeIcon icon={FiUpload} className="h-4 w-4" />
            <span>{importing ? 'Importing...' : 'Import All'}</span>
          </button>
          <button
            onClick={() => { setImportText(''); onCancel(); }}
            className="admin-btn-secondary"
          >
            <SafeIcon icon={FiX} className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceBulkImport;
