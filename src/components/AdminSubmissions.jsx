import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import SubmissionsList from './admin-submissions/SubmissionsList';

const { FiMail, FiUserPlus, FiUsers } = FiIcons;

const tabs = [
  { id: 'contact', label: 'Contact', icon: FiMail },
  { id: 'realm', label: 'Join Realm', icon: FiUserPlus },
  { id: 'table-groups', label: 'Table Groups', icon: FiUsers },
];

const AdminSubmissions = () => {
  const [activeTab, setActiveTab] = useState('contact');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl text-text-primary">Form Submissions</h2>

      <div className="flex flex-wrap gap-1 border-b border-accent">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-text-light hover:text-text-primary'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SafeIcon icon={tab.icon} className="h-4 w-4" />
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {activeTab === 'contact' && (
        <SubmissionsList
          table="contact_messages_portal123"
          emptyLabel="No contact messages yet."
          renderDetail={(item) => (
            <>
              <div className="flex items-center space-x-3 mb-1 flex-wrap">
                <h3 className="font-semibold text-text-primary">{item.name}</h3>
                <a href={`mailto:${item.email}`} className="text-sm text-primary hover:underline">{item.email}</a>
                {item.phone && <span className="text-sm text-text-light">{item.phone}</span>}
              </div>
              {item.subject && <p className="text-sm font-medium text-text-primary mb-1">{item.subject}</p>}
              <p className="text-sm text-text-primary whitespace-pre-wrap">{item.message}</p>
            </>
          )}
        />
      )}

      {activeTab === 'realm' && (
        <SubmissionsList
          table="realm_signups_portal123"
          emptyLabel="No Join Realm signups yet."
          renderDetail={(item) => (
            <>
              <div className="flex items-center space-x-3 mb-1 flex-wrap">
                <h3 className="font-semibold text-text-primary">{item.first_name} {item.last_name}</h3>
                <a href={`mailto:${item.email}`} className="text-sm text-primary hover:underline">{item.email}</a>
                {item.phone && <span className="text-sm text-text-light">{item.phone}</span>}
              </div>
              {(item.address_line1 || item.city) && (
                <p className="text-sm text-text-light">
                  {[item.address_line1, item.address_line2, [item.city, item.state, item.zip_code].filter(Boolean).join(', '), item.country]
                    .filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-sm text-text-light">
                {item.marital_status && <span className="capitalize">{item.marital_status}</span>}
                {item.birthday && <span> · Birthday: {item.birthday}</span>}
                {item.anniversary && <span> · Anniversary: {item.anniversary}</span>}
              </p>
            </>
          )}
        />
      )}

      {activeTab === 'table-groups' && (
        <SubmissionsList
          table="table_group_signups_portal123"
          emptyLabel="No table group signups yet."
          renderDetail={(item) => (
            <>
              <div className="flex items-center space-x-3 mb-1 flex-wrap">
                <h3 className="font-semibold text-text-primary">{item.first_name} {item.last_name}</h3>
                <a href={`mailto:${item.email}`} className="text-sm text-primary hover:underline">{item.email}</a>
              </div>
              <p className="text-sm text-text-light">
                Party size: {item.party_size || 'Not specified'}
                {item.unavailable_days?.length > 0 && ` · Unavailable: ${item.unavailable_days.join(', ')}`}
              </p>
            </>
          )}
        />
      )}
    </div>
  );
};

export default AdminSubmissions;
