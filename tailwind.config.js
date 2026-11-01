// Six literal colors, nothing else. The app (public site and admin alike)
// leans on Tailwind's built-in gray/red/green/yellow/amber/orange/blue/
// purple scales in dozens of places (delete buttons, status badges, toast
// colors, category tags) - overriding each of those scales here, instead
// of hand-editing every call site, is what actually makes "every color on
// the site is one of these six" true rather than true-except-wherever a
// stock Tailwind color slipped in unnoticed. Each ramp collapses to cream/
// white at its light end, near-black at its dark end, with `main` (one of
// the six) standing in for the whole 400-600 "this is the color" range -
// a UI needs more lightness steps than six flat colors give it on their
// own, so this is a discrete, posterized ramp, not a smooth gradient:
// every step is one of the six exactly, never a blend between them.
const sixColorRamp = (main) => ({
  50: '#FFFFFF', 100: '#FFFFFF',
  200: main, 300: main, 400: main, 500: main, 600: main,
  700: '#1E2522', 800: '#1E2522', 900: '#1E2522', 950: '#1E2522',
});

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Site palette - E1DCD1/FFFFFF/EAA235/2B433E/1E2522/C74F2F.
        primary: '#2B433E',
        secondary: '#1E2522',
        accent: '#E1DCD1', // page background
        'accent-light': '#FFFFFF',
        'accent-dark': '#2B433E',

        'text-primary': '#1E2522',
        'text-secondary': '#1E2522',
        'text-light': '#2B433E',

        'brand-yellow': '#EAA235',
        'brand-blue': '#2B433E',
        'brand-blue-dark': '#1E2522',

        'white': '#FFFFFF',
        'social-green': '#2B433E',
        'brand-red': '#C74F2F',

        // Tailwind's stock scales, collapsed onto the six colors (see
        // sixColorRamp above) instead of staying their default hues -
        // red/orange as the red accent, green as the green primary,
        // yellow/amber/purple as the gold accent (no purple in this
        // palette), blue also as the green primary (no blue either),
        // gray and neutral both as the same cream/white/green/near-black
        // ramp as each other.
        gray:    sixColorRamp('#2B433E'),
        neutral: sixColorRamp('#2B433E'),
        red:     sixColorRamp('#C74F2F'),
        orange:  sixColorRamp('#C74F2F'),
        green:   sixColorRamp('#2B433E'),
        blue:    sixColorRamp('#2B433E'),
        yellow:  sixColorRamp('#EAA235'),
        amber:   sixColorRamp('#EAA235'),
        purple:  sixColorRamp('#EAA235'),
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'heading': ['"Google Sans Flex"', 'Inter', 'sans-serif'],
        'display': ['"Google Sans Flex"', 'Inter', 'sans-serif'],

        // New design system typography
        'gsans': ['"Google Sans Flex"', 'Inter', 'sans-serif'],
        'caladea': ['Caladea', 'Georgia', 'serif'],
        'ui': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      boxShadow: {
        'soft': '8px 8px 16px #1E2522, -8px -8px 16px #FFFFFF',
        'soft-inset': 'inset 8px 8px 16px #1E2522, inset -8px -8px 16px #FFFFFF',
        'modern': '0 2px 8px rgba(0,0,0,0.06), 0 8px 20px -4px rgba(0,0,0,0.07)',
        'modern-lg': '0 4px 16px rgba(0,0,0,0.08), 0 16px 32px -8px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}