/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Site palette - F7F5EE/FFFFFF/D49E46/3E584D/1E2522/CC4733, used
        // everywhere (public site and admin alike). A few of these entries
        // are necessarily derived tints/ramps rather than one of those six
        // literal hexes (a UI needs more lightness steps than six flat
        // colors can give it - button hover states, subtle borders,
        // muted-vs-primary text - every derived value below is still
        // anchored to one of the six, never an unrelated hue).
        primary: '#3E584D',
        secondary: '#1E2522',
        accent: '#F7F5EE', // page background
        'accent-light': '#FFFFFF',
        'accent-dark': 'rgba(30, 37, 34, 0.15)', // subtle borders/section fills

        'text-primary': '#1E2522',
        'text-secondary': '#1E2522',
        'text-light': '#3E584D', // muted/secondary copy - no gray in this palette, so it reads in the muted green instead

        'brand-yellow': '#D49E46',
        'brand-blue': '#3E584D',
        'brand-blue-dark': '#1E2522',

        'white': '#FFFFFF',
        'social-green': '#3E584D',

        // Pop/alert color - already used verbatim as a literal hex in a
        // handful of places (Home's hover state, PageNav's Home button);
        // named here too so new work can reference it as a token instead
        // of repeating the hex.
        'brand-red': '#CC4733',

        // Tailwind's built-in neutral-50..900 scale, which the older admin
        // screens (Rentals, Resources, Sermons, Staff Contacts, etc.) use
        // directly - overridden end to end so admin matches the same
        // palette instead of staying plain gray. Interpolated from the
        // cream background down to the near-black text color, leaning
        // toward the muted green through the middle of the ramp rather
        // than a flat gray.
        neutral: {
          50:  '#F7F5EE',
          100: '#EFEBDF',
          200: '#DED9C8',
          300: '#C3BEAC',
          400: '#9B9A8A',
          500: '#767D70',
          600: '#5C6B5D',
          700: '#44564A',
          800: '#2E3B33',
          900: '#1E2522',
          950: '#141917',
        },
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
        'soft': '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
        'soft-inset': 'inset 8px 8px 16px #d1d9e6, inset -8px -8px 16px #ffffff',
        'modern': '0 2px 8px rgba(0,0,0,0.06), 0 8px 20px -4px rgba(0,0,0,0.07)',
        'modern-lg': '0 4px 16px rgba(0,0,0,0.08), 0 16px 32px -8px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}