import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PermissionGuard from '@/shared/components/PermissionGuard';
import QueryState from '@/shared/components/Feedback/QueryState';
import DataTable from '@/shared/components/DataTable/DataTable';
import EntityDialog from '@/shared/components/Form/EntityDialog';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import { useAuth } from '@/auth/contexts/AuthContext';
import { Ubicacion, useUbicacionMutations, useUbicaciones } from '../hooks/useUbicaciones';

const FORM_FIELDS = [
  { name: 'nombre_ubicacion', label: 'Nombre', required: true },
  { name: 'descripcion', label: 'Descripcion', multiline: true, maxRows: 3 },
];

const emptyForm = { nombre_ubicacion: '', descripcion: '' };

function LocationsPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ubicacion | null>(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError } = useUbicaciones(search);
  const { create, update, remove, getErrorMessage } = useUbicacionMutations();

  const canCreate = hasPermission(PERMISSIONS.INVENTARIO_EDITAR);
  const canEdit = hasPermission(PERMISSIONS.INVENTARIO_EDITAR);

  const columns = useMemo(
    () => [
      { id: 'nombre', label: 'Nombre', render: (row: Ubicacion) => row.nombre_ubicacion },
      {
        id: 'descripcion',
        label: 'Descripcion',
        render: (row: Ubicacion) => row.descripcion ?? '—',
      },
    ],
    [],
  );

  const openCreate = () => {
    setEditing(null);
    setFormValues(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: Ubicacion) => {
    setEditing(row);
    setFormValues({
      nombre_ubicacion: row.nombre_ubicacion,
      descripcion: row.descripcion ?? '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      nombre_ubicacion: formValues.nombre_ubicacion.trim(),
      descripcion: formValues.descripcion.trim() || undefined,
    };

    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id_ubicacion, payload });
        setSnackbar({ open: true, message: 'Ubicacion actualizada.', severity: 'success' });
      } else {
        await create.mutateAsync(payload);
        setSnackbar({ open: true, message: 'Ubicacion creada.', severity: 'success' });
      }
      setDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  const handleDelete = async (row: Ubicacion) => {
    if (!window.confirm(`Eliminar la ubicacion "${row.nombre_ubicacion}"?`)) return;
    try {
      await remove.mutateAsync(row.id_ubicacion);
      setSnackbar({ open: true, message: 'Ubicacion eliminada.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  const rows = data?.data ?? [];
  const isSaving = create.isPending || update.isPending;

  return (
    <PermissionGuard permiso={PERMISSIONS.INVENTARIO_LEER}>
      <Box className="flex flex-col gap-4">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Ubicaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra sucursales y bodegas donde se controla inventario.
          </Typography>
        </Box>

        <TextField
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 360 }}
        />

        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && rows.length === 0}
          emptyMessage="Aun no hay ubicaciones registradas."
        >
          <DataTable
            title="Listado"
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id_ubicacion}
            canCreate={canCreate}
            createLabel="Nueva ubicacion"
            onCreate={openCreate}
            renderActions={
              canEdit
                ? (row) => (
                    <>
                      <IconButton aria-label="Editar ubicacion" onClick={() => openEdit(row)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton aria-label="Eliminar ubicacion" onClick={() => handleDelete(row)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </>
                  )
                : undefined
            }
          />
        </QueryState>

        <EntityDialog
          open={dialogOpen}
          title={editing ? 'Editar ubicacion' : 'Nueva ubicacion'}
          fields={FORM_FIELDS}
          values={formValues}
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

export default LocationsPage;
