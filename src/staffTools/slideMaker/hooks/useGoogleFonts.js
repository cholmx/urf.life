import { useEffect } from 'react';

export default function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700;800;900&family=Source+Sans+3:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700;800;900&family=Lora:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Zilla+Slab:wght@400;500;600;700&family=Abril+Fatface&family=Poppins:wght@300;400;500;600;700&family=Lexend:wght@400;500;600;700;800&family=Raleway:wght@300;400;500;600;700;800&family=DM+Serif+Display&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Archivo+Black&family=Manrope:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Unbounded:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Inter+Tight:wght@400;500;600;700;800;900&family=Inconsolata:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400;1,9..144,700&family=Gloock&family=Chango&family=Caprasimo&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const geistLink = document.createElement("link");
    geistLink.href = "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap";
    geistLink.rel = "stylesheet";
    document.head.appendChild(geistLink);

    return () => {
      document.head.removeChild(link);
      if (document.head.contains(geistLink)) {
        document.head.removeChild(geistLink);
      }
    };
  }, []);
}