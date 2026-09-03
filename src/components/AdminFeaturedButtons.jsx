import React,{useState} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {SkeletonTable,SkeletonForm,LoadingTransition} from './LoadingSkeletons';
import { toTitleCase } from '../utils/textFormat';
import { useSupabaseCrud } from '../hooks/useSupabaseCrud';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';

const {FiPlus,FiEdit,FiTrash2,FiSave,FiX,FiToggleLeft,FiToggleRight}=FiIcons;

const AdminFeaturedButtons=()=> {
  const toast=useToast();
  const confirm=useConfirm();
  const {items: buttons,loading,insertItem,updateItem,deleteItem}=useSupabaseCrud(
    'featured_buttons_portal123',
    {orderBy: 'display_order',ascending: true}
  );
  const [saving,setSaving]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [formData,setFormData]=useState({
    title: '',
    description: '',
    path: '',
    is_active: false
  });

  const handleSubmit=async (e)=> {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const buttonData={
          title: toTitleCase(formData.title),
          description: formData.description,
          path: formData.path,
          icon_name: 'FiCheck',
          is_active: formData.is_active
        };
        await updateItem(editingId,buttonData);
      } else {
        const autoType=formData.title.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
        const nextOrder=buttons.length + 1;
        const buttonData={
          button_type: autoType,
          title: toTitleCase(formData.title),
          description: formData.description,
          path: formData.path,
          icon_name: 'FiCheck',
          display_order: nextOrder,
          is_active: formData.is_active
        };
        await insertItem(buttonData);
      }
      handleCancel();
    } catch (error) {
      console.error('Error saving button:',error);
      toast.error('Error saving button. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit=(button)=> {
    setFormData({
      title: button.title,
      description: button.description || '',
      path: button.path,
      is_active: button.is_active
    });
    setEditingId(button.id);
    setShowForm(true);
  };

  const handleDelete=async (id)=> {
    if (!(await confirm('Are you sure you want to delete this featured button?'))) return;
    try {
      await deleteItem(id);
    } catch (error) {
      console.error('Error deleting button:',error);
      toast.error('Error deleting button. Please try again.');
    }
  };

  const handleToggleActive=async (button)=> {
    try {
      await updateItem(button.id,{is_active: !button.is_active});
    } catch (error) {
      console.error('Error toggling button:',error);
      toast.error('Error updating button status. Please try again.');
    }
  };

  const handleCancel=()=> {
    setFormData({
      title: '',
      description: '',
      path: '',
      is_active: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-text-primary">Manage Featured Buttons</h2>
        <button
          onClick={()=> setShowForm(true)}
          className="admin-btn-primary"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          <span>New Button</span>
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
              <div>
                <label className="admin-label">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e)=> setFormData({...formData,title: e.target.value})}
                  required
                  className="admin-input"
                  placeholder="Volunteer Sign-up"
                />
              </div>
              <div>
                <label className="admin-label">Description <span className="text-text-light font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e)=> setFormData({...formData,description: e.target.value})}
                  className="admin-input"
                  placeholder="Monthly service commitment"
                />
              </div>
              <div>
                <label className="admin-label">Link *</label>
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e)=> setFormData({...formData,path: e.target.value})}
                  required
                  className="admin-input"
                  placeholder="/table-group-signup or https://example.com"
                />
                <p className="text-xs text-text-light mt-1">Use a path like /page-name for internal pages, or a full URL for external links</p>
              </div>
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e)=> setFormData({...formData,is_active: e.target.checked})}
                    className="w-4 h-4 text-primary focus:ring-primary border-accent-dark rounded"
                  />
                  <span className="text-sm font-medium text-text-primary">Active (show on homepage)</span>
                </label>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn-primary"
                >
                  <SafeIcon icon={FiSave} className="h-4 w-4" />
                  <span>{editingId ? 'Update' : 'Create'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="admin-btn-secondary"
                >
                  <SafeIcon icon={FiX} className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </motion.div>
        </LoadingTransition>
      )}

      <LoadingTransition isLoading={loading && !showForm} skeleton={<SkeletonTable rows={3} columns={3} />}>
        <div className="bg-white rounded-2xl shadow-modern overflow-hidden">
          {buttons.length===0 ? (
            <div className="p-8 text-center">
              <p className="text-text-primary">No featured buttons yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-accent">
              {buttons.map((button)=> (
                <div key={button.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg text-text-primary">{button.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${button.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {button.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {button.description && <p className="text-sm text-text-light mb-2">{button.description}</p>}
                      <div className="text-xs text-text-light">
                        <div><strong>Link:</strong> {button.path}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={()=> handleToggleActive(button)}
                        className={`p-2 rounded-lg transition-colors ${button.is_active ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={button.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <SafeIcon icon={button.is_active ? FiToggleRight : FiToggleLeft} className="h-5 w-5" />
                      </button>
                      <button
                        onClick={()=> handleEdit(button)}
                        className="admin-btn-edit"
                      >
                        <SafeIcon icon={FiEdit} className="h-4 w-4" />
                      </button>
                      <button
                        onClick={()=> handleDelete(button.id)}
                        className="admin-btn-danger"
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
      </LoadingTransition>
    </div>
  );
};

export default AdminFeaturedButtons;
