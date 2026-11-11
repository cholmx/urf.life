// The ONE place the site's colors and fonts are defined. Everything else -
// tailwind.config.js, staffComms/lib/theme.ts, the signup sheet tool, any
// future design-system consumer - imports from here instead of re-typing
// its own copy of these hexes/font stacks. Before this file existed, the
// same five colors and two fonts were hand-duplicated across at least
// three separate places (the Tailwind config, staffComms' own theme
// object, and the signup sheet tool's entirely separate ported palette),
// which is exactly how a "change this color" request kept missing spots -
// each place had to be found and edited by hand, with no way to know you'd
// found them all. Changing a value here and only here is now sufficient.
//
// Keep this file framework-agnostic (plain JS, no Tailwind/React import) so
// both an ESM config file (tailwind.config.js) and TypeScript source
// (theme.ts, with allowJs on) can import it directly.

export const colors = {
  primary: '#2B433E',    // green
  secondary: '#1E2522',  // near-black charcoal
  white: '#FFFFFF',       // every page/card/section background
  gold: '#EAA235',       // accent - hover states, highlights
  red: '#C74F2F',        // solid call-to-action buttons
};

// As arrays for tailwind.config.js's fontFamily (each entry joined with
// ", " at build time) and as the equivalent pre-joined strings for every
// other consumer - literal CSS, inline styles, generated HTML - which
// need a single font-family value, not an array.
export const fontFamilies = {
  // Headings, buttons, labels, and any larger-than-body text.
  heading: ['Arial', 'Helvetica', 'sans-serif'],
  // Body copy and small reading text.
  body: ["'Merriweather'", 'Georgia', 'serif'],
};

export const fonts = {
  heading: fontFamilies.heading.join(', '),
  body: fontFamilies.body.join(', '),
};

export const fontWeights = {
  // Headings, buttons, labels. 700 (Bold) is the heaviest weight Arial
  // has a real face for - 800+ has no true face, so browsers synthesize
  // (faux-bold) it, which looks chunky/blotchy at heading sizes rather
  // than actually bolder. Don't bump this past 700.
  heading: 700,
  body: 400,
};
