import React, {useState} from 'react';
import {C, ui} from '../../constants/styles';
import {BUILT_IN_BACKGROUND_COLORS} from '../../constants/data';
import {addBackgroundColor, updateBackgroundColor, deleteBackgroundColor, importBuiltInBackgroundColor} from '../../services/backgroundColorService';
import {useToast} from '../../hooks/useToast';
import ConfirmDialog from '../ConfirmDialog';

const ROLE_LABEL = {
  dark_bucket: 'Needed for dark photos',
  light_bucket: 'Needed for light photos',
};

// Readable contrast swatch for a text color sample - renders each text
// color as a small sample word directly on the background color, the
// same "see it before you pick it" idea as the Fonts tab's live preview
// and the Marks tab's dark/cream split thumbnail.
function TextColorChip({bg, textColor, onDelete}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, padding: "4px 6px 4px 10px",
      borderRadius: 999, background: bg, border: `1px solid ${C.border}33`,
    }}>
      <span style={{fontFamily: ui.display, fontSize: 11, fontWeight: 700, color: textColor.hex}}>
        {textColor.name}
      </span>
      {onDelete && (
        <button onClick={onDelete} title={`Remove ${textColor.name}`} style={{
          width: 16, height: 16, borderRadius: 8, border: "none", background: "rgba(0,0,0,0.25)",
          color: textColor.hex, fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
        }}>×</button>
      )}
    </div>
  );
}

// An existing text color, editable in place (not just deletable) - the
// swatch/chip preview above stays the quick "how does this read" view;
// this row is where a color actually gets changed.
function TextColorRow({textColor, onChange, onDelete}) {
  return (
    <div style={{display: "flex", gap: 4, alignItems: "center"}}>
      <input type="color" value={textColor.hex} onChange={e => onChange({...textColor, hex: e.target.value})}
        style={{width: 24, height: 24, padding: 0, border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", flexShrink: 0}} />
      <input type="text" value={textColor.name} onChange={e => onChange({...textColor, name: e.target.value})}
        style={{flex: 1, padding: "4px 6px", border: `1px solid ${C.border}`, borderRadius: 5, fontFamily: ui.body, fontSize: 11}} />
      <button onClick={onDelete} title={`Remove ${textColor.name}`} style={{
        width: 20, height: 20, borderRadius: 10, border: "none", background: "rgba(0,0,0,0.65)", color: "#fff",
        fontSize: 11, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
      }}>×</button>
    </div>
  );
}

function AddTextColorForm({onAdd}) {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#FFFFFF');

  const submit = () => {
    if (!name.trim()) return;
    onAdd({name: name.trim(), hex});
    setName('');
    setHex('#FFFFFF');
  };

  return (
    <div style={{display: "flex", gap: 4, alignItems: "center"}}>
      <input type="color" value={hex} onChange={e => setHex(e.target.value)}
        style={{width: 24, height: 24, padding: 0, border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer"}} />
      <input type="text" value={name} placeholder="Text color name" onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        style={{flex: 1, padding: "4px 6px", border: `1px solid ${C.border}`, borderRadius: 5, fontFamily: ui.body, fontSize: 11}} />
      <button onClick={submit} style={{
        padding: "4px 8px", border: "none", borderRadius: 5, background: C.accentDark, color: "#fff",
        fontFamily: ui.display, fontSize: 10, fontWeight: 700, cursor: "pointer",
      }}>+</button>
    </div>
  );
}

function BackgroundCard({bg, onUpdate, onDelete}) {
  const protectedRow = !!bg.role;

  const handleRemoveTextColor = (idx) => {
    const next = bg.textColors.filter((_, i) => i !== idx);
    onUpdate(bg.id, {textColors: next});
  };
  const handleEditTextColor = (idx, nextTc) => {
    const next = bg.textColors.map((tc, i) => (i === idx ? nextTc : tc));
    onUpdate(bg.id, {textColors: next});
  };
  const handleAddTextColor = (tc) => {
    onUpdate(bg.id, {textColors: [...bg.textColors, tc]});
  };
  const handleToggleRotation = () => {
    onUpdate(bg.id, {inAutoRotation: !bg.inAutoRotation});
  };
  const handleHexChange = (hex) => onUpdate(bg.id, {hex});
  const handleNameChange = (name) => onUpdate(bg.id, {name});

  return (
    <div style={{border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden"}}>
      <div style={{background: bg.hex, padding: "14px 14px 10px", display: "flex", flexWrap: "wrap", gap: 6}}>
        {bg.textColors.map((tc, i) => (
          <TextColorChip key={`${tc.name}-${i}`} bg={bg.hex} textColor={tc} onDelete={() => handleRemoveTextColor(i)} />
        ))}
      </div>
      <div style={{padding: "8px 10px", background: C.cardAlt, display: "flex", flexDirection: "column", gap: 8}}>
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <input type="color" value={bg.hex} onChange={e => handleHexChange(e.target.value)}
            style={{width: 24, height: 24, padding: 0, border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", flexShrink: 0}} />
          <input type="text" value={bg.name} onChange={e => handleNameChange(e.target.value)}
            style={{flex: 1, padding: "4px 6px", border: `1px solid ${C.border}`, borderRadius: 5, fontFamily: ui.display, fontSize: 11, fontWeight: 700}} />
          <button
            onClick={() => !protectedRow && onDelete(bg)}
            disabled={protectedRow}
            title={protectedRow ? ROLE_LABEL[bg.role] : 'Delete this background'}
            style={{
              width: 22, height: 22, borderRadius: 11, border: "none",
              background: protectedRow ? C.border : "rgba(0,0,0,0.65)",
              color: protectedRow ? C.textTer : "#fff",
              fontSize: 12, cursor: protectedRow ? "not-allowed" : "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
            }}
          >
            {protectedRow ? '🔒' : '×'}
          </button>
        </div>

        <label style={{display: "flex", alignItems: "center", gap: 6, fontFamily: ui.body, fontSize: 11, color: C.text, cursor: "pointer"}}>
          <input type="checkbox" checked={bg.inAutoRotation} onChange={handleToggleRotation} />
          In automatic rotation
        </label>

        {bg.textColors.map((tc, i) => (
          <TextColorRow key={`${tc.name}-${i}`} textColor={tc}
            onChange={next => handleEditTextColor(i, next)}
            onDelete={() => handleRemoveTextColor(i)} />
        ))}
        <AddTextColorForm onAdd={handleAddTextColor} />
      </div>
    </div>
  );
}

const EMPTY_FORM = {name: '', hex: '#172B2C', inAutoRotation: true, textColors: []};

export default function PaletteTab({backgroundColors, setBackgroundColors}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  const hasAnyBuiltIn = backgroundColors.length > 0;

  const handleImportBuiltIns = async () => {
    setImporting(true);
    const existingNames = new Set(backgroundColors.map(b => b.name));
    let succeeded = 0;
    let failed = 0;
    for (const seed of BUILT_IN_BACKGROUND_COLORS) {
      if (existingNames.has(seed.name)) continue;
      try {
        const bg = await importBuiltInBackgroundColor(seed);
        setBackgroundColors(prev => [...prev, bg]);
        succeeded += 1;
      } catch (error) {
        failed += 1;
        console.error(`Could not import built-in background "${seed.name}":`, error);
      }
    }
    setImporting(false);
    if (failed === 0) {
      toast.show(succeeded > 0 ? 'Built-in backgrounds added to your library.' : 'Already imported.', 'success');
    } else if (succeeded > 0) {
      toast.show(`Imported ${succeeded}, but ${failed} failed. Check the browser console for details.`, 'warning');
    } else {
      toast.show('Could not import the built-in backgrounds. Check the browser console for details.', 'error');
    }
  };

  const handleUpdate = async (id, patch) => {
    const prev = backgroundColors;
    setBackgroundColors(cur => cur.map(b => (b.id === id ? {...b, ...patch} : b)));
    try {
      await updateBackgroundColor(id, patch);
    } catch (error) {
      setBackgroundColors(prev);
      toast.show(`Could not update that background: ${error?.message || 'unknown error'}`, 'error');
    }
  };

  const handleDelete = (bg) => setConfirmDelete(bg);

  const confirmDeleteBg = async () => {
    const bg = confirmDelete;
    setConfirmDelete(null);
    try {
      await deleteBackgroundColor(bg.id, bg.role);
      setBackgroundColors(prev => prev.filter(b => b.id !== bg.id));
      toast.show('Background deleted.', 'success');
    } catch (error) {
      toast.show(error?.message || 'Could not delete that background.', 'error');
    }
  };

  const handleAddFormTextColor = (tc) => setForm(f => ({...f, textColors: [...f.textColors, tc]}));
  const handleRemoveFormTextColor = (idx) => setForm(f => ({...f, textColors: f.textColors.filter((_, i) => i !== idx)}));
  const handleEditFormTextColor = (idx, next) => setForm(f => ({...f, textColors: f.textColors.map((tc, i) => (i === idx ? next : tc))}));

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.show('Give this background a name.', 'warning');
      return;
    }
    if (form.textColors.length === 0) {
      toast.show('Add at least one text color that reads on it.', 'warning');
      return;
    }
    setAdding(true);
    try {
      const bg = await addBackgroundColor({...form, name: form.name.trim()});
      setBackgroundColors(prev => [...prev, bg]);
      setForm(EMPTY_FORM);
      toast.show('Background added.', 'success');
    } catch (error) {
      toast.show(error?.message || 'Could not add that background.', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8}}>
        Background Palette
      </div>
      <div style={{fontFamily: ui.body, fontSize: 11, color: C.textTer, marginBottom: 10, lineHeight: 1.4}}>
        The solid backgrounds in the Colors tab and the automatic generator's rotation, plus which text colors read on each one.
      </div>

      {!hasAnyBuiltIn && !importing && (
        <button
          onClick={handleImportBuiltIns}
          style={{
            width: "100%", marginBottom: 10, padding: "8px 12px", border: `1px solid ${C.border}`,
            borderRadius: 8, background: C.cardAlt, color: C.accentDark,
            fontFamily: ui.display, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          ⬇ Import the {BUILT_IN_BACKGROUND_COLORS.length} Built-in Backgrounds
        </button>
      )}
      {importing && (
        <div style={{textAlign: "center", padding: "8px 12px", marginBottom: 10, fontFamily: ui.body, fontSize: 11, color: C.textTer}}>
          Importing…
        </div>
      )}

      {backgroundColors.length > 0 && (
        <div style={{display: "flex", flexDirection: "column", gap: 10, marginBottom: 16}}>
          {backgroundColors.map(bg => (
            <BackgroundCard key={bg.id} bg={bg} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <div style={{border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, background: C.cardAlt}}>
        <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10}}>
          Add a Background
        </div>

        <div style={{background: form.hex, borderRadius: 6, padding: "10px 10px 6px", marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 6, minHeight: 20}}>
          {form.textColors.length === 0 && (
            <span style={{fontFamily: ui.body, fontSize: 10, color: "rgba(255,255,255,0.6)"}}>No text colors yet</span>
          )}
          {form.textColors.map((tc, i) => (
            <TextColorChip key={`${tc.name}-${i}`} bg={form.hex} textColor={tc} onDelete={() => handleRemoveFormTextColor(i)} />
          ))}
        </div>

        <div style={{display: "flex", flexDirection: "column", gap: 10}}>
          <div style={{display: "flex", gap: 8, alignItems: "center"}}>
            <input type="color" value={form.hex} onChange={e => setForm(f => ({...f, hex: e.target.value}))}
              style={{width: 28, height: 28, padding: 0, border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", flexShrink: 0}} />
            <input type="text" value={form.name} placeholder="Background name"
              onChange={e => setForm(f => ({...f, name: e.target.value}))}
              style={{flex: 1, padding: "6px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: ui.body, fontSize: 12}} />
          </div>

          {form.textColors.map((tc, i) => (
            <TextColorRow key={`${tc.name}-${i}`} textColor={tc}
              onChange={next => handleEditFormTextColor(i, next)}
              onDelete={() => handleRemoveFormTextColor(i)} />
          ))}
          <AddTextColorForm onAdd={handleAddFormTextColor} />

          <label style={{display: "flex", alignItems: "center", gap: 6, fontFamily: ui.body, fontSize: 11, color: C.text, cursor: "pointer"}}>
            <input type="checkbox" checked={form.inAutoRotation} onChange={e => setForm(f => ({...f, inAutoRotation: e.target.checked}))} />
            In automatic rotation
          </label>

          <button
            onClick={handleAdd}
            disabled={adding}
            style={{
              marginTop: 2, padding: "8px 12px", border: "none", borderRadius: 6,
              background: C.accentDark, color: "#fff",
              fontFamily: ui.display, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
              cursor: adding ? "wait" : "pointer",
            }}
          >
            {adding ? "Adding…" : "+ Add Background"}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete the "${confirmDelete.name}" background?`}
          confirmLabel="Delete"
          onConfirm={confirmDeleteBg}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
