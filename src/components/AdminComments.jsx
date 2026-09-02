import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useSupabaseCrud } from '../hooks/useSupabaseCrud';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';

const { FiMessageSquare, FiCheck, FiX, FiTrash2 } = FiIcons;

const AdminComments = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const {items: comments,loading,updateItem,deleteItem}=useSupabaseCrud(
    'campaign_comments',
    {orderBy: 'created_at',ascending: false}
  );
  const [replyText, setReplyText] = useState({});
  const [savingReply, setSavingReply] = useState({});

  const approveComment = async (commentId) => {
    try {
      await updateItem(commentId, { is_approved: true, approved_at: new Date().toISOString() });
    } catch (error) {
      console.error('Error approving comment:', error);
      toast.error('Failed to approve comment: ' + error.message);
    }
  };

  const unapproveComment = async (commentId) => {
    try {
      await updateItem(commentId, { is_approved: false, approved_at: null });
    } catch (error) {
      console.error('Error unapproving comment:', error);
      toast.error('Failed to unapprove comment: ' + error.message);
    }
  };

  const deleteComment = async (commentId) => {
    if (!(await confirm('Are you sure you want to delete this comment?'))) {
      return;
    }
    try {
      await deleteItem(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment: ' + error.message);
    }
  };

  const saveReply = async (commentId) => {
    const reply = replyText[commentId]?.trim();
    if (!reply) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      setSavingReply({ ...savingReply, [commentId]: true });
      await updateItem(commentId, { admin_reply: reply });
      setReplyText({ ...replyText, [commentId]: '' });
    } catch (error) {
      console.error('Error saving reply:', error);
      toast.error('Failed to save reply: ' + error.message);
    } finally {
      setSavingReply({ ...savingReply, [commentId]: false });
    }
  };

  const deleteReply = async (commentId) => {
    if (!(await confirm('Are you sure you want to delete this reply?'))) {
      return;
    }
    try {
      await updateItem(commentId, { admin_reply: null });
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <SafeIcon icon={FiMessageSquare} className="h-6 w-6 text-primary" />
          <span>Moderate Comments</span>
        </h2>
        <span className="text-sm text-text-light">
          {comments.filter(c => !c.is_approved).length} pending
        </span>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <SafeIcon icon={FiMessageSquare} className="h-16 w-16 text-text-light mx-auto mb-4" />
          <p className="text-xl">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                comment.is_approved ? 'border-green-500' : 'border-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{comment.author_name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      comment.is_approved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comment.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-text-light mb-2">{comment.author_email}</p>
                  <p className="text-xs text-text-light mb-3">{formatDate(comment.created_at)}</p>
                  <p className="text-text-primary">{comment.comment_text}</p>
                </div>

                <div className="flex space-x-2">
                  {comment.is_approved ? (
                    <button
                      onClick={() => unapproveComment(comment.id)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Unapprove"
                    >
                      <SafeIcon icon={FiX} className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => approveComment(comment.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <SafeIcon icon={FiCheck} className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Comment"
                  >
                    <SafeIcon icon={FiTrash2} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {comment.admin_reply && (
                <div className="mt-4 p-4 bg-neutral-50 rounded-lg border-l-4 border-neutral-400">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-2">Your Reply:</p>
                      <p className="text-text-primary">{comment.admin_reply}</p>
                    </div>
                    <button
                      onClick={() => deleteReply(comment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                      title="Delete Reply"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  {comment.admin_reply ? 'Update Reply:' : 'Add Reply:'}
                </label>
                <div className="flex space-x-2">
                  <textarea
                    value={replyText[comment.id] || comment.admin_reply || ''}
                    onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows="3"
                    placeholder="Type your reply here..."
                  />
                  <button
                    onClick={() => saveReply(comment.id)}
                    disabled={savingReply[comment.id]}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {savingReply[comment.id] ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComments;
