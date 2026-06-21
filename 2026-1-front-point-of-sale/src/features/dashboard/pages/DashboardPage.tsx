import { useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import PermissionGuard from '@/shared/components/PermissionGuard';
import QueryState from '@/shared/components/Feedback/QueryState';
import DataTable from '@/shared/components/DataTable/DataTable';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useUbicaciones } from '@/features/inventory/hooks/useUbicaciones';
import { colorTokens } from '@/shared/config/colors';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import { TopProductoDia } from '../types/dashboard.types';
import { useVentasDia } from '../hooks/useVentasDia';

const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

const formatMoney = (value: number): string =>
  new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const formatDateLabel = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(date);
};

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function KpiCard({ label, value, icon }: KpiCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box className="flex items-center justify-between">
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Box sx={{ color: colorTokens.primary.main }}>{icon}</Box>
      </Box>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
    </Paper>
  );
}

function DashboardPage() {
  const { hasPermission } = useAuth();
  const canFilterUbicacion = hasPermission(PERMISSIONS.INVENTARIO_LEER);

  const [fecha, setFecha] = useState(todayIsoDate);
  const [idUbicacion, setIdUbicacion] = useState<number | ''>('');

  const { data: ubicacionesData } = useUbicaciones('', { enabled: canFilterUbicacion });
  const ubicaciones = ubicacionesData?.data ?? [];

  const filters = useMemo(
    () => ({
      fecha,
      id_ubicacion: idUbicacion === '' ? undefined : idUbicacion,
    }),
    [fecha, idUbicacion],
  );

  const { data, isLoading, isError } = useVentasDia(filters);

  const topColumns = useMemo(
    () => [
      { id: 'producto', label: 'Producto', render: (row: TopProductoDia) => row.nombre_producto },
      {
        id: 'cantidad',
        label: 'Cantidad',
        align: 'right' as const,
        render: (row: TopProductoDia) => formatMoney(row.cantidad_vendida),
      },
      {
        id: 'total',
        label: 'Total (Q)',
        align: 'right' as const,
        render: (row: TopProductoDia) => formatMoney(row.total_vendido),
      },
    ],
    [],
  );

  const fechaLabel = data?.fecha ?? fecha;

  return (
    <PermissionGuard permiso={PERMISSIONS.REPORTES_LEER}>
      <Box className="flex flex-col gap-4">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Resumen de ventas del dia — {formatDateLabel(fechaLabel)}
          </Typography>
        </Box>

        <Box className="flex flex-wrap gap-3">
          <TextField
            label="Fecha"
            type="date"
            size="small"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />

          {canFilterUbicacion && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="dashboard-ubicacion-label">Ubicacion</InputLabel>
              <Select
                labelId="dashboard-ubicacion-label"
                label="Ubicacion"
                value={idUbicacion === '' ? '' : String(idUbicacion)}
                onChange={(e) => {
                  const value = e.target.value;
                  setIdUbicacion(value === '' ? '' : parseInt(value, 10));
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {ubicaciones.map((ubicacion) => (
                  <MenuItem key={ubicacion.id_ubicacion} value={String(ubicacion.id_ubicacion)}>
                    {ubicacion.nombre_ubicacion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <QueryState isLoading={isLoading} isError={isError}>
          {data && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <KpiCard
                    label="Total ventas"
                    value={`Q ${formatMoney(data.total_ventas)}`}
                    icon={<AttachMoneyOutlinedIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <KpiCard
                    label="Tickets"
                    value={String(data.cantidad_tickets)}
                    icon={<ConfirmationNumberOutlinedIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <KpiCard
                    label="Ticket promedio"
                    value={`Q ${formatMoney(data.ticket_promedio)}`}
                    icon={<TrendingUpOutlinedIcon />}
                  />
                </Grid>
              </Grid>

              <DataTable
                title="Top productos del dia"
                columns={topColumns}
                rows={data.top_productos}
                rowKey={(row) => row.id_producto}
              />
            </>
          )}
        </QueryState>
      </Box>
    </PermissionGuard>
  );
}

export default DashboardPage;
