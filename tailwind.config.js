/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E3060B',
          'red-dark': '#C20408',
          teal: '#008F8F',
          'teal-dark': '#007C7C',
          bg: '#F7F9FC',
          border: '#E0E6EF',
          text: '#111827',
          subtext: '#94A3B8',
          'soft-red': '#FFF0F0',
          'soft-teal': '#EFFAFA',
          green: '#10B981', // For active/online indicators only
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -1px rgba(0, 0, 0, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 20px -2px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'nav': '0 -4px 16px rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.85)' },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 1.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
