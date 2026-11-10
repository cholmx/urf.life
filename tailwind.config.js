import { colors, fontFamilies } from './src/styles/designTokens.js';

// Five literal colors, nothing else. The app (public site and admin alike)
// leans on Tailwind's built-in gray/red/green/yellow/amber/orange/blue/
// purple scales in dozens of places (delete buttons, status badges, toast
// colors, category tags) - overriding each of those scales here, instead
// of hand-editing every call site, is what actually makes "every color on
// the site is one of these five" true rather than true-except-wherever a
// stock Tailwind color slipped in unnoticed. Each ramp collapses to white
// at its light end, near-black at its dark end, with `main` (one of
// the five) standing in for the whole 400-600 "this is the color" range -
// a UI needs more lightness steps than five flat colors give it on their
// own, so this is a discrete, posterized ramp, not a smooth gradient:
// every step is one of the five exactly, never a blend between them.
const fiveColorRamp = (main) => ({
  50: colors.white, 100: colors.white,
  200: main, 300: main, 400: main, 500: main, 600: main,
  700: colors.secondary, 800: colors.secondary, 900: colors.secondary, 950: colors.secondary,
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
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.white, // page background
        'accent-light': colors.white,
        'accent-dark': colors.primary,

        'text-primary': colors.secondary,
        'text-secondary': colors.secondary,
        'text-light': colors.primary,

        'brand-yellow': colors.gold,
        'brand-blue': colors.primary,
        'brand-blue-dark': colors.secondary,

        'white': colors.white,
        'social-green': colors.primary,
        'brand-red': colors.red,

        // Tailwind's stock scales, collapsed onto the five colors (see
        // fiveColorRamp above) instead of staying their default hues -
        // red/orange as the red accent, green as the green primary,
        // yellow/amber/purple as the gold accent (no purple in this
        // palette), blue also as the green primary (no blue either),
        // gray and neutral both as the same white/green/near-black
        // ramp as each other.
        gray:    fiveColorRamp(colors.primary),
        neutral: fiveColorRamp(colors.primary),
        red:     fiveColorRamp(colors.red),
        orange:  fiveColorRamp(colors.red),
        green:   fiveColorRamp(colors.primary),
        blue:    fiveColorRamp(colors.primary),
        yellow:  fiveColorRamp(colors.gold),
        amber:   fiveColorRamp(colors.gold),
        purple:  fiveColorRamp(colors.gold),
      },
      fontFamily: {
        'sans': fontFamilies.body,
        'heading': fontFamilies.heading,
        'display': fontFamilies.heading,

        // New design system typography
        'gsans': fontFamilies.heading,
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