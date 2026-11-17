import { supabase } from './supabaseClient';

function rowToBackground(row) {
  return {
    id: row.id,
    name: row.name,
    hex: row.hex,
    textColors: (row.text_colors || []).map(tc => ({name: tc.name, hex: tc.hex})),
    inAutoRotation: row.in_auto_rotation,
    role: row.role,
  };
}

export async function getBackgroundColors() {
  const { data, error } = await supabase
    .from('staff_slide_background_colors_portal123')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data.map(rowToBackground);
}

// `role` is only ever passed by importBuiltInBackgroundColor seeding the
// two structural dark/light buckets - the Palette tab's own "Add a
// Background" form never sets it, so anything staff add themselves is
// always purely decorative (deletable, no bucket duties).
export async function addBackgroundColor({name, hex, textColors, inAutoRotation, role}) {
  const { data, error } = await supabase
    .from('staff_slide_background_colors_portal123')
    .insert({
      name, hex,
      text_colors: textColors,
      in_auto_rotation: inAutoRotation,
      ...(role ? {role} : {}),
    })
    .select()
    .single();

  if (error) throw error;
  return rowToBackground(data);
}

export async function updateBackgroundColor(id, patch) {
  const dbPatch = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.hex !== undefined) dbPatch.hex = patch.hex;
  if (patch.textColors !== undefined) dbPatch.text_colors = patch.textColors;
  if (patch.inAutoRotation !== undefined) dbPatch.in_auto_rotation = patch.inAutoRotation;

  const { data, error } = await supabase
    .from('staff_slide_background_colors_portal123')
    .update(dbPatch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToBackground(data);
}

// Deletable even if it carries a bucket role (dark_bucket/light_bucket) -
// staff asked for full control over the palette, including the two
// starter backgrounds. findBucket in SlideMaker.jsx falls back to a
// hardcoded dark/light pair when no row holds a given role, so the
// automatic generator keeps working with photo backgrounds either way;
// the Palette tab just warns about that fallback before confirming the
// delete (see PaletteTab.jsx's confirmDeleteBg).
export async function deleteBackgroundColor(id) {
  const { error } = await supabase
    .from('staff_slide_background_colors_portal123')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Pulls one of the app's bundled BUILT_IN_BACKGROUND_COLORS (constants/
// data.js) in as a real library row, so it behaves exactly like a
// background staff add themselves - same storage, same text-color/
// rotation controls - instead of living as a separate hardcoded list.
// Used by the Palette tab's one-time "Import built-in backgrounds"
// action, same idea as markService's importBuiltInMark /
// fontPairingService's importBuiltInFontPairing.
export async function importBuiltInBackgroundColor(seed) {
  return addBackgroundColor(seed);
}
