/**
 * Rutas centralizadas de logos e imagenes de la aplicacion.
 * Colocar archivos en /public y referenciarlos aqui.
 */
export const appAssets = {
  brand: {
    name: 'POS Inventario',
    shortName: 'POS',
    logo: '/assets/logo.svg',
    logoCompact: '/assets/logo-compact.svg',
    favicon: '/favicon.ico',
  },
  images: {
    loginBackground: '/assets/images/login-background.svg',
    emptyState: '/assets/images/empty-state.svg',
    errorState: '/assets/images/error-state.svg',
  },
} as const;

export type AppAssets = typeof appAssets;
