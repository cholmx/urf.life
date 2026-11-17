import { useEffect } from 'react';

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

// Loads exactly the Google Fonts weight/style combos this session
// actually needs: the two fixed fonts above, plus every headline/
// subhead font any pairing in `fontPairings` (the Fonts tab's live,
// staff-managed library - see fontPairingService's getFontPairings)
// currently uses, each at its own one weight/style - no font picker,
// so there's no reason to pull in a whole family's weight range. Reacts
// to the library growing or shrinking (importing built-ins, adding or
// deleting a pairing) by re-injecting the stylesheet link with the new
// combined set.
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

  useEffect(() => {
    const link = document.createElement("link");
    const params = unique.map(c => {
      const fam = encodeURIComponent(c.font).replace(/%20/g, '+');
      const axis = c.italic ? `ital,wght@1,${c.weight}` : `wght@${c.weight}`;
      return `family=${fam}:${axis}`;
    });
    link.href = `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);
}
