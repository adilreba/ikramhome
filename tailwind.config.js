/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          soft: 'rgb(var(--c-ink-soft) / <alpha-value>)',
          mute: 'rgb(var(--c-ink-mute) / <alpha-value>)',
        },
        cream: {
          DEFAULT: 'rgb(var(--c-cream) / <alpha-value>)',
          deep: 'rgb(var(--c-cream-deep) / <alpha-value>)',
          line: 'rgb(var(--c-cream-line) / <alpha-value>)',
        },
        clay: {
          DEFAULT: 'rgb(var(--c-clay) / <alpha-value>)',
          dark: 'rgb(var(--c-clay-dark) / <alpha-value>)',
          light: 'rgb(var(--c-clay-light) / <alpha-value>)',
        },
        wa: { DEFAULT: '#25D366', dark: '#128C4B' },
        wine: { DEFAULT: '#8B1E42', dark: '#6B1733', light: '#C65A7E' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(27,25,22,.04), 0 8px 24px -12px rgba(27,25,22,.18)',
        lift: '0 2px 4px rgba(27,25,22,.06), 0 24px 48px -20px rgba(27,25,22,.35)',
        gold: '0 0 0 1px rgba(212,175,90,.35), 0 20px 50px -18px rgba(212,175,90,.45)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'none' } },
        'slide-in': { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'none' } },
        pop: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.25)' }, '100%': { transform: 'scale(1)' } },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, -6%) scale(1.08)' },
          '66%': { transform: 'translate(-3%, 4%) scale(0.95)' },
        },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(212,175,90,.55)' },
          '100%': { boxShadow: '0 0 0 14px rgba(212,175,90,0)' },
        },
        'reveal-up': { '0%': { opacity: 0, transform: 'translateY(28px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.2,.7,.2,1) both',
        'slide-in': 'slide-in .35s cubic-bezier(.2,.7,.2,1) both',
        pop: 'pop .35s ease',
        blob: 'blob 16s ease-in-out infinite',
        'blob-slow': 'blob 22s ease-in-out infinite reverse',
        shimmer: 'shimmer 3.5s linear infinite',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(.4,0,.6,1) infinite',
        'reveal-up': 'reveal-up .7s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
};
