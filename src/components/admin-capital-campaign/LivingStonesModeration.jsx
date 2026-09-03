import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';
import { formatDate } from '../../utils/dateFormat';
import { useSupabaseCrud } from '../../hooks/useSupabaseCrud';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

const { FiCheck, FiTrash2, FiImage } = FiIcons;

// Approve/reject moderation for visitor-submitted "Living Stones" photos.
// Reports its pending count up to the parent (for the tab badge) via
// onPendingCountChange, called on every render of the fetched list.
const LivingStonesModeration = ({ onPendingCountChange }) => {
  const toast = useToast();
  const confirm = useConfirm();
  const { items: livingStones, loading, updateItem, deleteItem } = useSupabaseCrud(
    'living_stones_photos',
    { orderBy: 'created_at', ascending: false }
  );

  const pending = livingStones.filter((p) => !p.approved);
  const approved = livingStones.filter((p) => p.approved);

  React.useEffect(() => {
    onPendingCountChange(pending.length);
  }, [pending.length, onPendingCountChange]);

  const handleApprovePhoto = async (id) => {
    try {
      await updateItem(id, { approved: true, approved_at: new Date().toISOString() });
    } catch (err) {
      console.error('Error approving photo:', err);
      toast.error('Error approving photo. Please try again.');
    }
  };

  const handleDeletePhoto = async (id, photoUrl) => {
    if (!(await confirm('Are you sure you want to delete this photo? This cannot be undone.'))) return;
    try {
      const urlParts = photoUrl.split('/living-stones/');
      if (urlParts.length === 2) {
        await supabase.storage.from('living-stones').remove([urlParts[1]]);
      }
      await deleteItem(id);
    } catch (err) {
      console.error('Error deleting photo:', err);
      toast.error('Error deleting photo. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <span>Pending Review</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#E2BA49' }}>
              {pending.length}
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pending.map((photo) => (
              <div key={photo.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="aspect-square">
                  <img src={photo.photo_url} alt="Pending stone" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 space-y-1">
                  {photo.submitter_name && (
                    <p className="text-xs font-medium text-text-primary truncate">{photo.submitter_name}</p>
                  )}
                  {photo.caption && (
                    <p className="text-xs text-text-light line-clamp-2">{photo.caption}</p>
                  )}
                  <p className="text-xs text-text-light">{formatDate(photo.created_at, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => handleApprovePhoto(photo.id)}
                      className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#83A682' }}
                    >
                      <SafeIcon icon={FiCheck} className="h-3 w-3" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id, photo.photo_url)}
                      className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="h-3 w-3" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <SafeIcon icon={FiCheck} className="h-8 w-8 mx-auto mb-2" style={{ color: '#83A682' }} />
          <p className="text-sm font-medium" style={{ color: '#83A682' }}>All caught up! No photos pending review.</p>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Approved Photos ({approved.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {approved.map((photo) => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden shadow-sm aspect-square">
                <img src={photo.photo_url} alt="Approved stone" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDeletePhoto(photo.id, photo.photo_url)}
                    className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="h-4 w-4 text-white" />
                  </button>
                </div>
                {photo.submitter_name && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{photo.submitter_name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {livingStones.length === 0 && !loading && (
        <div className="text-center py-16">
          <SafeIcon icon={FiImage} className="h-12 w-12 text-text-light mx-auto mb-4" />
          <p className="text-xl text-text-primary mb-2">No photos submitted yet</p>
          <p className="text-text-light text-sm">Photos will appear here once congregation members submit them.</p>
        </div>
      )}
    </div>
  );
};

export default LivingStonesModeration;
