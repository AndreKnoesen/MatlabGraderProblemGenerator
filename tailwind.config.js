/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.tsx',
    './components/**/*.tsx',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      colors: {
        brand: {
          dark:   '#1F4E79',
          accent: '#2E75B6',
          light:  '#D6E4F0',
          green:  '#217346',
        },
      },
    },
  },
  plugins: [],
};
