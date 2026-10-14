/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1B1916', soft: '#3A3631', mute: '#7A736A' },
        cream: { DEFAULT: '#F7F3EE', deep: '#EFE8DF', line: '#E4DBCF' },
        clay: { DEFAULT: '#B5603A', dark: '#94492A', light: '#F3E2D8' },
        wa: { DEFAULT: '#25D366', dark: '#128C4B' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(27,25,22,.04), 0 8px 24px -12px rgba(27,25,22,.18)',
        lift: '0 2px 4px rgba(27,25,22,.06), 0 24px 48px -20px rgba(27,25,22,.35)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'none' } },
        'slide-in': { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'none' } },
        pop: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.25)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.2,.7,.2,1) both',
        'slide-in': 'slide-in .35s cubic-bezier(.2,.7,.2,1) both',
        pop: 'pop .35s ease',
      },
    },
  },
  plugins: [],
};
