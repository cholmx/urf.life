import { useEffect } from 'react';

// The only two fonts the Slide Maker uses now (see constants/data.js's
// HEADLINE_FONT/BODY_FONT and AUTO_FONT_PAIRINGS) - no font picker left
// to preview other families, so there's no reason to pull in a couple
// dozen Google Fonts families the way this hook used to. Bitter needs
// both weights (400 for the Custom Editor's subhead, 700 for the
// automatic slide maker's headline) in both upright and italic faces,
// since both roles can land on italic depending on which auto font
// pairing gets picked - see computeAutoSlide in SlideMaker.jsx.
export default function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700&family=Bitter:ital,wght@0,400;0,700;1,400;1,700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);
}