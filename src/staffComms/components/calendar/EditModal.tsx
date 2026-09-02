import { useState } from 'react';
import { C, font } from '../../lib/theme';
import { AnnouncementForm } from '../manage/AnnouncementForm';
import type { Announcement } from '../../types';

interface EditModalProps {
  announcement: Announcement | null;
  defaultDate: string | null;
  onSave: (a: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
  onError: (msg: string) => void;
}

export function EditModal({ announcement, defaultDate, onSave, onDelete, onCancel, onError }: EditModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(30, 28, 25, 0.45)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 16px',
        overflowY: 'auto',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 680,
        borderRadius: 12,
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        {onDelete && announcement && (
          <div style={{
            background: C.stageBg,
            padding: '10px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontFamily: font.body, fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Editing from Calendar
            </span>
            {confirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: font.body, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Permanently delete?</span>
                <button
                  onClick={onDelete}
                  style={{
                    padding: '4px 12px', border: '1px solid rgba(224,112,96,0.5)', borderRadius: 5,
                    background: 'rgba(224,112,96,0.15)', color: '#E07060', fontSize: 11, fontFamily: font.body,
                    cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    padding: '4px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5,
                    background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: font.body,
                    cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  padding: '4px 12px', border: '1px solid rgba(191,90,58,0.5)', borderRadius: 5,
                  background: 'transparent', color: '#E07060', fontSize: 11, fontFamily: font.body,
                  cursor: 'pointer', fontWeight: 500,
                }}
              >
                Delete Announcement
              </button>
            )}
          </div>
        )}
        <AnnouncementForm
          announcement={announcement}
          initialOverrides={announcement ? undefined : (defaultDate ? { event_date: defaultDate, happenings_start_date: defaultDate } : undefined)}
          onSave={onSave}
          onCancel={onCancel}
          onError={onError}
        />
      </div>
    </div>
  );
}
