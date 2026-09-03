import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiEdit, FiTrash2, FiBookOpen, FiTag } = FiIcons;

// Longer, period-inclusive variants must come before their shorter
// no-period counterparts: String.replace only removes the first literal
// match, so checking the no-period form first left a stray "." behind
// whenever the noise phrase in the source text actually ended in one.
const DESCRIPTION_NOISE = [
  'Available from multiple sources.',
  'Available from multiple sources',
  'available from multiple sources.',
  'available from multiple sources',
  'AVAILABLE FROM MULTIPLE SOURCES.',
  'AVAILABLE FROM MULTIPLE SOURCES'
];

// Strips leftover "Available from multiple sources" boilerplate that used
// to get pasted into descriptions before the bulk-import format changed.
export const getCleanDescription = (description) => {
  if (!description) return '';
  let cleanDescription = description.trim();
  DESCRIPTION_NOISE.forEach(text => {
    cleanDescription = cleanDescription.replace(text, '').trim();
  });
  if (!cleanDescription || cleanDescription.match(/^[.,!?;:\s]*$/)) return '';
  return cleanDescription;
};

export const getWebsiteName = (url) => {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.includes('amazon')) return 'Amazon';
    if (domain.includes('barnesandnoble')) return 'Barnes & Noble';
    if (domain.includes('christianbook')) return 'Christian Book';
    if (domain.includes('goodreads')) return 'Goodreads';
    if (domain.includes('bookdepository')) return 'Book Depository';
    if (domain.includes('target')) return 'Target';
    if (domain.includes('walmart')) return 'Walmart';
    return 'Website';
  } catch {
    return 'Website';
  }
};

const ResourceList = ({ resources, categories, loading, onEdit, onDelete }) => {
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getCategoryType = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? (category.is_link_group ? 'Link Group' : 'Book Category') : 'Book Category';
  };

  return (
    <div className="bg-white rounded-2xl shadow-modern overflow-hidden">
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary font-inter">Loading...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="p-8 text-center">
          <SafeIcon icon={FiBookOpen} className="h-12 w-12 text-text-light mx-auto mb-4" />
          <p className="text-text-primary font-inter">No resources yet. Create your first resource above!</p>
        </div>
      ) : (
        <div className="divide-y divide-accent">
          {resources.map((resource) => {
            const links = resource.amazon_link.split('\n').filter(link => link.trim());
            const cleanDescription = getCleanDescription(resource.description);

            return (
              <div key={resource.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary font-inter">
                        {resource.title}
                      </h3>
                      {resource.category_id && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white font-inter">
                          <SafeIcon icon={FiTag} className="h-3 w-3 mr-1" />
                          {getCategoryName(resource.category_id)}
                        </span>
                      )}
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          categories.find(c => c.id === resource.category_id)?.is_link_group
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        } font-inter`}
                      >
                        {getCategoryType(resource.category_id)}
                      </span>
                    </div>

                    {resource.author && (
                      <p className="text-sm text-text-light font-inter mb-2">
                        by {resource.author}
                      </p>
                    )}

                    {cleanDescription && (
                      <p className="text-text-primary font-inter text-sm mb-3">
                        {cleanDescription}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#83A682] hover:bg-[#6d8a6b] text-white px-2 py-1 rounded text-xs font-medium transition-colors font-inter"
                        >
                          {getWebsiteName(link)}
                        </a>
                      ))}
                    </div>

                    {resource.image_url && (
                      <span className="text-green-600 text-sm font-inter">
                        ✓ Has image
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button onClick={() => onEdit(resource)} className="admin-btn-edit">
                      <SafeIcon icon={FiEdit} className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(resource.id)} className="admin-btn-danger">
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResourceList;
