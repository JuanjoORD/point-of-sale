import { useState } from 'react';
import { Alert, Box, Grid, Snackbar, Typography } from '@mui/material';
import PermissionGuard from '@/shared/components/PermissionGuard';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import ProductSearchPanel from '../components/ProductSearchPanel';
import CartPanel from '../components/CartPanel';

function SalesPage() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showFeedback = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <PermissionGuard permiso={PERMISSIONS.VENTAS_CREAR}>
      <Box className="flex flex-col gap-4">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Punto de venta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Busca productos por nombre o codigo de barras, arma el carrito y confirma la venta.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <ProductSearchPanel onFeedback={showFeedback} />
          </Grid>
          <Grid item xs={12} lg={5}>
            <CartPanel onFeedback={showFeedback} />
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PermissionGuard>
  );
}

export default SalesPage;
