/**
 * Tokens de color centralizados.
 * Fuente única para MUI (theme.ts) y Tailwind (tailwind.config.js).
 */
export const colorTokens = {
  primary: {
    main: '#1565c0',
    light: '#42a5f5',
    dark: '#0d47a1',
    contrast: '#ffffff',
    50: '#e3f2fd',
    100: '#bbdefb',
    500: '#2196f3',
    700: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    main: '#f57c00',
    light: '#ffb74d',
    dark: '#e65100',
    contrast: '#ffffff',
    500: '#ff9800',
    700: '#f57c00',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    sidebar: '#0d47a1',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    inverse: '#ffffff',
    muted: '#9e9e9e',
  },
  border: {
    default: '#e0e0e0',
    focus: '#1565c0',
  },
  status: {
    success: '#2e7d32',
    error: '#d32f2f',
    warning: '#ed6c02',
    info: '#0288d1',
  },
  sidebar: {
    bg: '#0d47a1',
    hover: '#1565c0',
    active: '#1976d2',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.7)',
  },
} as const;

export type ColorTokens = typeof colorTokens;

/** Subconjunto para Tailwind `theme.extend.colors` */
export const tailwindColorMap = {
  primary: {
    50: colorTokens.primary[50],
    100: colorTokens.primary[100],
    500: colorTokens.primary[500],
    700: colorTokens.primary[700],
    900: colorTokens.primary[900],
  },
  secondary: {
    500: colorTokens.secondary[500],
    700: colorTokens.secondary[700],
  },
  surface: {
    DEFAULT: colorTokens.background.paper,
    muted: colorTokens.background.default,
  },
  status: colorTokens.status,
} as const;
