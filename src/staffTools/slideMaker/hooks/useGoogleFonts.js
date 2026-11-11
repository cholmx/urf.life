import { useEffect } from 'react';

// The only two fonts the Slide Maker uses now (see constants/data.js's
// HEADLINE_FONT/BODY_FONT) - no font picker left to preview other
// families, so there's no reason to pull in a couple dozen Google Fonts
// families the way this hook used to.
export default function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700&family=Aleo:wght@400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);
}