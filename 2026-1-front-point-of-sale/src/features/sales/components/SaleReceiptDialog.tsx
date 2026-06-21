import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { VentaResumen } from '../types/sales.types';

const formatMoney = (value: number): string =>
  new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

interface SaleReceiptDialogProps {
  open: boolean;
  venta: VentaResumen | null;
  onClose: () => void;
}

function SaleReceiptDialog({ open, venta, onClose }: SaleReceiptDialogProps) {
  if (!venta) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Venta registrada</DialogTitle>
      <DialogContent>
        <Alert severity="success" sx={{ mb: 2 }}>
          Comprobante #{venta.numero_venta}
        </Alert>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Cliente: {venta.nombre_cliente}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Ubicacion: {venta.nombre_ubicacion}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <List dense disablePadding>
          {venta.detalle.map((linea) => (
            <ListItem key={linea.id_producto} disableGutters>
              <ListItemText
                primary={`${linea.nombre_producto} x ${linea.cantidad}`}
                secondary={`Q ${formatMoney(linea.total_linea)}`}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box className="flex flex-col gap-1">
          <Box className="flex justify-between">
            <Typography variant="body2">Subtotal</Typography>
            <Typography variant="body2">Q {formatMoney(venta.subtotal)}</Typography>
          </Box>
          {venta.descuento_total > 0 && (
            <Box className="flex justify-between">
              <Typography variant="body2">Descuento</Typography>
              <Typography variant="body2">- Q {formatMoney(venta.descuento_total)}</Typography>
            </Box>
          )}
          <Box className="flex justify-between">
            <Typography variant="subtitle1" fontWeight={700}>
              Total
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Q {formatMoney(venta.total)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={onClose} fullWidth>
          Nueva venta
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaleReceiptDialog;
