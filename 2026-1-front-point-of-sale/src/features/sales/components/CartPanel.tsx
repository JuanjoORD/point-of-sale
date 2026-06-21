import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { appAssets } from '@/shared/config/assets';
import { useCartStore } from '../store/cartStore';
import CheckoutPanel from './CheckoutPanel';

const formatMoney = (value: number): string =>
  new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

interface CartPanelProps {
  onFeedback: (message: string, severity: 'success' | 'error') => void;
}

function CartPanel({ onFeedback }: CartPanelProps) {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const totalItems = useCartStore((state) => state.getTotalItems());

  const handleQuantityChange = (id_producto: number, cantidad: number) => {
    const result = setQuantity(id_producto, cantidad);
    if (!result.ok) {
      onFeedback(result.error ?? 'Cantidad invalida.', 'error');
    }
  };

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Carrito
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalItems} {totalItems === 1 ? 'articulo' : 'articulos'}
          </Typography>
        </Box>
        {items.length > 0 && (
          <Button size="small" color="inherit" onClick={clear}>
            Vaciar
          </Button>
        )}
      </Box>

      {items.length === 0 ? (
        <Box className="flex flex-col items-center justify-center gap-2 py-10">
          <Box component="img" src={appAssets.images.emptyState} alt="" sx={{ width: 120, opacity: 0.85 }} />
          <Typography color="text.secondary">El carrito esta vacio</Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="center">Cant.</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id_producto}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.nombre_producto}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Q {formatMoney(item.precio_venta)}
                        {!item.es_servicio && item.stock_disponible !== null
                          ? ` · Stock: ${item.stock_disponible}`
                          : ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box className="inline-flex items-center gap-0.5">
                        <IconButton
                          size="small"
                          aria-label="Disminuir cantidad"
                          onClick={() => handleQuantityChange(item.id_producto, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          value={item.cantidad}
                          onChange={(e) => {
                            const parsed = parseFloat(e.target.value);
                            if (!Number.isNaN(parsed)) {
                              handleQuantityChange(item.id_producto, parsed);
                            }
                          }}
                          inputProps={{ min: 1, step: 1, style: { textAlign: 'center', width: 48 } }}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          aria-label="Aumentar cantidad"
                          onClick={() => handleQuantityChange(item.id_producto, item.cantidad + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      Q {formatMoney(item.precio_venta * item.cantidad)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="Quitar del carrito"
                        onClick={() => removeItem(item.id_producto)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <CheckoutPanel onFeedback={onFeedback} />
        </>
      )}
    </Paper>
  );
}

export default CartPanel;
