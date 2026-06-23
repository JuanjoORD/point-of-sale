import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PermissionGuard from '@/shared/components/PermissionGuard';
import QueryState from '@/shared/components/Feedback/QueryState';
import DataTable from '@/shared/components/DataTable/DataTable';
import ProductFormDialog, { ProductFormValues } from '../components/ProductFormDialog';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useCategorias } from '../hooks/useCategorias';
import { useUbicacionesAlmacenamiento } from '../hooks/useUbicacionesAlmacenamiento';
import { Producto, useProductoMutations, useProductos } from '../hooks/useProductos';
import { formatUbicacionAlmacenamiento } from '../types/inventory.types';

const emptyForm: ProductFormValues = {
  nombre_producto: '',
  descripcion: '',
  codigo_barras: '',
  precio_costo: '0',
  precio_venta: '0',
  es_servicio: false,
  id_categoria: '',
  id_ubicacion_almacenamiento: '',
  activo: true,
};

const formatMoney = (value: number): string =>
  new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

function ProductsPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [formValues, setFormValues] = useState<ProductFormValues>(emptyForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError } = useProductos(search, includeInactive);
  const { data: categoriasData } = useCategorias('');
  const { data: ubicacionesAlmacenamientoData } = useUbicacionesAlmacenamiento('', {
    enabled: hasPermission(PERMISSIONS.INVENTARIO_LEER),
  });
  const { create, update, remove, getErrorMessage } = useProductoMutations();

  const canCreate = hasPermission(PERMISSIONS.PRODUCTOS_CREAR);
  const canEdit = hasPermission(PERMISSIONS.PRODUCTOS_EDITAR);
  const categorias = categoriasData?.data ?? [];
  const ubicacionesAlmacenamiento = ubicacionesAlmacenamientoData?.data ?? [];

  const columns = useMemo(
    () => [
      { id: 'nombre', label: 'Nombre', render: (row: Producto) => row.nombre_producto },
      {
        id: 'codigo',
        label: 'Codigo',
        render: (row: Producto) => row.codigo_barras ?? '—',
      },
      {
        id: 'categoria',
        label: 'Categoria',
        render: (row: Producto) => row.nombre_categoria ?? '—',
      },
      {
        id: 'ubicacion',
        label: 'Almacenamiento',
        render: (row: Producto) =>
          row.estanteria ? formatUbicacionAlmacenamiento(row) : '—',
      },
      {
        id: 'precio_venta',
        label: 'Precio venta',
        align: 'right' as const,
        render: (row: Producto) => formatMoney(row.precio_venta),
      },
      {
        id: 'tipo',
        label: 'Tipo',
        render: (row: Producto) => (
          <Chip
            size="small"
            label={row.es_servicio ? 'Servicio' : 'Producto'}
            color={row.es_servicio ? 'info' : 'default'}
          />
        ),
      },
      {
        id: 'estado',
        label: 'Estado',
        render: (row: Producto) => (
          <Chip
            size="small"
            label={row.activo ? 'Activo' : 'Inactivo'}
            color={row.activo ? 'success' : 'default'}
            variant={row.activo ? 'filled' : 'outlined'}
          />
        ),
      },
    ],
    [],
  );

  const openCreate = () => {
    setEditing(null);
    setFormValues(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: Producto) => {
    setEditing(row);
    setFormValues({
      nombre_producto: row.nombre_producto,
      descripcion: row.descripcion ?? '',
      codigo_barras: row.codigo_barras ?? '',
      precio_costo: String(row.precio_costo),
      precio_venta: String(row.precio_venta),
      es_servicio: row.es_servicio,
      id_categoria: row.id_categoria ? String(row.id_categoria) : '',
      id_ubicacion_almacenamiento: row.id_ubicacion_almacenamiento
        ? String(row.id_ubicacion_almacenamiento)
        : '',
      activo: row.activo,
    });
    setDialogOpen(true);
  };

  const buildPayload = () => {
    const precioCosto = parseFloat(formValues.precio_costo);
    const precioVenta = parseFloat(formValues.precio_venta);

    if (Number.isNaN(precioCosto) || precioCosto < 0 || Number.isNaN(precioVenta) || precioVenta < 0) {
      throw new Error('Los precios deben ser numeros validos mayores o iguales a 0.');
    }

    return {
      nombre_producto: formValues.nombre_producto.trim(),
      descripcion: formValues.descripcion.trim() || undefined,
      codigo_barras: formValues.codigo_barras.trim() || undefined,
      precio_costo: precioCosto,
      precio_venta: precioVenta,
      es_servicio: formValues.es_servicio,
      id_categoria: formValues.id_categoria ? parseInt(formValues.id_categoria, 10) : undefined,
      id_ubicacion_almacenamiento: formValues.id_ubicacion_almacenamiento
        ? parseInt(formValues.id_ubicacion_almacenamiento, 10)
        : undefined,
    };
  };

  const handleSubmit = async () => {
    let payload;
    try {
      payload = buildPayload();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Datos invalidos.',
        severity: 'error',
      });
      return;
    }

    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id_producto,
          payload: {
            ...payload,
            id_categoria: formValues.id_categoria ? parseInt(formValues.id_categoria, 10) : null,
            id_ubicacion_almacenamiento: formValues.id_ubicacion_almacenamiento
              ? parseInt(formValues.id_ubicacion_almacenamiento, 10)
              : null,
            codigo_barras: formValues.codigo_barras.trim() || null,
            activo: formValues.activo,
          },
        });
        setSnackbar({ open: true, message: 'Producto actualizado.', severity: 'success' });
      } else {
        await create.mutateAsync(payload);
        setSnackbar({ open: true, message: 'Producto creado.', severity: 'success' });
      }
      setDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  const handleDelete = async (row: Producto) => {
    if (!window.confirm(`Eliminar "${row.nombre_producto}"?`)) return;
    try {
      await remove.mutateAsync(row.id_producto);
      setSnackbar({ open: true, message: 'Producto eliminado.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  const rows = data?.data ?? [];
  const isSaving = create.isPending || update.isPending;

  return (
    <PermissionGuard permiso={PERMISSIONS.PRODUCTOS_LEER}>
      <Box className="flex flex-col gap-4">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Productos y servicios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra el catalogo de productos fisicos y servicios.
          </Typography>
        </Box>

        <Box className="flex flex-wrap items-center gap-3">
          <TextField
            label="Buscar por nombre o codigo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ maxWidth: 360, flexGrow: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
            }
            label="Incluir inactivos"
          />
          {canCreate && (
            <Button variant="contained" onClick={openCreate} sx={{ ml: { sm: 'auto' } }}>
              Nuevo producto
            </Button>
          )}
        </Box>

        {!canCreate && (
          <Alert severity="info">
            Tu rol solo permite consultar el catalogo. Para crear productos se requiere el permiso{' '}
            <strong>productos:crear</strong> (roles ADMIN, GERENTE o ALMACENERO).
          </Alert>
        )}

        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && rows.length === 0}
          emptyMessage="Aun no hay productos registrados."
          emptyAction={
            canCreate ? (
              <Button variant="contained" onClick={openCreate}>
                Registrar primer producto
              </Button>
            ) : undefined
          }
        >
          <DataTable
            title="Listado"
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id_producto}
            canCreate={canCreate}
            createLabel="Nuevo producto"
            onCreate={openCreate}
            renderActions={
              canEdit
                ? (row) => (
                    <>
                      <IconButton aria-label="Editar producto" onClick={() => openEdit(row)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton aria-label="Eliminar producto" onClick={() => handleDelete(row)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </>
                  )
                : undefined
            }
          />
        </QueryState>

        <ProductFormDialog
          open={dialogOpen}
          title={editing ? 'Editar producto' : 'Nuevo producto'}
          values={formValues}
          categorias={categorias}
          ubicacionesAlmacenamiento={ubicacionesAlmacenamiento}
          isEditing={!!editing}
          loading={isSaving}
          onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PermissionGuard>
  );
}

export default ProductsPage;
