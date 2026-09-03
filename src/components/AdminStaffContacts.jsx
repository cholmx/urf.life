import React,{useState} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {SkeletonTable,SkeletonForm,LoadingTransition} from './LoadingSkeletons';
import supabase from '../lib/supabase';
import { toTitleCase } from '../utils/textFormat';
import { useSupabaseCrud } from '../hooks/useSupabaseCrud';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';

const {FiPlus,FiEdit,FiTrash2,FiSave,FiX,FiChevronUp,FiChevronDown,FiUsers,FiMail}=FiIcons;

const AdminStaffContacts=()=> {
  const toast=useToast();
  const confirm=useConfirm();
  const {items: staffContacts,loading,fetchItems,insertItem,updateItem,deleteItem}=useSupabaseCrud(
    'staff_contacts_portal123',
    {orderBy: 'display_order',ascending: true}
  );
  const [saving,setSaving]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [formData,setFormData]=useState({
    name: '',
    title: '',
    email: '',
    is_active: true
  });

  const handleSubmit=async (e)=> {
    e.preventDefault();
    setSaving(true);
    try {
      const staffData={
        name: toTitleCase(formData.name),
        title: toTitleCase(formData.title),
        email: formData.email,
        is_active: formData.is_active,
        display_order: editingId ? undefined : staffContacts.length
      };

      if (editingId) {
        await updateItem(editingId,staffData);
      } else {
        await insertItem(staffData);
      }

      handleCancel();
    } catch (error) {
      console.error('Error saving staff contact:',error);
      toast.error(`Error saving staff contact: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit=(staff)=> {
    setFormData({
      name: staff.name,
      title: staff.title,
      email: staff.email,
      is_active: staff.is_active
    });
    setEditingId(staff.id);
    setShowForm(true);
  };

  const handleDelete=async (id)=> {
    if (!(await confirm('Are you sure you want to delete this staff contact?'))) return;
    try {
      await deleteItem(id);
    } catch (error) {
      console.error('Error deleting staff contact:',error);
      toast.error('Error deleting staff contact. Please try again.');
    }
  };

  const handleCancel=()=> {
    setFormData({
      name: '',
      title: '',
      email: '',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleMoveStaff=async (id,direction)=> {
    const index=staffContacts.findIndex(s=> s.id===id);
    const targetIndex=direction==='up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= staffContacts.length) return;

    try {
      const staff1=staffContacts[index];
      const staff2=staffContacts[targetIndex];

      await supabase
        .from('staff_contacts_portal123')
        .update({display_order: staff2.display_order})
        .eq('id',staff1.id);

      await supabase
        .from('staff_contacts_portal123')
        .update({display_order: staff1.display_order})
        .eq('id',staff2.id);

      fetchItems();
    } catch (error) {
      console.error('Error reordering staff contacts:',error);
      toast.error('Error reordering staff contacts. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-text-primary">Manage Staff Contacts</h2>
        <button
          onClick={()=> setShowForm(true)}
          className="admin-btn-primary"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          <span>New Staff Contact</span>
        </button>
      </div>

      {showForm && (
        <LoadingTransition isLoading={saving && editingId} skeleton={<SkeletonForm />}>
          <motion.div
            initial={{opacity: 0,y: 20}}
            animate={{opacity: 1,y: 0}}
            className="admin-card"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e)=> setFormData({...formData,name: e.target.value})}
                    required
                    className="admin-input"
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div>
                  <label className="admin-label">Job Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e)=> setFormData({...formData,title: e.target.value})}
                    required
                    className="admin-input"
                    placeholder="e.g., Administrative Pastor"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Email Address *</label>
                <div className="relative">
                  <SafeIcon icon={FiMail} className="absolute left-3 top-3 h-5 w-5 text-text-light" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e)=> setFormData({...formData,email: e.target.value})}
                    required
                    className="admin-input pl-10"
                    placeholder="staff@urfellowship.com"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e)=> setFormData({...formData,is_active: e.target.checked})}
                  className="w-4 h-4 text-primary focus:ring-primary border-accent-dark rounded"
                />
                <label htmlFor="is_active" className="text-sm text-text-primary">Active (visible on contact page)</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="admin-btn-secondary"
                >
                  <SafeIcon icon={FiX} className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn-primary"
                >
                  <SafeIcon icon={FiSave} className="h-4 w-4" />
                  <span>{editingId ? 'Update' : 'Create'} Staff Contact</span>
                </button>
              </div>
            </form>
          </motion.div>
        </LoadingTransition>
      )}

      <LoadingTransition isLoading={loading} skeleton={<SkeletonTable />}>
        <div className="bg-white rounded-2xl shadow-modern overflow-hidden">
          {staffContacts.length===0 ? (
            <div className="p-12 text-center">
              <SafeIcon icon={FiUsers} className="h-12 w-12 text-text-light mx-auto mb-3" />
              <p className="text-text-light">No staff contacts yet. Create your first one!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-accent">
                  {staffContacts.map((staff,index)=> (
                    <tr key={staff.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          <button
                            onClick={()=> handleMoveStaff(staff.id,'up')}
                            disabled={index===0}
                            className="p-1 text-text-light hover:text-text-primary disabled:opacity-30"
                            title="Move up"
                          >
                            <SafeIcon icon={FiChevronUp} className="h-4 w-4" />
                          </button>
                          <button
                            onClick={()=> handleMoveStaff(staff.id,'down')}
                            disabled={index===staffContacts.length - 1}
                            className="p-1 text-text-light hover:text-text-primary disabled:opacity-30"
                            title="Move down"
                          >
                            <SafeIcon icon={FiChevronDown} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-text-primary">{staff.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-primary">{staff.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`mailto:${staff.email}`}
                          className="text-sm text-primary hover:text-primary-dark inline-flex items-center space-x-1"
                        >
                          <SafeIcon icon={FiMail} className="h-3 w-3" />
                          <span>{staff.email}</span>
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          staff.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {staff.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={()=> handleEdit(staff)}
                          className="text-primary hover:text-primary-dark"
                        >
                          <SafeIcon icon={FiEdit} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={()=> handleDelete(staff.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </LoadingTransition>
    </div>
  );
};

export default AdminStaffContacts;
