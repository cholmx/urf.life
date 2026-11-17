import React, {useMemo, useRef, useState} from 'react';
import {C, ui} from '../../constants/styles';
import {TEXTURES} from '../../constants/data';
import {uploadPhoto, deletePhoto, isDuplicatePhoto, setPhotoIsTexture, importBuiltInTexture} from '../../services/photoService';
import {useToast} from '../../hooks/useToast';
import ConfirmDialog from '../ConfirmDialog';

export default function PhotosTab({photos, setPhotos}) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [importing, setImporting] = useState(false);
  const toast = useToast();

  // Mirrors FontsTab's alreadyImported check - hides the button once
  // every built-in texture's filename is already present, not just once
  // any photo is flagged as a texture (a staff-uploaded texture used to
  // hide this permanently, even with none of the built-ins ever
  // imported).
  const alreadyImported = useMemo(() => {
    const names = new Set(photos.filter(Boolean).map(p => p.name));
    return TEXTURES.every(path => names.has(path.split('/').pop()));
  }, [photos]);

  const handleImportBuiltIns = async () => {
    setImporting(true);
    const existingNames = new Set(photos.filter(Boolean).map(p => p.name));
    let succeeded = 0;
    let failed = 0;
    // Each file gets its own try/catch - one bad file (a one-off network
    // blip, a duplicate name) shouldn't abort the whole batch and leave
    // every other texture unimported too.
    for (const path of TEXTURES) {
      const name = path.split('/').pop();
      if (existingNames.has(name)) continue;
      try {
        const photo = await importBuiltInTexture(path);
        setPhotos(prev => [...prev, photo]);
        succeeded += 1;
      } catch (error) {
        failed += 1;
        console.error(`Could not import built-in texture "${name}":`, error);
      }
    }
    setImporting(false);
    if (failed === 0) {
      toast.show(succeeded > 0 ? 'Built-in textures added to your library.' : 'Already imported.', 'success');
    } else if (succeeded > 0) {
      toast.show(`Imported ${succeeded}, but ${failed} failed. Check the browser console for details.`, 'warning');
    } else {
      toast.show('Could not import the built-in textures. Check the browser console for details.', 'error');
    }
  };

  const handleToggleTexture = async (photo) => {
    const next = !photo.isTexture;
    setPhotos(prev => prev.map(p => (p && p.id === photo.id ? {...p, isTexture: next} : p)));
    try {
      await setPhotoIsTexture(photo.dbId, next);
    } catch (error) {
      setPhotos(prev => prev.map(p => (p && p.id === photo.id ? {...p, isTexture: !next} : p)));
      console.error('Could not update is_texture for photo', photo.dbId, error);
      toast.show(`Could not update that photo: ${error?.message || 'unknown error'}`, 'error');
    }
  };

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    setUploadProgress({current: 0, total: validFiles.length, name: validFiles[0].name});

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress({current: i, total: validFiles.length, name: file.name});

      if (isDuplicatePhoto(photos, file)) {
        toast.show(`"${file.name}" is already in your library.`, 'warning');
        continue;
      }

      try {
        const photo = await uploadPhoto(file);
        setPhotos(p => [...p, photo]);
      } catch (error) {
        toast.show(`Could not upload "${file.name}". Please try again.`, 'error');
      }

      setUploadProgress({current: i + 1, total: validFiles.length, name: file.name});
    }

    setUploadProgress(null);
  };

  const handlePhotos = async e => {
    await handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = async e => {
    e.preventDefault();
    setDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  const handleDeletePhoto = (photo) => {
    setConfirmDelete(photo);
  };

  const confirmDeletePhoto = async () => {
    const photo = confirmDelete;
    setConfirmDelete(null);
    try {
      if (photo.dbId && photo.storagePath) {
        await deletePhoto(photo.dbId, photo.storagePath);
      }
      setPhotos(prev => prev.filter(x => x.id !== photo.id));
      toast.show('Photo deleted.', 'success');
    } catch (error) {
      toast.show('Could not delete that photo. Please try again.', 'error');
    }
  };

  const progressText = uploadProgress
    ? uploadProgress.total === 1
      ? `Uploading "${uploadProgress.name}"...`
      : `Uploading ${uploadProgress.current + 1} of ${uploadProgress.total}: ${uploadProgress.name}`
    : null;

  return (
    <div>
      <input type="file" ref={fileRef} accept="image/*" multiple onChange={handlePhotos} style={{display: "none"}} />

      <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8}}>
        Background Photos
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
        <div style={{fontSize: 20, marginBottom: 3}}>{uploadProgress ? "⏳" : "🖼"}</div>
        <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em"}}>
          {progressText || dragging ? "Drop to add" : "Upload or drag photos"}
        </div>
        <div style={{fontFamily: ui.body, fontSize: 10, color: C.textTer, marginTop: 2}}>
          {progressText ? "Saving to library..." : "JPG, PNG, WEBP"}
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

      {!alreadyImported && (
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
          {importing ? "Importing…" : "⬇ Import the 15 Built-in Textures"}
        </button>
      )}

      {photos.length > 0 && (
        <>
          <div style={{fontFamily: ui.body, fontSize: 10, color: C.textTer, marginBottom: 6}}>
            ✨ on a photo adds it to the pool of automatic backgrounds used when building a slide from the queue.
          </div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8}}>
            {photos.filter(Boolean).map(p => (
              <div key={p.id} style={{position: "relative"}}>
                <div style={{
                  borderRadius: 6, overflow: "hidden", aspectRatio: "16/10",
                  border: `2px solid ${C.border}`,
                }}>
                  <canvas ref={el => {
                    if (el) {
                      el.width = 240; el.height = 150;
                      const ctx = el.getContext("2d");
                      const sc = Math.max(240 / p.img.width, 150 / p.img.height);
                      const w = p.img.width * sc, h = p.img.height * sc;
                      ctx.drawImage(p.img, (240 - w) / 2, (150 - h) / 2, w, h);
                    }
                  }} style={{width: "100%", height: "100%", display: "block"}} />
                </div>
                <button onClick={() => handleDeletePhoto(p)}
                  style={{position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: 9, border: "none", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1}}>
                  ×
                </button>
                <button
                  onClick={() => handleToggleTexture(p)}
                  title={p.isTexture ? "Remove from automatic backgrounds" : "Add to automatic backgrounds"}
                  style={{
                    position: "absolute", top: 3, left: 3, width: 18, height: 18, borderRadius: 9, border: "none",
                    background: p.isTexture ? C.accent : "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                  }}
                >
                  ✨
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.name}" from your photo library?`}
          confirmLabel="Delete"
          onConfirm={confirmDeletePhoto}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
