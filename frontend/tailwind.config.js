/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cool, near-black slate surfaces. No pure black anywhere.
        surface: {
          975: '#05080f',
          950: '#080c17',
          925: '#0a0f1c',
          900: '#0d1322',
          875: '#101729',
          850: '#131c33',
          800: '#172238',
          750: '#1c2944',
          700: '#243456',
          600: '#324167',
          500: '#475571',
        },
        // Single, restrained cobalt accent. No purple/cyan rainbow.
        brand: {
          50:  '#eef4ff',
          100: '#dde9ff',
          200: '#bdd3ff',
          300: '#94b5ff',
          400: '#6691ff',
          500: '#3b6bf7',
          600: '#2a52d6',
          700: '#1f3eae',
          800: '#1c3387',
          900: '#1a2d6b',
          950: '#142048',
        },
      },
      fontFamily: {
        sans: [
          'Geist',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
        display: [
          'Instrument Serif',
          'ui-serif',
          'Georgia',
          'serif',
        ],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        'inner-border': 'inset 0 0 0 1px rgb(255 255 255 / 0.05)',
        card:
          '0 1px 0 0 rgb(255 255 255 / 0.025), 0 1px 2px 0 rgb(0 0 0 / 0.4), 0 8px 32px -16px rgb(0 0 0 / 0.6)',
        focus: '0 0 0 4px rgb(59 107 247 / 0.22)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-in':       'fade-in 180ms ease-out',
        'slide-up':      'slide-up 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right':'slide-in-right 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer:         'shimmer 1.4s linear infinite',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-32': '32px 32px',
      },
    },
  },
  plugins: [],
};
