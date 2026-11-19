import { supabase } from './supabaseClient';

// Confirms a Google Fonts family actually exists at the given
// weight/style before anything gets saved. The CSS2 API answers a
// valid combo with CORS headers (fetch resolves, response.ok) but an
// unknown family or an unsupported weight on a real one (e.g. asking
// Anton, a single-weight font, for 300) with a plain 400 and no CORS
// headers at all - the browser can't let this page read that response,
// so fetch() throws instead of resolving to a non-ok response. Both
// outcomes mean the same thing here (that combo isn't real), so a
// thrown fetch is treated as "not found," not a network failure worth
// surfacing as one.
async function googleFontExists(family, weight, italic) {
  const familyParam = encodeURIComponent(family).replace(/%20/g, '+');
  const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
  const url = `https://fonts.googleapis.com/css2?family=${familyParam}:${axis}&display=swap`;
  try {
    const response = await fetch(url, { method: 'GET' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

function rowToPairing(row) {
  return {
    id: row.id,
    hFont: row.h_font,
    hGeneric: row.h_generic,
    hWeight: row.h_weight,
    hItalic: row.h_italic,
    hUppercase: row.h_uppercase,
    hSizeScale: row.h_size_scale ?? 1,
    bFont: row.b_font,
    bGeneric: row.b_generic,
    bWeight: row.b_weight,
    bItalic: row.b_italic,
    bSizeScale: row.b_size_scale ?? 1,
  };
}

export async function getFontPairings() {
  const { data, error } = await supabase
    .from('staff_slide_font_pairings_portal123')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data.map(rowToPairing);
}

// Validates both fonts against Google Fonts before writing anything -
// a pairing with a typo'd family name would otherwise sit in the pool
// silently falling back to the browser's default serif/sans-serif on
// every slide that picks it.
export async function addFontPairing(pairing) {
  const [hOk, bOk] = await Promise.all([
    googleFontExists(pairing.hFont, pairing.hWeight, pairing.hItalic),
    googleFontExists(pairing.bFont, pairing.bWeight, pairing.bItalic),
  ]);
  if (!hOk) throw new Error(`"${pairing.hFont}" at weight ${pairing.hWeight}${pairing.hItalic ? ' italic' : ''} isn't a real Google Fonts combination.`);
  if (!bOk) throw new Error(`"${pairing.bFont}" at weight ${pairing.bWeight}${pairing.bItalic ? ' italic' : ''} isn't a real Google Fonts combination.`);

  const { data, error } = await supabase
    .from('staff_slide_font_pairings_portal123')
    .insert({
      h_font: pairing.hFont,
      h_generic: pairing.hGeneric,
      h_weight: pairing.hWeight,
      h_italic: pairing.hItalic,
      h_uppercase: pairing.hUppercase,
      h_size_scale: pairing.hSizeScale ?? 1,
      b_font: pairing.bFont,
      b_generic: pairing.bGeneric,
      b_weight: pairing.bWeight,
      b_italic: pairing.bItalic,
      b_size_scale: pairing.bSizeScale ?? 1,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToPairing(data);
}

export async function deleteFontPairing(id) {
  const { error } = await supabase
    .from('staff_slide_font_pairings_portal123')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Pulls one of the app's bundled BUILT_IN_FONT_PAIRINGS (constants/
// data.js) in as a real library row, so it behaves exactly like a
// pairing staff add themselves - same validation, same delete control -
// instead of living as a separate hardcoded list. Used by the Fonts
// tab's one-time "Import built-in pairings" action, same idea as
// photoService's importBuiltInTexture / markService's importBuiltInMark.
export async function importBuiltInFontPairing(pairing) {
  return addFontPairing(pairing);
}
