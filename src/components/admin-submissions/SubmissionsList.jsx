import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { formatDate } from '../../utils/dateFormat';
import { useSupabaseCrud } from '../../hooks/useSupabaseCrud';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import { SkeletonBox, LoadingTransition } from '../LoadingSkeletons';

const { FiArchive, FiRotateCcw, FiTrash2, FiInbox } = FiIcons;

// The real list is a stacked column of detail rows, not a table -
// SkeletonTable's grid-with-header shape had no visual relationship to it.
const SubmissionsSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-modern overflow-hidden divide-y divide-accent">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <SkeletonBox width="w-1/2" height="h-4" className="bg-gray-300" />
            <SkeletonBox width="w-3/4" height="h-4" />
            <SkeletonBox width="w-24" height="h-3" />
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <SkeletonBox width="w-8" height="h-8" rounded="rounded-lg" />
            <SkeletonBox width="w-8" height="h-8" rounded="rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Generic read/archive/delete list shared by every submission type - each
// caller just supplies the table name and how to render one row's detail;
// the fetch/archive/delete plumbing (and the unarchived-count badge) is
// identical across all four forms.
const SubmissionsList = ({ table, emptyLabel, renderDetail }) => {
  const toast = useToast();
  const confirm = useConfirm();
  const { items, loading, updateItem, deleteItem } = useSupabaseCrud(table, {
    orderBy: 'created_at',
    ascending: false
  });
  const [showArchived, setShowArchived] = useState(false);

  const unarchivedCount = items.filter((i) => !i.archived).length;
  const visible = items.filter((i) => (showArchived ? true : !i.archived));

  const toggleArchive = async (item) => {
    try {
      await updateItem(item.id, { archived: !item.archived });
    } catch (err) {
      console.error('Error updating submission:', err);
      toast.error('Failed to update: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Delete this submission permanently? This cannot be undone.'))) return;
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Error deleting submission:', err);
      toast.error('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-light font-inter">
          {unarchivedCount} new{items.length !== unarchivedCount ? ` · ${items.length - unarchivedCount} archived` : ''}
        </span>
        <label className="flex items-center space-x-2 text-sm text-text-light font-inter cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="w-4 h-4 text-primary focus:ring-primary border-accent-dark rounded"
          />
          <span>Show archived</span>
        </label>
      </div>

      <LoadingTransition isLoading={loading} skeleton={<SubmissionsSkeleton />}>
        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-modern p-12 text-center">
            <SafeIcon icon={FiInbox} className="h-10 w-10 text-text-light mx-auto mb-3" />
            <p className="text-text-light font-inter">{emptyLabel}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-modern overflow-hidden divide-y divide-accent">
            {visible.map((item) => (
              <div key={item.id} className={`p-6 ${item.archived ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {renderDetail(item)}
                    <p className="text-xs text-text-light mt-2 font-inter">
                      {formatDate(item.created_at, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={() => toggleArchive(item)}
                      className="admin-btn-edit"
                      title={item.archived ? 'Unarchive' : 'Archive'}
                    >
                      <SafeIcon icon={item.archived ? FiRotateCcw : FiArchive} className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="admin-btn-danger" title="Delete">
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </LoadingTransition>
    </div>
  );
};

export default SubmissionsList;
