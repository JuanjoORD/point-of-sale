import { createTheme } from '@mui/material';
import { colorTokens } from './config/colors';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colorTokens.primary.main,
      light: colorTokens.primary.light,
      dark: colorTokens.primary.dark,
      contrastText: colorTokens.primary.contrast,
    },
    secondary: {
      main: colorTokens.secondary.main,
      light: colorTokens.secondary.light,
      dark: colorTokens.secondary.dark,
      contrastText: colorTokens.secondary.contrast,
    },
    background: {
      default: colorTokens.background.default,
      paper: colorTokens.background.paper,
    },
    text: {
      primary: colorTokens.text.primary,
      secondary: colorTokens.text.secondary,
    },
    success: { main: colorTokens.status.success },
    error: { main: colorTokens.status.error },
    warning: { main: colorTokens.status.warning },
    info: { main: colorTokens.status.info },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});
