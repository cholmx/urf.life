import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiX, FiChevronLeft, FiChevronRight, FiUser, FiMessageSquare, FiCamera } = FiIcons;

const LivingStonesGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('living_stones_photos')
        .select('id, photo_url, submitter_name, caption, created_at')
        .eq('approved', true)
        .order('approved_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error fetching living stones photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  }, [photos.length]);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, prevPhoto, nextPhoto]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <SafeIcon icon={FiCamera} className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-xl text-text-primary mb-2">No photos yet</p>
        <p className="text-text-light">Be the first to share your Living Stone!</p>
      </div>
    );
  }

  const activePhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <motion.button
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            onClick={() => openLightbox(index)}
            className="relative group aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow focus:outline-none"
          >
            <img
              src={photo.photo_url}
              alt={photo.caption || 'Living stone'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {(photo.submitter_name || photo.caption) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                <div className="text-left">
                  {photo.submitter_name && (
                    <p className="text-white text-xs font-medium truncate">{photo.submitter_name}</p>
                  )}
                  {photo.caption && (
                    <p className="text-white/80 text-xs truncate">{photo.caption}</p>
                  )}
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full rounded-2xl overflow-hidden bg-white shadow-2xl"
            >
              <button
                onClick={closeLightbox}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow transition-colors"
              >
                <SafeIcon icon={FiX} className="h-5 w-5 text-gray-700" />
              </button>

              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow transition-colors"
                  >
                    <SafeIcon icon={FiChevronLeft} className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-14 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow transition-colors"
                  >
                    <SafeIcon icon={FiChevronRight} className="h-5 w-5 text-gray-700" />
                  </button>
                </>
              )}

              <img
                src={activePhoto.photo_url}
                alt={activePhoto.caption || 'Living stone'}
                className="w-full max-h-[75vh] object-contain bg-gray-50"
              />

              {(activePhoto.submitter_name || activePhoto.caption) && (
                <div className="p-5 space-y-2">
                  {activePhoto.submitter_name && (
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiUser} className="h-4 w-4 text-text-light flex-shrink-0" />
                      <span className="text-sm font-medium text-text-primary">{activePhoto.submitter_name}</span>
                    </div>
                  )}
                  {activePhoto.caption && (
                    <div className="flex items-start space-x-2">
                      <SafeIcon icon={FiMessageSquare} className="h-4 w-4 text-text-light flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-text-light leading-relaxed">{activePhoto.caption}</p>
                    </div>
                  )}
                </div>
              )}

              {photos.length > 1 && (
                <div className="pb-4 text-center text-xs text-text-light">
                  {lightboxIndex + 1} of {photos.length}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LivingStonesGallery;
