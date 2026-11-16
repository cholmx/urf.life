import { useEffect } from 'react';

// The only two fonts the Slide Maker uses now (see constants/data.js's
// HEADLINE_FONT/BODY_FONT and AUTO_FONT_PAIRINGS) - no font picker left
// to preview other families, so there's no reason to pull in a couple
// dozen Google Fonts families the way this hook used to. Bitter needs
// weights 400 (the Custom Editor's subhead) and 900 (the automatic slide
// maker's Bitter Black headline pairing), both in upright and italic
// faces, since both roles can land on italic depending on which auto
// font pairing gets picked - see computeAutoSlide in SlideMaker.jsx.
export default function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700&family=Bitter:ital,wght@0,400;0,900;1,400;1,900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);
}