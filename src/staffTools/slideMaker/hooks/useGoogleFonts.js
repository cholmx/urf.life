import { useEffect } from 'react';

// The only two fonts the Slide Maker uses now (see constants/data.js's
// HEADLINE_FONT/BODY_FONT and AUTO_FONT_PAIRINGS) - no font picker left
// to preview other families, so there's no reason to pull in a couple
// dozen Google Fonts families the way this hook used to. Playfair
// Display is only ever used italic (weight 400 for the Custom Editor's
// subhead, weight 900 for the automatic slide maker's Playfair Display
// Black headline pairing - see AUTO_FONT_PAIRINGS) - no upright face is
// loaded since nothing ever renders it.
export default function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700&family=Playfair+Display:ital,wght@1,400;1,900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);
}