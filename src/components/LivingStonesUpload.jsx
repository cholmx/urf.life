import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiUpload, FiX, FiCamera, FiCheck, FiImage } = FiIcons;

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 0.82;

const resizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
        resolve(file);
        return;
      }

      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas to blob conversion failed'));
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

const LivingStonesUpload = () => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitterName, setSubmitterName] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File is too large. Please choose an image under 20MB.');
      return;
    }

    setError('');
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setSelectedFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const clearSelection = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a photo to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const resized = await resizeImage(selectedFile);
      const ext = resized.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('living-stones')
        .upload(filename, resized, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('living-stones')
        .getPublicUrl(filename);

      const { error: insertError } = await supabase
        .from('living_stones_photos')
        .insert([{
          photo_url: urlData.publicUrl,
          submitter_name: submitterName.trim() || null,
          caption: caption.trim() || null,
          approved: false
        }]);

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Something went wrong uploading your photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    clearSelection();
    setSubmitterName('');
    setCaption('');
    setSubmitted(false);
    setError('');
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-md p-10 text-center"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-5" style={{ backgroundColor: '#e8f0e8' }}>
          <SafeIcon icon={FiCheck} className="h-8 w-8" style={{ color: '#83A682' }} />
        </div>
        <h3 className="text-2xl mb-2" style={{ color: '#83A682' }}>Photo Submitted!</h3>
        <p className="text-text-light mb-6 leading-relaxed">
          Thank you for sharing your Living Stone. Your photo will appear in the gallery after it has been reviewed.
        </p>
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#83A682' }}
        >
          Submit Another Photo
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <SafeIcon icon={FiCamera} className="h-6 w-6" style={{ color: '#83A682' }} />
        <h3 className="text-xl font-semibold text-text-primary">Share Your Living Stone</h3>
      </div>
      <p className="text-text-light mb-6 leading-relaxed">
        Did you paint a stone? We'd love to see it! Upload a photo and it will appear in the gallery after a quick review.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                dragOver ? 'border-opacity-100 bg-green-50' : 'hover:border-opacity-60'
              }`}
              style={{ borderColor: dragOver ? '#83A682' : '#c9d9c9' }}
            >
              <SafeIcon icon={FiImage} className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-text-primary mb-1">Click to choose a photo</p>
              <p className="text-sm text-text-light">or drag and drop here</p>
              <p className="text-xs text-text-light mt-2">JPG, PNG, or WebP — up to 20MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-80 object-contain"
              />
              <button
                type="button"
                onClick={clearSelection}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <SafeIcon icon={FiX} className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Your Name <span className="text-text-light font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            placeholder="e.g. Jane Smith"
            maxLength={100}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
            style={{ '--tw-ring-color': '#83A682' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Caption <span className="text-text-light font-normal">(optional)</span>
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tell us about your stone..."
            maxLength={300}
            rows={2}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all resize-none"
            style={{ '--tw-ring-color': '#83A682' }}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="w-full py-3 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:opacity-90"
          style={{ backgroundColor: '#83A682' }}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiUpload} className="h-4 w-4" />
              <span>Submit Photo</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LivingStonesUpload;
