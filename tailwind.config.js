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
        kj: {
          blue: '#0052FF',
          teal: '#0D9488',
          orange: '#D97706',
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        primary: {
          50: '#eef4ff',
          100: '#dce7ff',
          200: '#bed3ff',
          300: '#91b4ff',
          400: '#5c8cff',
          500: '#2668ff',
          600: '#0052FF',
          700: '#0042d4',
          800: '#0036ab',
          900: '#002c88',
          950: '#001a54',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.05)',
        'card-hover': '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'elevated': '0 10px 25px -5px rgba(15, 23, 42, 0.09), 0 4px 10px -6px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
