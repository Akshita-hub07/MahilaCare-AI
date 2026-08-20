/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nari: {
          lavender: '#A78BFA',
          'lavender-light': '#F3E8FF',
          teal: '#14B8A6',
          'teal-light': '#CCFBF1',
          pink: '#FCE7F3',
          'pink-dark': '#F472B6',
          grey: '#F8FAFC',
          dark: '#1E1B4B'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(167, 139, 250, 0.15)',
        'soft-teal': '0 10px 30px -10px rgba(20, 184, 166, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}
