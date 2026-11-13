import React, { useState } from 'react';
import { FiUserPlus, FiTrash2, FiMail, FiShield } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { SkeletonTable, LoadingTransition } from './LoadingSkeletons';
import { useSupabaseCrud } from '../hooks/useSupabaseCrud';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import supabase, { extractFunctionErrorMessage } from '../lib/supabase';

const ADMIN_EMAIL = 'chris@urfellowship.com';

// Admin-only screen for inviting people to log into /admin, promoting
// them between the "staff" (editor) and "admin" roles, and revoking
// access. Editors see the restricted set of sections in Admin.jsx's
// STAFF_ALLOWED_TABS; admins see everything.
const AdminStaffAccess = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { items: staffUsers, loading, fetchItems, updateItem, deleteItem } = useSupabaseCrud(
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
      if (error) {
        throw new Error(await extractFunctionErrorMessage(error, 'Could not send the invite.'));
      }
      if (data?.error) throw new Error(data.error);
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

  const handleRoleChange = async (staffUser) => {
    const nextRole = staffUser.role === 'admin' ? 'staff' : 'admin';
    const nextLabel = nextRole === 'admin' ? 'an admin' : 'an editor';
    if (!(await confirm(`Make ${staffUser.email} ${nextLabel}?`))) return;
    try {
      await updateItem(staffUser.id, { role: nextRole });
      toast.success(`${staffUser.email} is now ${nextLabel}.`);
    } catch (err) {
      console.error('Error changing staff role:', err);
      toast.error('Could not change the role. Please try again.');
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
                      <div className="text-xs text-neutral-500">{su.role === 'admin' ? 'Admin' : 'Editor'}</div>
                    </div>
                  </div>
                  {su.email.toLowerCase() !== ADMIN_EMAIL && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleRoleChange(su)}
                        className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        {su.role === 'admin' ? 'Make editor' : 'Make admin'}
                      </button>
                      <button
                        onClick={() => handleRevoke(su)}
                        title="Revoke access"
                        className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                      </button>
                    </div>
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
