// tailwind.config.js
// eslint-disable-next-line @typescript-eslint/no-require-imports -- this file is CommonJS (no "type": "module" in package.json), so require() is correct here, not an ESM import
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      colors: {
        netflix: {
          red: '#E50914',
          'red-hover': '#F40612',
          dark: '#141414',
          light: '#E5E5E5',
        }
      },
      fontFamily: {
        sans: ['var(--font-body)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-display)', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-out',
      },
    },
  },
  plugins: [],
}