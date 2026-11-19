import React, {useEffect, useState} from 'react';
import {C, ui} from '../../constants/styles';
import {addFontPairing, updateFontPairingSize, deleteFontPairing} from '../../services/fontPairingService';
import {useToast} from '../../hooks/useToast';
import ConfirmDialog from '../ConfirmDialog';

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const EMPTY_FORM = {
  hFont: '', hGeneric: 'sans-serif', hWeight: 700, hItalic: false, hUppercase: false, hSizeScale: 1,
  bFont: '', bGeneric: 'serif', bWeight: 400, bItalic: false, bSizeScale: 1,
};

// One shared stylesheet link covering every font any pairing in `form`
// actually needs right now, injected while this one is mounted - lets
// the live preview below the Add form show a staff-typed family before
// it's ever saved, the same way useGoogleFonts loads the saved pairings
// for the cards above it.
function useLivePreviewFonts(form) {
  useEffect(() => {
    if (!form.hFont.trim() && !form.bFont.trim()) return;
    const parts = [];
    if (form.hFont.trim()) {
      const fam = encodeURIComponent(form.hFont.trim()).replace(/%20/g, '+');
      parts.push(`family=${fam}:${form.hItalic ? `ital,wght@1,${form.hWeight}` : `wght@${form.hWeight}`}`);
    }
    if (form.bFont.trim()) {
      const fam = encodeURIComponent(form.bFont.trim()).replace(/%20/g, '+');
      parts.push(`family=${fam}:${form.bItalic ? `ital,wght@1,${form.bWeight}` : `wght@${form.bWeight}`}`);
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${parts.join('&')}&display=swap`;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.hFont, form.hWeight, form.hItalic, form.bFont, form.bWeight, form.bItalic]);
}

// Renders a pairing at its own hSizeScale/bSizeScale (1 = the base fixed
// 26px/15px) - each pairing carries its own size now (see SIZE_SCALE_MIN/
// MAX below and the sliders in the Add a Pairing form), the same
// multiplier the automatic slide maker applies to the headline/subhead's
// target width when that pairing gets picked (see HEADLINE_WIDTH_FRACTION/
// SUBTEXT_WIDTH_FRACTION in templateRenderers.js), so this preview is a
// true read of how the pairing will actually render, not a separate
// display-only estimate.
function PairingPreview({pairing}) {
  const headScale = pairing.hSizeScale ?? 1;
  const bodyScale = pairing.bSizeScale ?? 1;
  return (
    <div style={{padding: '16px 18px', background: C.cardAlt, borderRadius: 8}}>
      <div style={{
        fontFamily: `'${pairing.hFont}',${pairing.hGeneric}`,
        fontWeight: pairing.hWeight,
        fontStyle: pairing.hItalic ? 'italic' : 'normal',
        textTransform: pairing.hUppercase ? 'uppercase' : 'none',
        fontSize: 26 * headScale, color: C.text, lineHeight: 1.15,
      }}>
        Sunday Service
      </div>
      <div style={{
        fontFamily: `'${pairing.bFont}',${pairing.bGeneric}`,
        fontWeight: pairing.bWeight,
        fontStyle: pairing.bItalic ? 'italic' : 'normal',
        fontSize: 15 * bodyScale, color: C.textSec, marginTop: 4,
      }}>
        Join us this week
      </div>
    </div>
  );
}

const SIZE_SCALE_MIN = 0.5;
const SIZE_SCALE_MAX = 2.5;

function SizeScaleSlider({id, label, value, onChange}) {
  return (
    <div>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: 3}}>
        <label htmlFor={id} style={labelStyleShared}>{label}</label>
        <span style={{fontFamily: ui.body, fontSize: 11, color: C.textSec}}>{Math.round(value * 100)}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={SIZE_SCALE_MIN}
        max={SIZE_SCALE_MAX}
        step={0.05}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{width: "100%", cursor: "pointer"}}
      />
    </div>
  );
}

const labelStyleShared = {fontFamily: ui.display, fontSize: 9, fontWeight: 700, color: C.textTer, textTransform: "uppercase", letterSpacing: "0.05em"};

export default function FontsTab({fontPairings, setFontPairings}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingSizeId, setEditingSizeId] = useState(null);
  const [sizeDraft, setSizeDraft] = useState({hSizeScale: 1, bSizeScale: 1});
  const [savingSize, setSavingSize] = useState(false);
  const toast = useToast();

  useLivePreviewFonts(form);

  const startEditingSize = (pairing) => {
    setEditingSizeId(pairing.id);
    setSizeDraft({hSizeScale: pairing.hSizeScale ?? 1, bSizeScale: pairing.bSizeScale ?? 1});
  };

  const cancelEditingSize = () => setEditingSizeId(null);

  const saveSize = async (pairing) => {
    setSavingSize(true);
    try {
      const updated = await updateFontPairingSize(pairing.id, sizeDraft);
      setFontPairings(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      setEditingSizeId(null);
      toast.show('Size updated.', 'success');
    } catch (error) {
      toast.show(error?.message || 'Could not update that pairing\'s size.', 'error');
    } finally {
      setSavingSize(false);
    }
  };

  const handleAdd = async () => {
    if (!form.hFont.trim() || !form.bFont.trim()) {
      toast.show('Both a headline and a subhead font are needed.', 'warning');
      return;
    }
    setAdding(true);
    try {
      const pairing = await addFontPairing({...form, hFont: form.hFont.trim(), bFont: form.bFont.trim()});
      setFontPairings(prev => [...prev, pairing]);
      setForm(EMPTY_FORM);
      toast.show('Font pairing added.', 'success');
    } catch (error) {
      toast.show(error?.message || 'Could not add that pairing.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (pairing) => setConfirmDelete(pairing);

  const confirmDeletePairing = async () => {
    const pairing = confirmDelete;
    setConfirmDelete(null);
    try {
      await deleteFontPairing(pairing.id);
      setFontPairings(prev => prev.filter(p => p.id !== pairing.id));
      toast.show('Font pairing deleted.', 'success');
    } catch (error) {
      toast.show('Could not delete that pairing. Please try again.', 'error');
    }
  };

  const labelStyle = {...labelStyleShared, marginBottom: 3, display: "block"};
  const inputStyle = {width: "100%", padding: "6px 8px", border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: ui.body, fontSize: 12, color: C.text, boxSizing: "border-box"};
  const selectStyle = {...inputStyle, cursor: "pointer"};

  return (
    <div>
      <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8}}>
        Font Pairings
      </div>
      <div style={{fontFamily: ui.body, fontSize: 11, color: C.textTer, marginBottom: 10, lineHeight: 1.4}}>
        The headline/subhead combo the automatic slide maker randomly picks between. Each is checked against Google Fonts before it's saved.
      </div>

      {fontPairings.length > 0 && (
        <div style={{display: "flex", flexDirection: "column", gap: 8, marginBottom: 16}}>
          {fontPairings.map(p => {
            const editing = editingSizeId === p.id;
            return (
              <div key={p.id} style={{border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden"}}>
                <PairingPreview pairing={editing ? {...p, ...sizeDraft} : p} />
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 10px", background: C.card}}>
                  <span style={{fontFamily: ui.body, fontSize: 10, color: C.textTer, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1}}>
                    {p.hFont} {p.hWeight}{p.hItalic ? ' italic' : ''}{p.hUppercase ? ' (caps)' : ''} / {p.bFont} {p.bWeight}{p.bItalic ? ' italic' : ''}
                  </span>
                  <div style={{display: "flex", gap: 6, flexShrink: 0}}>
                    <button onClick={() => (editing ? cancelEditingSize() : startEditingSize(p))}
                      title={editing ? "Cancel" : "Edit this pairing's size"}
                      style={{width: 20, height: 20, borderRadius: 10, border: "none", background: editing ? C.accent : "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1}}>
                      {editing ? "✕" : "✎"}
                    </button>
                    <button onClick={() => handleDelete(p)}
                      style={{width: 20, height: 20, borderRadius: 10, border: "none", background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1}}>
                      ×
                    </button>
                  </div>
                </div>
                {editing && (
                  <div style={{display: "flex", flexDirection: "column", gap: 10, padding: "10px", background: C.cardAlt, borderTop: `1px solid ${C.border}`}}>
                    <SizeScaleSlider id={`font-${p.id}-head-size`} label="Headline Size" value={sizeDraft.hSizeScale} onChange={v => setSizeDraft(d => ({...d, hSizeScale: v}))} />
                    <SizeScaleSlider id={`font-${p.id}-body-size`} label="Subhead Size" value={sizeDraft.bSizeScale} onChange={v => setSizeDraft(d => ({...d, bSizeScale: v}))} />
                    <div style={{display: "flex", gap: 8}}>
                      <button
                        onClick={() => saveSize(p)}
                        disabled={savingSize}
                        style={{flex: 1, padding: "6px 12px", border: "none", borderRadius: 6, background: C.accentDark, color: "#fff", fontFamily: ui.display, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", cursor: savingSize ? "wait" : "pointer"}}
                      >
                        {savingSize ? "Saving…" : "Save Size"}
                      </button>
                      <button
                        onClick={cancelEditingSize}
                        disabled={savingSize}
                        style={{padding: "6px 12px", border: `1px solid ${C.border}`, borderRadius: 6, background: "transparent", color: C.textSec, fontFamily: ui.body, fontSize: 12, cursor: savingSize ? "wait" : "pointer"}}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, background: C.cardAlt}}>
        <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10}}>
          Add a Pairing
        </div>

        <PairingPreview pairing={{
          hFont: form.hFont.trim() || 'Inter', hGeneric: form.hGeneric, hWeight: form.hWeight, hItalic: form.hItalic, hUppercase: form.hUppercase, hSizeScale: form.hSizeScale,
          bFont: form.bFont.trim() || 'Georgia', bGeneric: form.bGeneric, bWeight: form.bWeight, bItalic: form.bItalic, bSizeScale: form.bSizeScale,
        }} />

        <div style={{marginTop: 12, display: "flex", flexDirection: "column", gap: 10}}>
          <div>
            <label style={labelStyle}>Headline Font (Google Fonts name)</label>
            <input type="text" value={form.hFont} placeholder="e.g. Oswald"
              onChange={e => setForm(f => ({...f, hFont: e.target.value}))} style={inputStyle} />
          </div>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8}}>
            <div>
              <label style={labelStyle}>Weight</label>
              <select value={form.hWeight} onChange={e => setForm(f => ({...f, hWeight: Number(e.target.value)}))} style={selectStyle}>
                {WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fallback</label>
              <select value={form.hGeneric} onChange={e => setForm(f => ({...f, hGeneric: e.target.value}))} style={selectStyle}>
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
              </select>
            </div>
          </div>
          <div style={{display: "flex", gap: 14}}>
            <label style={{display: "flex", alignItems: "center", gap: 5, fontFamily: ui.body, fontSize: 11, color: C.text, cursor: "pointer"}}>
              <input type="checkbox" checked={form.hItalic} onChange={e => setForm(f => ({...f, hItalic: e.target.checked}))} />
              Italic
            </label>
            <label style={{display: "flex", alignItems: "center", gap: 5, fontFamily: ui.body, fontSize: 11, color: C.text, cursor: "pointer"}}>
              <input type="checkbox" checked={form.hUppercase} onChange={e => setForm(f => ({...f, hUppercase: e.target.checked}))} />
              Uppercase headline
            </label>
          </div>
          <SizeScaleSlider id="font-head-size-scale" label="Headline Size" value={form.hSizeScale} onChange={v => setForm(f => ({...f, hSizeScale: v}))} />

          <div style={{borderTop: `1px solid ${C.border}`, marginTop: 2, paddingTop: 10}}>
            <label style={labelStyle}>Subhead Font (Google Fonts name)</label>
            <input type="text" value={form.bFont} placeholder="e.g. Crimson Text"
              onChange={e => setForm(f => ({...f, bFont: e.target.value}))} style={inputStyle} />
          </div>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8}}>
            <div>
              <label style={labelStyle}>Weight</label>
              <select value={form.bWeight} onChange={e => setForm(f => ({...f, bWeight: Number(e.target.value)}))} style={selectStyle}>
                {WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fallback</label>
              <select value={form.bGeneric} onChange={e => setForm(f => ({...f, bGeneric: e.target.value}))} style={selectStyle}>
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans-serif</option>
              </select>
            </div>
          </div>
          <label style={{display: "flex", alignItems: "center", gap: 5, fontFamily: ui.body, fontSize: 11, color: C.text, cursor: "pointer"}}>
            <input type="checkbox" checked={form.bItalic} onChange={e => setForm(f => ({...f, bItalic: e.target.checked}))} />
            Italic
          </label>
          <SizeScaleSlider id="font-body-size-scale" label="Subhead Size" value={form.bSizeScale} onChange={v => setForm(f => ({...f, bSizeScale: v}))} />

          <button
            onClick={handleAdd}
            disabled={adding}
            style={{
              marginTop: 4, padding: "8px 12px", border: "none", borderRadius: 6,
              background: C.accentDark, color: "#fff",
              fontFamily: ui.display, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
              cursor: adding ? "wait" : "pointer",
            }}
          >
            {adding ? "Checking Google Fonts…" : "+ Add Pairing"}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete the "${confirmDelete.hFont} / ${confirmDelete.bFont}" pairing?`}
          confirmLabel="Delete"
          onConfirm={confirmDeletePairing}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
