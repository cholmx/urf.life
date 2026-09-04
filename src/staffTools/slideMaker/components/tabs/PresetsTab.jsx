import React, {useState, useEffect} from 'react';
import {C, ui} from '../../constants/styles';
import {savePreset, getPresets, deletePreset} from '../../services/presetService';
import {useToast} from '../../hooks/useToast';
import ConfirmDialog from '../ConfirmDialog';

export default function PresetsTab({canvasRef, tmplId, data, brand, photos, activePhoto, accentPhoto, ov, blur, onLoadPreset}) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const fetchedPresets = await getPresets();
      setPresets(fetchedPresets);
    } catch (error) {
      toast.show('Could not load your presets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    setSaving(true);
    try {
      // activePhoto/accentPhoto are the raw canvas Image objects, not the
      // library records - look up each one's dbId by matching .img so the
      // preset can find the same photo again on load.
      const activePhotoRecord = (photos || []).find(p => p.img === activePhoto);
      const accentPhotoRecord = (photos || []).find(p => p.img === accentPhoto);
      const presetData = {
        tmplId, data, brand,
        photoId: activePhotoRecord?.dbId || null,
        accentPhotoId: accentPhotoRecord?.dbId || null,
        ov, blur,
      };
      const canvas = canvasRef?.current;
      await savePreset(presetName, presetDescription, presetData, canvas);
      setPresetName('');
      setPresetDescription('');
      setShowSaveDialog(false);
      await loadPresets();
      toast.show('Preset saved.', 'success');
    } catch (error) {
      toast.show('Could not save preset. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadPreset = (preset) => {
    if (onLoadPreset) onLoadPreset(preset.presetData);
    toast.show('Preset loaded.', 'success');
  };

  const handleDeletePreset = (preset) => {
    setConfirmDelete(preset);
  };

  const confirmDeletePreset = async () => {
    const preset = confirmDelete;
    setConfirmDelete(null);
    try {
      await deletePreset(preset.id, preset.thumbnailUrl);
      await loadPresets();
      toast.show('Preset deleted.', 'success');
    } catch (error) {
      toast.show('Could not delete preset. Please try again.', 'error');
    }
  };

  return (
    <div>
      <div style={{marginBottom: 16}}>
        <button
          onClick={() => setShowSaveDialog(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: C.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontFamily: ui.display,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'opacity 0.15s',
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          Save Current Design
        </button>
      </div>

      {showSaveDialog && (
        <div style={{marginBottom: 16, padding: 16, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8}}>
          <div style={{fontFamily: ui.display, fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
            Save as Preset
          </div>
          <input type="text" placeholder="Preset name (required)" value={presetName} onChange={(e) => setPresetName(e.target.value)} style={{width: '100%', padding: '10px 12px', marginBottom: 10, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: ui.body, fontSize: 13, color: C.text, outline: 'none', boxSizing: 'border-box'}} />
          <textarea placeholder="Description (optional)" value={presetDescription} onChange={(e) => setPresetDescription(e.target.value)} style={{width: '100%', padding: '10px 12px', marginBottom: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: ui.body, fontSize: 13, color: C.text, outline: 'none', resize: 'vertical', minHeight: 60, boxSizing: 'border-box'}} />
          <div style={{display: 'flex', gap: 8}}>
            <button onClick={handleSavePreset} disabled={!presetName.trim() || saving} style={{flex: 1, padding: '10px 16px', background: presetName.trim() ? C.accent : C.border, color: '#fff', border: 'none', borderRadius: 6, fontFamily: ui.display, fontSize: 12, fontWeight: 600, cursor: presetName.trim() && !saving ? 'pointer' : 'not-allowed', opacity: saving ? 0.6 : 1}}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => {setShowSaveDialog(false); setPresetName(''); setPresetDescription('');}} style={{flex: 1, padding: '10px 16px', background: C.cardAlt, color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: ui.display, fontSize: 12, fontWeight: 600, cursor: 'pointer'}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <p style={{fontFamily: ui.body, fontSize: 12, color: C.textTer, marginBottom: 12}}>
        Load a saved design preset with all your settings.
      </p>

      {loading ? (
        <div style={{textAlign: 'center', padding: 40, fontFamily: ui.body, fontSize: 13, color: C.textTer}}>
          Loading presets...
        </div>
      ) : presets.length === 0 ? (
        <div style={{textAlign: 'center', padding: 40, fontFamily: ui.body, fontSize: 13, color: C.textTer}}>
          No presets saved yet. Click "Save Current Design" to create your first preset!
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10}}>
          {presets.map(preset => (
            <div key={preset.id} onClick={() => handleLoadPreset(preset)} style={{cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: `2px solid ${C.border}`, transition: 'all 0.15s', position: 'relative'}} onMouseOver={(e) => {e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accentBg}`;}} onMouseOut={(e) => {e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none';}}>
              {preset.thumbnailUrl ? (
                <img src={preset.thumbnailUrl} alt={preset.name} style={{width: '100%', height: 100, objectFit: 'cover', display: 'block'}} />
              ) : (
                <div style={{width: '100%', height: 100, background: C.cardAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textTer, fontSize: 24}}>💾</div>
              )}
              <div style={{padding: 8, background: C.card}}>
                <div style={{fontFamily: ui.display, fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{preset.name}</div>
                {preset.description && (
                  <div style={{fontFamily: ui.body, fontSize: 9, color: C.textTer, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{preset.description}</div>
                )}
              </div>
              <button onClick={(e) => {e.stopPropagation(); handleDeletePreset(preset);}} style={{position: 'absolute', top: 4, right: 4, width: 24, height: 24, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, opacity: 0.8, transition: 'opacity 0.15s'}} onMouseOver={(e) => {e.stopPropagation(); e.currentTarget.style.opacity = '1';}} onMouseOut={(e) => {e.stopPropagation(); e.currentTarget.style.opacity = '0.8';}}>×</button>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete preset "${confirmDelete.name}"?`}
          confirmLabel="Delete"
          onConfirm={confirmDeletePreset}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
