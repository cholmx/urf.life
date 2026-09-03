import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiAlertTriangle } = FiIcons;

const ConfirmContext = createContext(null);

// Replaces window.confirm() with an async, awaitable modal:
//   const confirm = useConfirm();
//   if (!(await confirm('Delete this?'))) return;
// Mounted once at the app root (see App.jsx).
export const ConfirmProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((msg) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setMessage(msg);
    });
  }, []);

  const resolve = (result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setMessage(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {message !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center px-4"
            onClick={() => resolve(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-modern-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-6">
                <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-text-primary font-inter">{message}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => resolve(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button onClick={() => resolve(true)} className="admin-btn-danger">
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
};
