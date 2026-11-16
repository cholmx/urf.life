import { supabase } from './supabaseClient';

const BUCKET_NAME = 'staff-slide-marks';
// Marks are small transparent overlays, not full photos - capped well
// below photoService's 1920px background-photo ceiling since nothing in
// the Slide Maker draws one larger than the slide canvas itself.
const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;

async function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
        resolve(file);
        return;
      }

      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      // Preserves alpha - unlike a JPEG re-encode, canvas-to-PNG/WEBP
      // keeps transparency intact, which is the whole point of a mark.
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        file.type
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function isDuplicateMark(existingMarks, file) {
  return existingMarks.some(m =>
    m.name === file.name && m.file_size === file.size
  );
}

export async function uploadMark(file, pool) {
  const resizedFile = await resizeImage(file);

  const fileExt = resizedFile.name.split('.').pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, resizedFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = URL.createObjectURL(resizedFile);
  });

  const { data: markRecord, error: dbError } = await supabase
    .from('staff_slide_marks_portal123')
    .insert({
      file_name: file.name,
      storage_path: filePath,
      thumbnail_url: publicUrl,
      pool,
      width: img.width,
      height: img.height,
      file_size: resizedFile.size,
      mime_type: resizedFile.type,
    })
    .select()
    .single();

  if (dbError) throw dbError;

  return {
    id: markRecord.id,
    name: file.name,
    url: publicUrl,
    img,
    dbId: markRecord.id,
    storagePath: filePath,
    file_size: resizedFile.size,
    pool,
  };
}

// onMarkReady(mark, index, total), when given, fires as each mark's image
// finishes decoding - see photoService's getPhotos for why (lets the
// gallery render thumbnails as they arrive instead of blocking on
// whichever one happens to load slowest).
export async function getMarks(onMarkReady) {
  const { data, error } = await supabase
    .from('staff_slide_marks_portal123')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const marksWithImages = await Promise.all(
    data.map(async (mark, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = mark.thumbnail_url;
      });

      const result = {
        id: mark.id,
        name: mark.file_name,
        url: mark.thumbnail_url,
        img,
        dbId: mark.id,
        storagePath: mark.storage_path,
        file_size: mark.file_size,
        pool: mark.pool,
      };
      onMarkReady?.(result, index, data.length);
      return result;
    })
  );

  return marksWithImages;
}

export async function deleteMark(dbId, storagePath) {
  await supabase.storage.from(BUCKET_NAME).remove([storagePath]);

  const { error } = await supabase
    .from('staff_slide_marks_portal123')
    .delete()
    .eq('id', dbId);

  if (error) throw error;
}

export async function setMarkPool(dbId, pool) {
  const { error } = await supabase
    .from('staff_slide_marks_portal123')
    .update({ pool })
    .eq('id', dbId);

  if (error) throw error;
}

// Pulls one of the app's bundled /slide-marks seed images in as a real
// library mark (upload + its pool), so it behaves exactly like anything
// staff upload themselves - same storage, same pool toggle, same delete
// control - instead of living as a separate hardcoded list in data.js.
// Used by the Marks tab's one-time "Import built-in marks" action, same
// idea as photoService's importBuiltInTexture.
export async function importBuiltInMark(path, pool) {
  const response = await fetch(path);
  const blob = await response.blob();
  const name = path.split('/').pop();
  const file = new File([blob], name, { type: blob.type || 'image/png' });
  return uploadMark(file, pool);
}
