import React from 'react';
import { motion } from 'framer-motion';

// A warmer, more distinctive loading indicator than a plain spinning
// ring: three dots breathing in sequence, in the site's primary green.
// Drop-in replacement for the old `animate-spin` circle wherever it
// appeared - sizes roughly line up with the old h-12/h-8/h-5 usages.
const SIZES = {
  sm: { dot: 6, gap: 5 },
  md: { dot: 9, gap: 7 },
  lg: { dot: 13, gap: 9 },
};

export const LoadingSpinner = ({ size = 'md', color = '#83A682', className = '' }) => {
  const { dot, gap } = SIZES[size] || SIZES.md;
  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ gap }}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          style={{
            display: 'block',
            width: dot,
            height: dot,
            borderRadius: '50%',
            background: color,
          }}
          animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
