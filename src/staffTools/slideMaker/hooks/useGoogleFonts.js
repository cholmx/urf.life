import { useEffect, useState } from 'react';

// Always needed regardless of what's in the Fonts tab's library - the
// fallback pairing (see HEADLINE_FONT/BODY_FONT in constants/data.js)
// every automatic slide falls back to when no pairing has been imported
// yet.
const FIXED_FONTS = [
  { font: 'Inter Tight', weight: 700, italic: false },
  { font: 'Playfair Display', weight: 400, italic: true },
];

function fontKey(font, weight, italic) {
  return `${font}__${weight}__${italic ? 1 : 0}`;
}

// The shorthand string the CSS Font Loading API (document.fonts.load)
// expects - a size is required by the spec but irrelevant to which font
// file it fetches.
function fontLoadSpec(font, weight, italic) {
  return `${italic ? 'italic ' : ''}${weight} 16px "${font}"`;
}

// Loads exactly the Google Fonts weight/style combos this session
// actually needs: the two fixed fonts above, plus every headline/
// subhead font any pairing in `fontPairings` (the Fonts tab's live,
// staff-managed library - see fontPairingService's getFontPairings)
// currently uses, each at its own one weight/style - no font picker,
// so there's no reason to pull in a whole family's weight range. Reacts
// to the library growing or shrinking (importing built-ins, adding or
// deleting a pairing) by re-injecting the stylesheet link with the new
// combined set.
//
// Returns true once those fonts are actually usable, not just
// requested - injecting the <link> alone doesn't block anything: the
// stylesheet fetch is async, and a canvas ctx.font draw that names a
// family before its file has finished loading silently falls back to
// the generic family instead of erroring or waiting (CSS text, unlike
// canvas text, just reflows once the font arrives - a canvas never
// redraws itself). That's what let a freshly generated queue slide
// render in the wrong face the instant after this stylesheet was first
// injected, correcting itself only once something else (a later
// regenerate) happened to redraw after the font had finished loading.
// Callers that draw to a canvas (SlideMaker's queue-preview generation)
// should gate on this before rendering; callers that only need an HTML
// element to eventually show the right font (FontsTab's own live typed-
// in preview) don't need to wait on it at all.
export default function useGoogleFonts(fontPairings = []) {
  const combos = [...FIXED_FONTS];
  for (const p of fontPairings) {
    combos.push({ font: p.hFont, weight: p.hWeight, italic: p.hItalic });
    combos.push({ font: p.bFont, weight: p.bWeight, italic: p.bItalic });
  }
  const seen = new Set();
  const unique = combos.filter(c => {
    const key = fontKey(c.font, c.weight, c.italic);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const depKey = unique.map(c => fontKey(c.font, c.weight, c.italic)).sort().join('|');

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    const markReady = () => { if (!cancelled) setReady(true); };

    if (!document.fonts) {
      // No Font Loading API (very old browser) - nothing to gate on.
      markReady();
      return;
    }

    const link = document.createElement("link");
    const params = unique.map(c => {
      const fam = encodeURIComponent(c.font).replace(/%20/g, '+');
      const axis = c.italic ? `ital,wght@1,${c.weight}` : `wght@${c.weight}`;
      return `family=${fam}:${axis}`;
    });
    link.href = `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`;
    link.rel = "stylesheet";
    link.onload = () => {
      // The stylesheet's @font-face rules are registered now - ask the
      // Font Loading API to actually fetch/parse each weight/style this
      // session needs before marking ready.
      Promise.all(unique.map(c => document.fonts.load(fontLoadSpec(c.font, c.weight, c.italic)).catch(() => null)))
        .then(markReady)
        .catch(markReady);
    };
    link.onerror = markReady; // don't block forever if the stylesheet itself fails to load
    document.head.appendChild(link);

    return () => {
      cancelled = true;
      document.head.removeChild(link);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);

  return ready;
}
