import { useEffect } from 'react';

// Every font the Slide Maker ever draws onto a slide, loaded at exactly
// the one weight/style each is actually used at - no font picker, so
// there's no reason to pull in a whole family's weight range the way
// this hook used to. Inter Tight (700, upright) and Playfair Display
// (400, italic) are the Custom Editor's own fixed pairing (see
// HEADLINE_FONT/BODY_FONT in constants/data.js); the rest are only used
// by the automatic slide maker's AUTO_FONT_PAIRINGS, one weight/style
// each - see that array for which font plays which role in which
// pairing.
export default function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?"
      + "family=Inter+Tight:wght@700"
      + "&family=Playfair+Display:ital,wght@1,400"
      + "&family=Google+Sans+Flex:wght@900"
      + "&family=Newsreader:wght@400"
      + "&family=Archivo+Black"
      + "&family=Source+Serif+4:wght@400"
      + "&family=Montserrat:wght@900"
      + "&family=Lora:wght@400"
      + "&family=Anton"
      + "&family=Merriweather:wght@300"
      + "&family=Fraunces:wght@900"
      + "&family=Spectral:wght@400"
      + "&family=Rubik:wght@900"
      + "&family=PT+Serif:wght@400"
      + "&family=Work+Sans:wght@900"
      + "&family=Libre+Baskerville:wght@400"
      + "&family=Outfit:wght@900"
      + "&family=Petrona:wght@400"
      + "&family=Poppins:wght@900"
      + "&family=Cormorant+Garamond:wght@500"
      + "&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);
}