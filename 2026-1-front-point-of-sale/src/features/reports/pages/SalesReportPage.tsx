import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import PermissionGuard from '@/shared/components/PermissionGuard';
import QueryState from '@/shared/components/Feedback/QueryState';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useUbicaciones } from '@/features/inventory/hooks/useUbicaciones';
import { colorTokens } from '@/shared/config/colors';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import { useVentasRango } from '../hooks/useVentasRango';
import { downloadVentasRangoCsv } from '../utils/exportVentasRangoCsv';

const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

const startOfMonthIsoDate = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}-01`;
};

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

function SalesReportPage() {
  const { hasPermission } = useAuth();
  const canFilterUbicacion = hasPermission(PERMISSIONS.INVENTARIO_LEER);

  const [fechaInicio, setFechaInicio] = useState(startOfMonthIsoDate);
  const [fechaFin, setFechaFin] = useState(todayIsoDate);
  const [idUbicacion, setIdUbicacion] = useState<number | ''>('');

  const { data: ubicacionesData } = useUbicaciones('', { enabled: canFilterUbicacion });
  const ubicaciones = ubicacionesData?.data ?? [];

  const rangeInvalid = fechaInicio > fechaFin;

  const filters = useMemo(
    () => ({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      id_ubicacion: idUbicacion === '' ? undefined : idUbicacion,
    }),
    [fechaInicio, fechaFin, idUbicacion],
  );

  const { data, isLoading, isError } = useVentasRango(filters, !rangeInvalid);

  return (
    <PermissionGuard permiso={PERMISSIONS.REPORTES_LEER}>
      <Box className="flex flex-col gap-4">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Reporte de ventas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Resumen agregado por rango de fechas.
          </Typography>
        </Box>

        <Box className="flex flex-wrap items-end gap-3">
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />

          {canFilterUbicacion && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="reporte-ubicacion-label">Ubicacion</InputLabel>
              <Select
                labelId="reporte-ubicacion-label"
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

          {data && (
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => downloadVentasRangoCsv(data)}
            >
              Exportar CSV
            </Button>
          )}
        </Box>

        {rangeInvalid && (
          <Alert severity="warning">La fecha inicial no puede ser mayor que la fecha final.</Alert>
        )}

        {!rangeInvalid && (
          <QueryState isLoading={isLoading} isError={isError}>
            {data && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Periodo: {formatDateLabel(data.fecha_inicio)} — {formatDateLabel(data.fecha_fin)}
                </Typography>

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
              </>
            )}
          </QueryState>
        )}
      </Box>
    </PermissionGuard>
  );
}

export default SalesReportPage;
