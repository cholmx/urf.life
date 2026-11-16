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

// A background carrying a bucket role (dark_bucket/light_bucket) is
// structural - the automatic generator always needs exactly one of
// each to sort a photo's brightness into (see autoBrandForBrightness in
// SlideMaker.jsx) - so deleting one is refused here, not just hidden in
// the UI, in case anything else ever calls this directly.
export async function deleteBackgroundColor(id, role) {
  if (role) {
    throw new Error("This background is needed for photo-based automatic slides and can't be deleted - edit its color or text options instead.");
  }
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
