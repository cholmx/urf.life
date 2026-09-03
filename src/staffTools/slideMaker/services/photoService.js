import { supabase } from './supabaseClient';

const BUCKET_NAME = 'staff-slide-photos';
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;

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
        file.type,
        0.9
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function isDuplicatePhoto(existingPhotos, file) {
  return existingPhotos.some(p =>
    p.name === file.name && p.file_size === file.size
  );
}

export async function uploadPhoto(file) {
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

  const { data: photoRecord, error: dbError } = await supabase
    .from('staff_slide_photos_portal123')
    .insert({
      file_name: file.name,
      storage_path: filePath,
      thumbnail_url: publicUrl,
      width: img.width,
      height: img.height,
      file_size: resizedFile.size,
      mime_type: resizedFile.type,
    })
    .select()
    .single();

  if (dbError) throw dbError;

  return {
    id: photoRecord.id,
    name: file.name,
    url: publicUrl,
    img,
    dbId: photoRecord.id,
    storagePath: filePath,
    file_size: resizedFile.size,
  };
}

export async function getPhotos() {
  const { data, error } = await supabase
    .from('staff_slide_photos_portal123')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const photosWithImages = await Promise.all(
    data.map(async (photo) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = photo.thumbnail_url;
      });

      return {
        id: photo.id,
        name: photo.file_name,
        url: photo.thumbnail_url,
        img,
        dbId: photo.id,
        storagePath: photo.storage_path,
        file_size: photo.file_size,
      };
    })
  );

  return photosWithImages;
}

export async function deletePhoto(dbId, storagePath) {
  await supabase.storage.from(BUCKET_NAME).remove([storagePath]);

  const { error } = await supabase
    .from('staff_slide_photos_portal123')
    .delete()
    .eq('id', dbId);

  if (error) throw error;
}
