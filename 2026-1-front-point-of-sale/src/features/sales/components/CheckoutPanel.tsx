import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useClientes } from '@/features/customers/hooks/useClientes';
import { useUbicaciones } from '@/features/inventory/hooks/useUbicaciones';
import { appConfig } from '@/shared/config/app.config';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import { ventasApi } from '../services/ventas.service';
import { useCartStore } from '../store/cartStore';
import { VentaResumen } from '../types/sales.types';
import SaleReceiptDialog from './SaleReceiptDialog';

const formatMoney = (value: number): string =>
  new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

interface CheckoutPanelProps {
  onFeedback: (message: string, severity: 'success' | 'error') => void;
}

function CheckoutPanel({ onFeedback }: CheckoutPanelProps) {
  const { hasPermission } = useAuth();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clear);

  const canListUbicaciones = hasPermission(PERMISSIONS.INVENTARIO_LEER);
  const { data: clientesData } = useClientes('');
  const { data: ubicacionesData } = useUbicaciones('', { enabled: canListUbicaciones });

  const clientes = clientesData?.data ?? [];
  const ubicaciones = ubicacionesData?.data ?? [];

  const defaultClienteId = useMemo(
    () => clientes.find((c) => c.es_consumidor_final)?.id_cliente ?? clientes[0]?.id_cliente ?? '',
    [clientes],
  );

  const defaultUbicacionId = useMemo(
    () =>
      ubicaciones[0]?.id_ubicacion ??
      (canListUbicaciones ? '' : appConfig.defaultUbicacionId),
    [ubicaciones, canListUbicaciones],
  );

  const [idCliente, setIdCliente] = useState<number | ''>('');
  const [idUbicacion, setIdUbicacion] = useState<number | ''>('');
  const [descuento, setDescuento] = useState('0');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastVenta, setLastVenta] = useState<VentaResumen | null>(null);

  useEffect(() => {
    if (defaultClienteId && idCliente === '') setIdCliente(defaultClienteId);
  }, [defaultClienteId, idCliente]);

  useEffect(() => {
    if (defaultUbicacionId && idUbicacion === '') setIdUbicacion(defaultUbicacionId);
  }, [defaultUbicacionId, idUbicacion]);

  const descuentoNum = parseFloat(descuento) || 0;
  const total = Math.max(0, Math.round((subtotal - descuentoNum) * 100) / 100);

  const createVenta = useMutation({
    mutationFn: ventasApi.create,
  });

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      return (error.response?.data as { error?: string })?.error ?? 'No se pudo registrar la venta.';
    }
    return 'No se pudo registrar la venta.';
  };

  const handleConfirmSale = async () => {
    if (items.length === 0) {
      onFeedback('El carrito esta vacio.', 'error');
      return;
    }
    if (!idCliente || !idUbicacion) {
      onFeedback('Selecciona cliente y ubicacion.', 'error');
      return;
    }
    if (descuentoNum < 0) {
      onFeedback('El descuento no puede ser negativo.', 'error');
      return;
    }
    if (descuentoNum > subtotal) {
      onFeedback('El descuento no puede superar el subtotal.', 'error');
      return;
    }

    setConfirmOpen(false);

    try {
      const venta = await createVenta.mutateAsync({
        id_cliente: idCliente,
        id_ubicacion: idUbicacion,
        descuento_adicional: descuentoNum > 0 ? descuentoNum : undefined,
        detalle: items.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta,
        })),
      });

      setLastVenta(venta);
      setReceiptOpen(true);
      clearCart();
      setDescuento('0');
      onFeedback(`Venta ${venta.numero_venta} registrada.`, 'success');
    } catch (error) {
      onFeedback(getErrorMessage(error), 'error');
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <Box sx={{ px: 2, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
          Cierre de venta
        </Typography>

        <Box className="flex flex-col gap-2">
          <FormControl fullWidth size="small">
            <InputLabel id="pos-cliente-label">Cliente</InputLabel>
            <Select
              labelId="pos-cliente-label"
              label="Cliente"
              value={idCliente === '' ? '' : String(idCliente)}
              onChange={(e) => setIdCliente(parseInt(e.target.value, 10))}
            >
              {clientes.map((cliente) => (
                <MenuItem key={cliente.id_cliente} value={String(cliente.id_cliente)}>
                  {cliente.nombre_cliente}
                  {cliente.nit ? ` · NIT ${cliente.nit}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {canListUbicaciones ? (
            <FormControl fullWidth size="small">
              <InputLabel id="pos-ubicacion-label">Ubicacion</InputLabel>
              <Select
                labelId="pos-ubicacion-label"
                label="Ubicacion"
                value={idUbicacion === '' ? '' : String(idUbicacion)}
                onChange={(e) => setIdUbicacion(parseInt(e.target.value, 10))}
              >
                {ubicaciones.map((ubicacion) => (
                  <MenuItem key={ubicacion.id_ubicacion} value={String(ubicacion.id_ubicacion)}>
                    {ubicacion.nombre_ubicacion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Ubicacion: Principal (predeterminada)
            </Typography>
          )}

          <TextField
            label="Descuento adicional (Q)"
            type="number"
            size="small"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
            inputProps={{ min: 0, step: '0.01' }}
            fullWidth
          />

          <Box className="flex flex-col gap-1 pt-1">
            <Box className="flex justify-between">
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">Q {formatMoney(subtotal)}</Typography>
            </Box>
            {descuentoNum > 0 && (
              <Box className="flex justify-between">
                <Typography variant="body2">Descuento</Typography>
                <Typography variant="body2">- Q {formatMoney(descuentoNum)}</Typography>
              </Box>
            )}
            <Box className="flex justify-between">
              <Typography variant="subtitle1" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} color="primary">
                Q {formatMoney(total)}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={createVenta.isPending}
            onClick={() => setConfirmOpen(true)}
            sx={{ mt: 1 }}
          >
            {createVenta.isPending ? 'Procesando...' : 'Confirmar venta'}
          </Button>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar venta</DialogTitle>
        <DialogContent>
          <Typography>
            Registrar venta por <strong>Q {formatMoney(total)}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmSale}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <SaleReceiptDialog
        open={receiptOpen}
        venta={lastVenta}
        onClose={() => setReceiptOpen(false)}
      />
    </>
  );
}

export default CheckoutPanel;
