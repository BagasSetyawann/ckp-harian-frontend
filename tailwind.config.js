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
          teal: '#00B4D8',
          orange: '#FF6B35',
          light: '#F4F6F9',
          dark: '#1E293B',
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
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'neo-xs': '2px 2px 0px #1E293B',
        'neo-sm': '2px 3px 0px #1E293B',
        'neo': '3px 4px 0px #1E293B',
        'neo-lg': '5px 6px 0px #1E293B',
        'neo-dark-xs': '2px 2px 0px #020617',
        'neo-dark-sm': '2px 3px 0px #020617',
        'neo-dark': '3px 4px 0px #020617',
        'card': '3px 4px 0px #1E293B',
        'card-hover': '5px 6px 0px #1E293B',
        'elevated': '6px 8px 0px #1E293B',
      }
    },
  },
  plugins: [],
}
