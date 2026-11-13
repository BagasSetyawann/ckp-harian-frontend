/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5fa',
          100: '#dce7f3',
          200: '#bdd1e8',
          300: '#91b4da',
          400: '#5e8ec6',
          500: '#2d66a3',
          600: '#0f3d6e',
          700: '#0b2f56',
          800: '#082342',
          900: '#05172d',
          950: '#030d1a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        government: {
          red: '#dc2626',
          gold: '#d97706',
          blue: '#0f3d6e',
          green: '#059669',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 12px -2px rgba(15, 23, 42, 0.08)',
        'elevated': '0 10px 30px -10px rgba(15, 23, 42, 0.12)',
      }
    },
  },
  plugins: [],
}
