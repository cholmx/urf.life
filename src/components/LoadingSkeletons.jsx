import React from 'react';
import {motion} from 'framer-motion';

// Base skeleton animation
const shimmer = {
  animate: {
    x: ['-100%', '100%'],
  },
  transition: {
    repeat: Infinity,
    duration: 1.5,
    ease: 'linear',
  },
};

// Generic skeleton component
export const SkeletonBox = ({ width = 'w-full', height = 'h-4', className = '', rounded = 'rounded' }) => (
  <div className={`${width} ${height} ${rounded} ${className} bg-gray-200 relative overflow-hidden`}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
      {...shimmer}
    />
  </div>
);

// Button skeleton
export const SkeletonButton = ({ size = 'medium' }) => {
  const sizes = {
    small: 'w-20 h-8',
    medium: 'w-32 h-10',
    large: 'w-40 h-12',
    full: 'w-full h-12',
  };
  
  return (
    <SkeletonBox
      width={sizes[size].split(' ')[0]}
      height={sizes[size].split(' ')[1]}
      rounded="rounded-lg"
      className="bg-gray-300"
    />
  );
};

// Card skeleton for announcements, sermons, etc.
export const SkeletonCard = ({ showImage = false, showMeta = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow-md p-6 space-y-4"
  >
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <SkeletonBox width="w-3/4" height="h-6" className="bg-gray-300" />
        {showMeta && (
          <div className="flex items-center space-x-4">
            <SkeletonBox width="w-20" height="h-4" />
            <SkeletonBox width="w-24" height="h-4" />
          </div>
        )}
      </div>
      <SkeletonBox width="w-8" height="h-8" rounded="rounded-full" />
    </div>

    {/* Image */}
    {showImage && (
      <SkeletonBox width="w-full" height="h-48" rounded="rounded-lg" />
    )}

    {/* Content */}
    <div className="space-y-2">
      <SkeletonBox width="w-full" height="h-4" />
      <SkeletonBox width="w-5/6" height="h-4" />
      <SkeletonBox width="w-4/6" height="h-4" />
    </div>

    {/* Actions */}
    <div className="flex space-x-2 pt-2">
      <SkeletonButton size="small" />
      <SkeletonButton size="small" />
    </div>
  </motion.div>
);

// Episode/Podcast skeleton
export const SkeletonEpisode = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow-md p-6"
  >
    <div className="flex items-start space-x-4">
      {/* Episode image */}
      <SkeletonBox width="w-16" height="h-16" rounded="rounded-lg" className="flex-shrink-0" />
      
      <div className="flex-1 space-y-3">
        {/* Title and play button */}
        <div className="flex items-start justify-between">
          <SkeletonBox width="w-2/3" height="h-5" className="bg-gray-300" />
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-full" className="bg-gray-300" />
        </div>
        
        {/* Meta info */}
        <div className="flex items-center space-x-4">
          <SkeletonBox width="w-20" height="h-3" />
          <SkeletonBox width="w-16" height="h-3" />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <SkeletonBox width="w-full" height="h-4" />
          <SkeletonBox width="w-3/4" height="h-4" />
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-3">
          <SkeletonButton size="medium" />
          <SkeletonButton size="medium" />
        </div>
      </div>
    </div>
  </motion.div>
);

// Resource/Book skeleton
export const SkeletonBookCard = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-lg shadow-md overflow-hidden h-full"
  >
    {/* Book cover */}
    <div className="relative w-full h-48 p-2" style={{ backgroundColor: '#fcfbf7' }}>
      <SkeletonBox width="w-full" height="h-full" rounded="rounded" />
    </div>
    
    {/* Book details */}
    <div className="p-3 space-y-2">
      <SkeletonBox width="w-full" height="h-4" className="bg-gray-300" />
      <SkeletonBox width="w-3/4" height="h-3" />
      <SkeletonBox width="w-1/2" height="h-3" />
    </div>
  </motion.div>
);

// Admin table skeleton
export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {/* Header */}
    <div className="border-b border-gray-200 p-4">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBox key={i} width="w-full" height="h-4" className="bg-gray-300" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rowIndex * 0.1 }}
          className="p-4"
        >
          <div className="grid grid-cols-4 gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBox
                key={colIndex}
                width={colIndex === 0 ? "w-3/4" : "w-full"}
                height="h-4"
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// Form skeleton
export const SkeletonForm = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow-md p-6 space-y-6"
  >
    {/* Form title */}
    <SkeletonBox width="w-1/3" height="h-6" className="bg-gray-300" />
    
    {/* Form fields */}
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBox width="w-24" height="h-4" />
          <SkeletonBox width="w-full" height="h-10" rounded="rounded-lg" />
        </div>
      ))}
      
      {/* Text area */}
      <div className="space-y-2">
        <SkeletonBox width="w-20" height="h-4" />
        <SkeletonBox width="w-full" height="h-24" rounded="rounded-lg" />
      </div>
    </div>
    
    {/* Action buttons */}
    <div className="flex space-x-3">
      <SkeletonButton size="medium" />
      <SkeletonButton size="medium" />
    </div>
  </motion.div>
);

// Navigation skeleton
export const SkeletonNav = () => (
  <div className="bg-white shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <SkeletonBox width="w-10" height="h-10" rounded="rounded-full" />
          <SkeletonBox width="w-32" height="h-5" />
        </div>
        
        {/* Nav items */}
        <div className="hidden md:flex items-center space-x-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBox key={i} width="w-16" height="h-4" />
          ))}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <SkeletonBox width="w-6" height="h-6" />
        </div>
      </div>
    </div>
  </div>
);

// Stats/Dashboard skeleton
export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="bg-white rounded-lg shadow-md p-6 text-center space-y-3"
      >
        <SkeletonBox width="w-16" height="h-16" rounded="rounded-full" className="mx-auto bg-gray-300" />
        <SkeletonBox width="w-12" height="h-8" className="mx-auto bg-gray-300" />
        <SkeletonBox width="w-24" height="h-4" className="mx-auto" />
      </motion.div>
    ))}
  </div>
);

// Grid skeleton (for home page buttons)
export const SkeletonGrid = ({ items = 6, columns = 3 }) => (
  <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-4`}>
    {Array.from({ length: items }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.05 }}
        className="bg-white rounded-lg shadow-md p-6 text-center space-y-3"
        style={{ width: '160px', height: '120px' }}
      >
        <SkeletonBox width="w-8" height="h-8" rounded="rounded-full" className="mx-auto bg-gray-300" />
        <SkeletonBox width="w-3/4" height="h-4" className="mx-auto bg-gray-300" />
        <SkeletonBox width="w-full" height="h-3" className="mx-auto" />
      </motion.div>
    ))}
  </div>
);

// Page loading skeleton
export const SkeletonPage = ({ title = true, content = true, sidebar = false }) => (
  <div className="min-h-screen bg-accent py-12">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      {title && (
        <div className="text-center mb-12 space-y-4">
          <SkeletonBox width="w-64" height="h-8" className="mx-auto bg-gray-300" />
          <SkeletonBox width="w-96" height="h-5" className="mx-auto" />
        </div>
      )}
      
      {/* Content */}
      {content && (
        <div className={sidebar ? "grid grid-cols-1 lg:grid-cols-4 gap-8" : ""}>
          {sidebar && (
            <div className="space-y-4">
              <SkeletonBox width="w-full" height="h-40" rounded="rounded-lg" />
              <SkeletonBox width="w-full" height="h-32" rounded="rounded-lg" />
            </div>
          )}
          
          <div className={sidebar ? "lg:col-span-3 space-y-6" : "space-y-6"}>
            <SkeletonCard showImage={true} />
            <SkeletonCard showImage={false} />
            <SkeletonCard showImage={true} />
          </div>
        </div>
      )}
    </div>
  </div>
);

// Loading overlay for transitions
export const LoadingOverlay = ({ message = "Loading..." }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-lg p-6 shadow-xl text-center space-y-4"
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="text-text-primary font-inter">{message}</p>
    </motion.div>
  </motion.div>
);

// Smooth loading transition wrapper
export const LoadingTransition = ({ isLoading, skeleton, children, delay = 0 }) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        {skeleton}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};