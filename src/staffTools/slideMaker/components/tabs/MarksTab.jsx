import React, {useMemo, useRef, useState} from 'react';
import {C, ui} from '../../constants/styles';
import {BUILT_IN_MARKS} from '../../constants/data';
import {uploadMark, deleteMark, isDuplicateMark, setMarkPool, importBuiltInMark} from '../../services/markService';
import {useToast} from '../../hooks/useToast';
import ConfirmDialog from '../ConfirmDialog';

// Which of the automatic generator's three pools a mark belongs to (see
// pickMarkOverlay in SlideMaker.jsx) - this is a mark's whole reason for
// existing, so every card picks one of these three, never none.
const POOLS = [
  {id: 'dark', label: 'Dark', title: 'Shows on every background except White/Cream'},
  {id: 'light', label: 'Light', title: 'Shows on White/Cream only'},
  {id: 'universal', label: 'Any', title: 'Shows on every background'},
];

// Draws a mark half over a dark fill and half over a cream fill in one
// thumbnail, so staff can tell at a glance which backgrounds it actually
// reads on without needing to flip through slides - the same dark/cream
// split used throughout this tool's own design process to check a mark's
// visibility before adding it.
function MarkThumb({mark}) {
  return (
    <canvas
      ref={el => {
        if (!el) return;
        el.width = 240; el.height = 150;
        const ctx = el.getContext("2d");
        ctx.fillStyle = "#1C2A2B";
        ctx.fillRect(0, 0, 120, 150);
        ctx.fillStyle = "#F4ECDD";
        ctx.fillRect(120, 0, 120, 150);
        if (mark.img) ctx.drawImage(mark.img, 0, 0, 240, 150);
      }}
      style={{width: "100%", height: "100%", display: "block"}}
    />
  );
}

export default function MarksTab({marks, setMarks}) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [importing, setImporting] = useState(false);
  const toast = useToast();

  // Mirrors FontsTab's alreadyImported check - hides the button once
  // every built-in mark's name is already present, not just once the
  // library is non-empty (a single staff-uploaded mark used to hide this
  // permanently, even with none of the built-ins ever imported).
  const alreadyImported = useMemo(() => {
    const names = new Set(marks.filter(Boolean).map(m => m.name));
    return BUILT_IN_MARKS.every(({src}) => names.has(src.split('/').pop()));
  }, [marks]);

  const handleImportBuiltIns = async () => {
    setImporting(true);
    const existingNames = new Set(marks.filter(Boolean).map(m => m.name));
    let succeeded = 0;
    let failed = 0;
    for (const {src, pool} of BUILT_IN_MARKS) {
      const name = src.split('/').pop();
      if (existingNames.has(name)) continue;
      try {
        const mark = await importBuiltInMark(src, pool);
        setMarks(prev => [...prev, mark]);
        succeeded += 1;
      } catch (error) {
        failed += 1;
        console.error(`Could not import built-in mark "${name}":`, error);
      }
    }
    setImporting(false);
    if (failed === 0) {
      toast.show(succeeded > 0 ? 'Built-in marks added to your library.' : 'Already imported.', 'success');
    } else if (succeeded > 0) {
      toast.show(`Imported ${succeeded}, but ${failed} failed. Check the browser console for details.`, 'warning');
    } else {
      toast.show('Could not import the built-in marks. Check the browser console for details.', 'error');
    }
  };

  const handleSetPool = async (mark, pool) => {
    if (mark.pool === pool) return;
    const prevPool = mark.pool;
    setMarks(prev => prev.map(m => (m && m.id === mark.id ? {...m, pool} : m)));
    try {
      await setMarkPool(mark.dbId, pool);
    } catch (error) {
      setMarks(prev => prev.map(m => (m && m.id === mark.id ? {...m, pool: prevPool} : m)));
      console.error('Could not update pool for mark', mark.dbId, error);
      toast.show(`Could not update that mark: ${error?.message || 'unknown error'}`, 'error');
    }
  };

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    setUploadProgress({current: 0, total: validFiles.length, name: validFiles[0].name});

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress({current: i, total: validFiles.length, name: file.name});

      if (isDuplicateMark(marks, file)) {
        toast.show(`"${file.name}" is already in your library.`, 'warning');
        continue;
      }

      try {
        // New uploads default to Universal (works on anything) - the
        // safest starting guess until staff pick a real pool below.
        const mark = await uploadMark(file, 'universal');
        setMarks(m => [...m, mark]);
      } catch (error) {
        toast.show(`Could not upload "${file.name}". Please try again.`, 'error');
      }

      setUploadProgress({current: i + 1, total: validFiles.length, name: file.name});
    }

    setUploadProgress(null);
  };

  const handleUpload = async e => {
    await handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = async e => {
    e.preventDefault();
    setDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  const handleDeleteMark = (mark) => {
    setConfirmDelete(mark);
  };

  const confirmDeleteMark = async () => {
    const mark = confirmDelete;
    setConfirmDelete(null);
    try {
      if (mark.dbId && mark.storagePath) {
        await deleteMark(mark.dbId, mark.storagePath);
      }
      setMarks(prev => prev.filter(x => x.id !== mark.id));
      toast.show('Mark deleted.', 'success');
    } catch (error) {
      toast.show('Could not delete that mark. Please try again.', 'error');
    }
  };

  const progressText = uploadProgress
    ? uploadProgress.total === 1
      ? `Uploading "${uploadProgress.name}"...`
      : `Uploading ${uploadProgress.current + 1} of ${uploadProgress.total}: ${uploadProgress.name}`
    : null;

  return (
    <div>
      <input type="file" ref={fileRef} accept="image/*" multiple onChange={handleUpload} style={{display: "none"}} />

      <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8}}>
        Overlay Marks
      </div>
      <div style={{fontFamily: ui.body, fontSize: 11, color: C.textTer, marginBottom: 10, lineHeight: 1.4}}>
        The faint watermark an automatic slide sometimes gets. Each one shown half over dark, half over cream, so you can see how it actually reads before choosing where it's allowed to show up.
      </div>

      <div
        onDragOver={e => {e.preventDefault(); setDragging(true);}}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploadProgress && fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? C.accent : C.border}`,
          borderRadius: 10, padding: "16px 12px", textAlign: "center",
          background: dragging ? C.accentBg : C.cardAlt,
          cursor: uploadProgress ? "wait" : "pointer", marginBottom: 10, transition: "all 0.15s",
        }}
      >
        <div style={{fontSize: 20, marginBottom: 3}}>{uploadProgress ? "⏳" : "✨"}</div>
        <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em"}}>
          {progressText || (dragging ? "Drop to add" : "Upload or drag marks")}
        </div>
        <div style={{fontFamily: ui.body, fontSize: 10, color: C.textTer, marginTop: 2}}>
          {progressText ? "Saving to library..." : "Transparent PNG or WEBP works best"}
        </div>
        {uploadProgress && uploadProgress.total > 1 && (
          <div style={{marginTop: 8, height: 4, background: C.border, borderRadius: 2, overflow: "hidden"}}>
            <div style={{
              height: "100%",
              background: C.accent,
              borderRadius: 2,
              width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
              transition: "width 0.2s",
            }} />
          </div>
        )}
      </div>

      {!alreadyImported && !uploadProgress && (
        <button
          onClick={handleImportBuiltIns}
          disabled={importing}
          style={{
            width: "100%", marginBottom: 10, padding: "8px 12px", border: `1px solid ${C.border}`,
            borderRadius: 8, background: C.cardAlt, color: C.accentDark,
            fontFamily: ui.display, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
            cursor: importing ? "wait" : "pointer",
          }}
        >
          {importing ? "Importing…" : `⬇ Import the ${BUILT_IN_MARKS.length} Built-in Marks`}
        </button>
      )}

      {marks.length > 0 && (
        <div style={{display: "flex", flexDirection: "column", gap: 10}}>
          {marks.filter(Boolean).map(m => (
            <div key={m.id} style={{border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.cardAlt}}>
              <div style={{position: "relative", aspectRatio: "16/10"}}>
                <MarkThumb mark={m} />
                <button onClick={() => handleDeleteMark(m)}
                  style={{position: "absolute", top: 5, right: 5, width: 20, height: 20, borderRadius: 10, border: "none", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1}}>
                  ×
                </button>
              </div>
              <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 8px"}}>
                <span style={{fontFamily: ui.body, fontSize: 10, color: C.textTer, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1}} title={m.name}>
                  {m.name}
                </span>
                <div style={{display: "flex", gap: 4, flexShrink: 0}}>
                  {POOLS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSetPool(m, p.id)}
                      title={p.title}
                      style={{
                        padding: "3px 8px", borderRadius: 5, cursor: "pointer",
                        border: `1.5px solid ${m.pool === p.id ? C.accent : C.border}`,
                        background: m.pool === p.id ? C.accentBg : "transparent",
                        color: m.pool === p.id ? C.accentDark : C.textTer,
                        fontFamily: ui.display, fontSize: 9, fontWeight: 700,
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.name}" from your mark library?`}
          confirmLabel="Delete"
          onConfirm={confirmDeleteMark}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
