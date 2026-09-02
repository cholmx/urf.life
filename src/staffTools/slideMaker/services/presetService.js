import { supabase } from './supabaseClient';

const THUMBNAIL_BUCKET = 'staff-slide-preset-thumbnails';
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 250;

async function generateThumbnail(canvas) {
  return new Promise((resolve, reject) => {
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = THUMBNAIL_WIDTH;
    thumbnailCanvas.height = THUMBNAIL_HEIGHT;
    const ctx = thumbnailCanvas.getContext('2d');

    ctx.drawImage(canvas, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

    thumbnailCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate thumbnail'));
        }
      },
      'image/jpeg',
      0.85
    );
  });
}

export async function savePreset(name, description, presetData, canvas) {
  try {
    let thumbnailUrl = null;

    if (canvas) {
      const thumbnailBlob = await generateThumbnail(canvas);
      const fileName = `${Date.now()}-${crypto.randomUUID()}.jpg`;
      const filePath = `thumbnails/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(THUMBNAIL_BUCKET)
        .upload(filePath, thumbnailBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from(THUMBNAIL_BUCKET)
          .getPublicUrl(filePath);
        thumbnailUrl = publicUrl;
      }
    }

    const { data, error } = await supabase
      .from('staff_slide_presets_portal123')
      .insert({
        name,
        description: description || null,
        preset_data: presetData,
        thumbnail_url: thumbnailUrl,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      presetData: data.preset_data,
      thumbnailUrl: data.thumbnail_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error saving preset:', error);
    throw error;
  }
}

export async function getPresets() {
  try {
    const { data, error } = await supabase
      .from('staff_slide_presets_portal123')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(preset => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      presetData: preset.preset_data,
      thumbnailUrl: preset.thumbnail_url,
      createdAt: preset.created_at,
      updatedAt: preset.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching presets:', error);
    return [];
  }
}

export async function updatePreset(id, name, description, presetData, canvas) {
  try {
    const updateData = {
      name,
      description: description || null,
      preset_data: presetData,
    };

    if (canvas) {
      const { data: existingPreset } = await supabase
        .from('staff_slide_presets_portal123')
        .select('thumbnail_url')
        .eq('id', id)
        .maybeSingle();

      if (existingPreset?.thumbnail_url) {
        const oldPath = existingPreset.thumbnail_url.split('/').slice(-2).join('/');
        await supabase.storage.from(THUMBNAIL_BUCKET).remove([oldPath]);
      }

      const thumbnailBlob = await generateThumbnail(canvas);
      const fileName = `${Date.now()}-${crypto.randomUUID()}.jpg`;
      const filePath = `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(THUMBNAIL_BUCKET)
        .upload(filePath, thumbnailBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from(THUMBNAIL_BUCKET)
          .getPublicUrl(filePath);
        updateData.thumbnail_url = publicUrl;
      }
    }

    const { data, error } = await supabase
      .from('staff_slide_presets_portal123')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      presetData: data.preset_data,
      thumbnailUrl: data.thumbnail_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error updating preset:', error);
    throw error;
  }
}

export async function deletePreset(id, thumbnailUrl) {
  try {
    if (thumbnailUrl) {
      const path = thumbnailUrl.split('/').slice(-2).join('/');
      await supabase.storage.from(THUMBNAIL_BUCKET).remove([path]);
    }

    const { error } = await supabase
      .from('staff_slide_presets_portal123')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting preset:', error);
    throw error;
  }
}
