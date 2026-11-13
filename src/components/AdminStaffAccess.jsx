import React, { useState } from 'react';
import { FiUserPlus, FiTrash2, FiMail, FiShield } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { SkeletonTable, LoadingTransition } from './LoadingSkeletons';
import { useSupabaseCrud } from '../hooks/useSupabaseCrud';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import supabase from '../lib/supabase';

const ADMIN_EMAIL = 'chris@urfellowship.com';

// Admin-only screen for inviting other staff to log into /admin and
// seeing/revoking who already has access. Every invited person is a
// "staff" role, limited in the nav/content switch (see Admin.jsx's
// STAFF_ALLOWED_TABS) to a fixed subset of sections - there's no UI here
// to grant anyone else the admin role, on purpose: that's a one-person,
// hardcoded identity (see the staff_users_portal123 migration), not
// something this screen hands out.
const AdminStaffAccess = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { items: staffUsers, loading, fetchItems, deleteItem } = useSupabaseCrud(
    'staff_users_portal123',
    { orderBy: 'created_at', ascending: true }
  );
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('invite-staff', {
        body: {
          email: cleanEmail,
          // Plain origin - see the comment on emailRedirectTo in Admin.jsx's
          // handleEmailSubmit for why this can't include a `#/admin` hash.
          redirectTo: window.location.origin,
        },
      });
      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Could not send the invite.');
      }
      toast.success(`Invited ${cleanEmail}.`);
      setEmail('');
      await fetchItems();
    } catch (err) {
      console.error('Error inviting staff:', err);
      toast.error(err.message || 'Could not send the invite. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (staffUser) => {
    if (!(await confirm(`Revoke admin access for ${staffUser.email}? They'll no longer be able to log in.`))) return;
    try {
      await deleteItem(staffUser.id);
      toast.success('Access revoked.');
    } catch (err) {
      console.error('Error revoking staff access:', err);
      toast.error('Could not revoke access. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Staff Access</h2>
        <p className="text-sm text-neutral-500">
          Invite someone to log into the admin dashboard. They'll get the restricted set of
          sections (Dashboard, Submissions, Rentals, Calendar, The Happenings, Stage Script,
          Monthly Flyer, Slide Maker, Sign-up Sheets) - everything else here stays admin-only.
        </p>
      </div>

      <form onSubmit={handleInvite} className="bg-white rounded-2xl shadow-modern p-5 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          className="admin-input flex-1"
        />
        <button
          type="submit"
          disabled={inviting}
          className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          <SafeIcon icon={FiUserPlus} className="h-4 w-4" />
          {inviting ? 'Sending...' : 'Invite'}
        </button>
      </form>

      <LoadingTransition isLoading={loading} skeleton={<SkeletonTable rows={3} columns={2} />}>
        <div className="bg-white rounded-2xl shadow-modern overflow-hidden">
          {staffUsers.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-10">No one's been invited yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {staffUsers.map((su) => (
                <li key={su.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <SafeIcon icon={su.role === 'admin' ? FiShield : FiMail} className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-neutral-900 truncate">{su.email}</div>
                      <div className="text-xs text-neutral-500 capitalize">{su.role}</div>
                    </div>
                  </div>
                  {su.email.toLowerCase() !== ADMIN_EMAIL && (
                    <button
                      onClick={() => handleRevoke(su)}
                      title="Revoke access"
                      className="flex-shrink-0 p-2 text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </LoadingTransition>
    </div>
  );
};

export default AdminStaffAccess;
