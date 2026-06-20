/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  /**
   * Deshabilitamos preflight para evitar conflictos con MUI CssBaseline.
   * Tailwind se usa para utilidades de layout, spacing, tipografía y responsive;
   * MUI se usa para componentes de UI (botones, inputs, dialogs, etc.).
   */
  corePlugins: {
    preflight: false,
  },
  /**
   * important: '#root' asegura que las clases de Tailwind tengan
   * mayor especificidad que los estilos en línea de MUI cuando sea necesario.
   */
  important: '#root',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          500: '#2196f3',
          700: '#1565c0',
          900: '#0d47a1',
        },
        secondary: {
          500: '#ff9800',
          700: '#f57c00',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Roboto"', '"Helvetica"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
