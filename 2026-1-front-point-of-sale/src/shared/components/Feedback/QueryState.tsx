import { ReactNode } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { appAssets } from '../../config/assets';

interface QueryStateProps {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  children: ReactNode;
}

function QueryState({
  isLoading,
  isError,
  isEmpty,
  errorMessage = 'No se pudo cargar la informacion.',
  emptyMessage = 'No hay registros para mostrar.',
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <Box className="flex min-h-[240px] items-center justify-center">
        <CircularProgress aria-label="Cargando" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="flex min-h-[240px] flex-col items-center justify-center gap-3">
        <Box component="img" src={appAssets.images.errorState} alt="" sx={{ width: 120, opacity: 0.9 }} />
        <Alert severity="error">{errorMessage}</Alert>
      </Box>
    );
  }

  if (isEmpty) {
    return (
      <Box className="flex min-h-[240px] flex-col items-center justify-center gap-2 py-8">
        <Box component="img" src={appAssets.images.emptyState} alt="" sx={{ width: 140, opacity: 0.85 }} />
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return <>{children}</>;
}

export default QueryState;
