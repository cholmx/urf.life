import React, {useRef, useState, useEffect} from 'react';
import {C, ui} from '../../constants/styles';
import Slider from '../Slider';
import {uploadPhoto, getPhotos, deletePhoto, isDuplicatePhoto} from '../../services/photoService';
import {useToast} from '../../hooks/useToast';
import ConfirmDialog from '../ConfirmDialog';

const ACCENT_PANEL_TEMPLATES = ["right_accent", "side_panel"];

export default function PhotosTab({photos, setPhotos, activePhoto, setActivePhoto, accentPhoto, setAccentPhoto, tmplId, ov, setOv, blur, setBlur}) {
  const fileRef = useRef(null);
  const accentFileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [accentDragging, setAccentDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  const showAccentPanel = ACCENT_PANEL_TEMPLATES.includes(tmplId);

  useEffect(() => {
    loadSavedPhotos();
  }, []);

  const loadSavedPhotos = async () => {
    try {
      const savedPhotos = await getPhotos();
      setPhotos(savedPhotos);
    } catch (error) {
      toast.show('Could not load your photo library.', 'error');
    }
  };

  const handleFiles = async (files, isAccent = false) => {
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
        if (isAccent) setAccentPhoto(photo.img);
      } catch (error) {
        toast.show(`Could not upload "${file.name}". Please try again.`, 'error');
      }

      setUploadProgress({current: i + 1, total: validFiles.length, name: file.name});
    }

    setUploadProgress(null);
  };

  const handlePhotos = async e => {
    await handleFiles(e.target.files, false);
    e.target.value = "";
  };

  const handleDrop = async e => {
    e.preventDefault();
    setDragging(false);
    await handleFiles(e.dataTransfer.files, false);
  };

  const handleAccentPhotos = async e => {
    await handleFiles(e.target.files, true);
    e.target.value = "";
  };

  const handleAccentDrop = async e => {
    e.preventDefault();
    setAccentDragging(false);
    await handleFiles(e.dataTransfer.files, true);
  };

  const handleDeletePhoto = (photo) => {
    setConfirmDelete(photo);
  };

  const confirmDeletePhoto = async () => {
    const photo = confirmDelete;
    setConfirmDelete(null);
    try {
      if (activePhoto === photo.img) setActivePhoto(null);
      if (accentPhoto === photo.img) setAccentPhoto(null);
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

  const PhotoGrid = ({selectedImg, onSelect}) => (
    <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8}}>
      {photos.map(p => (
        <div key={p.id} style={{position: "relative"}}>
          <div onClick={() => onSelect(p.img)} style={{
            borderRadius: 6, overflow: "hidden", cursor: "pointer", aspectRatio: "16/10",
            border: `2px solid ${selectedImg === p.img ? C.accent : C.border}`,
            boxShadow: selectedImg === p.img ? `0 0 0 3px ${C.accentBg}` : "none",
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
          {selectedImg === p.img && (
            <div style={{position: "absolute", bottom: 3, left: 3, background: C.accent, color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 8, fontFamily: ui.display, fontWeight: 700}}>ACTIVE</div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <input type="file" ref={fileRef} accept="image/*" multiple onChange={handlePhotos} style={{display: "none"}} />
      <input type="file" ref={accentFileRef} accept="image/*" onChange={handleAccentPhotos} style={{display: "none"}} />

      {/* Background section */}
      <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8}}>
        Background Photo
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

      <div style={{display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10}}>
        <div onClick={() => setActivePhoto(null)} style={{
          padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontFamily: ui.display,
          fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
          border: `2px solid ${!activePhoto ? C.accent : C.border}`,
          background: !activePhoto ? C.accentBg : "transparent",
          color: !activePhoto ? C.accentDark : C.textTer,
        }}>
          No Photo
        </div>
      </div>

      {photos.length > 0 && <PhotoGrid selectedImg={activePhoto} onSelect={setActivePhoto} />}

      {activePhoto && (
        <div style={{marginTop: 12, background: C.cardAlt, borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 12}}>
          <Slider
            label={`Dark Overlay (${ov}%)`}
            value={ov}
            min={50}
            max={90}
            onChange={setOv}
          />
          <Slider label={`Blur (${blur}px)`} value={blur} min={0} max={60} onChange={setBlur} />
        </div>
      )}

      {/* Accent Panel section */}
      {showAccentPanel && (
        <div style={{marginTop: 20}}>
          <div style={{height: 1, background: C.border, marginBottom: 16}} />

          <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4}}>
            Accent Panel Photo
          </div>
          <div style={{fontFamily: ui.body, fontSize: 11, color: C.textTer, marginBottom: 10}}>
            Fills the colored accent panel with this image, tinted by your accent color.
          </div>

          <div
            onDragOver={e => {e.preventDefault(); setAccentDragging(true);}}
            onDragLeave={() => setAccentDragging(false)}
            onDrop={handleAccentDrop}
            onClick={() => !uploadProgress && accentFileRef.current?.click()}
            style={{
              border: `2px dashed ${accentDragging ? C.accent : C.border}`,
              borderRadius: 10, padding: "14px 12px", textAlign: "center",
              background: accentDragging ? C.accentBg : C.cardAlt,
              cursor: uploadProgress ? "wait" : "pointer", marginBottom: 10, transition: "all 0.15s",
            }}
          >
            <div style={{fontFamily: ui.display, fontSize: 10, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em"}}>
              {progressText || accentDragging ? "Drop to add" : "Upload accent image"}
            </div>
            <div style={{fontFamily: ui.body, fontSize: 10, color: C.textTer, marginTop: 2}}>
              Or pick from library below
            </div>
          </div>

          <div style={{display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10}}>
            <div onClick={() => setAccentPhoto(null)} style={{
              padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontFamily: ui.display,
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
              border: `2px solid ${!accentPhoto ? C.accent : C.border}`,
              background: !accentPhoto ? C.accentBg : "transparent",
              color: !accentPhoto ? C.accentDark : C.textTer,
            }}>
              Color Only
            </div>
          </div>

          {photos.length > 0 && <PhotoGrid selectedImg={accentPhoto} onSelect={setAccentPhoto} />}
        </div>
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
