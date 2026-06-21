import { tailwindColorMap } from './src/shared/config/colors.ts';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  important: '#root',
  theme: {
    extend: {
      colors: tailwindColorMap,
      fontFamily: {
        sans: ['"Inter"', '"Roboto"', '"Helvetica"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
