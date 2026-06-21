import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PermissionGuard from '@/shared/components/PermissionGuard';
import QueryState from '@/shared/components/Feedback/QueryState';
import DataTable, { DataTableColumn } from '@/shared/components/DataTable/DataTable';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useUbicaciones } from '@/features/inventory/hooks/useUbicaciones';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import { useTopProductosCantidad, useTopProductosValor } from '../hooks/useTopProductos';
import { TopProducto } from '../types/reports.types';
import { downloadTopProductosCsv } from '../utils/exportTopProductosCsv';

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

function buildTopColumns(rows: TopProducto[]): DataTableColumn<TopProducto>[] {
  return [
    {
      id: 'rank',
      label: '#',
      align: 'center',
      render: (row) => rows.findIndex((item) => item.id_producto === row.id_producto) + 1,
    },
    { id: 'producto', label: 'Producto', render: (row) => row.nombre_producto },
    {
      id: 'cantidad',
      label: 'Cantidad',
      align: 'right',
      render: (row) => formatMoney(row.cantidad_vendida),
    },
    {
      id: 'total',
      label: 'Total (Q)',
      align: 'right',
      render: (row) => formatMoney(row.total_vendido),
    },
  ];
}

function TopProductsReportPage() {
  const { hasPermission } = useAuth();
  const canFilterUbicacion = hasPermission(PERMISSIONS.INVENTARIO_LEER);

  const [fechaInicio, setFechaInicio] = useState(startOfMonthIsoDate);
  const [fechaFin, setFechaFin] = useState(todayIsoDate);
  const [idUbicacion, setIdUbicacion] = useState<number | ''>('');
  const [limit, setLimit] = useState(10);

  const { data: ubicacionesData } = useUbicaciones('', { enabled: canFilterUbicacion });
  const ubicaciones = ubicacionesData?.data ?? [];

  const rangeInvalid = fechaInicio > fechaFin;

  const filters = useMemo(
    () => ({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      id_ubicacion: idUbicacion === '' ? undefined : idUbicacion,
      limit,
    }),
    [fechaInicio, fechaFin, idUbicacion, limit],
  );

  const cantidadQuery = useTopProductosCantidad(filters, !rangeInvalid);
  const valorQuery = useTopProductosValor(filters, !rangeInvalid);

  const isLoading = cantidadQuery.isLoading || valorQuery.isLoading;
  const isError = cantidadQuery.isError || valorQuery.isError;

  const cantidadRows = cantidadQuery.data?.data ?? [];
  const valorRows = valorQuery.data?.data ?? [];
  const canExport = cantidadQuery.data && valorQuery.data;

  const cantidadColumns = useMemo(() => buildTopColumns(cantidadRows), [cantidadRows]);
  const valorColumns = useMemo(() => buildTopColumns(valorRows), [valorRows]);

  return (
    <PermissionGuard permiso={PERMISSIONS.REPORTES_LEER}>
      <Box className="flex flex-col gap-4">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Top productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ranking por cantidad vendida y por valor en un rango de fechas.
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
              <InputLabel id="top-ubicacion-label">Ubicacion</InputLabel>
              <Select
                labelId="top-ubicacion-label"
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

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="top-limit-label">Top</InputLabel>
            <Select
              labelId="top-limit-label"
              label="Top"
              value={String(limit)}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            >
              {[5, 10, 20, 50].map((value) => (
                <MenuItem key={value} value={String(value)}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {canExport && (
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() =>
                downloadTopProductosCsv(cantidadRows, valorRows, fechaInicio, fechaFin)
              }
            >
              Exportar CSV
            </Button>
          )}
        </Box>

        {rangeInvalid && (
          <Alert severity="warning">La fecha inicial no puede ser mayor que la fecha final.</Alert>
        )}

        {!rangeInvalid && (
          <>
            <Typography variant="body2" color="text.secondary">
              Periodo: {formatDateLabel(fechaInicio)} — {formatDateLabel(fechaFin)}
            </Typography>

            <QueryState isLoading={isLoading} isError={isError}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <DataTable
                    title="Por cantidad vendida"
                    columns={cantidadColumns}
                    rows={cantidadRows}
                    rowKey={(row) => row.id_producto}
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <DataTable
                    title="Por valor vendido"
                    columns={valorColumns}
                    rows={valorRows}
                    rowKey={(row) => row.id_producto}
                  />
                </Grid>
              </Grid>
            </QueryState>
          </>
        )}
      </Box>
    </PermissionGuard>
  );
}

export default TopProductsReportPage;
