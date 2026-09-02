/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#83A682', // A softer, modern green
        secondary: '#5F5F5A', // A warm gray for text and secondary elements
        accent: '#FCFAF2', // A warm, off-white background
        'accent-light': '#FFFFFF',
        'accent-dark': '#F3F1E6',
        
        'text-primary': '#1E1E21',
        'text-secondary': '#1E1E21',
        'text-light': '#888888',

        'brand-yellow': '#E2BA49',
        'brand-blue': '#2c4747',
        'brand-blue-dark': '#1a2a2a',

        'white': '#FFFFFF',
        'social-green': '#83A682',
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