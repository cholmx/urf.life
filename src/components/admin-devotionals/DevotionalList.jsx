import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { formatDate } from '../../utils/dateFormat';

const { FiBookOpen, FiEdit, FiTrash2 } = FiIcons;

const DevotionalList = ({ devotionals, loading, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {loading ? (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-primary font-inter">Loading devotionals...</p>
      </div>
    ) : devotionals.length === 0 ? (
      <div className="p-8 text-center">
        <SafeIcon icon={FiBookOpen} className="h-16 w-16 text-text-light mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2 font-inter">No Devotionals Yet</h3>
        <p className="text-text-light font-inter">
          Create your first devotional or upload a file to get started!
        </p>
      </div>
    ) : (
      <div className="divide-y divide-accent">
        {devotionals.map((devotional) => (
          <div key={devotional.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary font-inter">
                    {devotional.title}
                  </h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white font-inter">
                    {formatDate(devotional.devotional_date)}
                  </span>
                </div>

                {devotional.subtitle && (
                  <p className="text-primary font-medium mb-2 font-inter">
                    {devotional.subtitle}
                  </p>
                )}

                {devotional.scripture_reference && (
                  <p className="text-sm text-text-light mb-2 font-inter italic">
                    {devotional.scripture_reference}
                  </p>
                )}

                <div className="text-text-primary text-sm mb-2 font-inter">
                  {devotional.content.substring(0, 150)}...
                </div>

                <div className="flex items-center space-x-4 text-xs text-text-light">
                  {devotional.response && <span>✓ Response</span>}
                  {devotional.prayer && <span>✓ Prayer</span>}
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEdit(devotional)}
                  className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiEdit} className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(devotional.id)}
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
);

export default DevotionalList;
