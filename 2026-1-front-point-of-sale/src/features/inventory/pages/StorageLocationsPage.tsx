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
import { PERMISSIONS } from '@/shared/types/permissions.types';
import { useAuth } from '@/auth/contexts/AuthContext';
import StorageLocationFormDialog, {
  StorageLocationFormValues,
} from '../components/StorageLocationFormDialog';
import {
  UbicacionAlmacenamiento,
  formatUbicacionAlmacenamiento,
} from '../types/inventory.types';
import {
  useUbicacionAlmacenamientoMutations,
  useUbicacionesAlmacenamiento,
} from '../hooks/useUbicacionesAlmacenamiento';

const emptyForm: StorageLocationFormValues = {
  estanteria: '',
  fila: '',
  caja: '',
  descripcion: '',
};

function StorageLocationsPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UbicacionAlmacenamiento | null>(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError } = useUbicacionesAlmacenamiento(search);
  const { create, update, remove, getErrorMessage } = useUbicacionAlmacenamientoMutations();

  const canCreate = hasPermission(PERMISSIONS.INVENTARIO_EDITAR);
  const canEdit = hasPermission(PERMISSIONS.INVENTARIO_EDITAR);

  const columns = useMemo(
    () => [
      {
        id: 'ubicacion',
        label: 'Ubicacion',
        render: (row: UbicacionAlmacenamiento) => formatUbicacionAlmacenamiento(row),
      },
      { id: 'estanteria', label: 'Estanteria', render: (row: UbicacionAlmacenamiento) => row.estanteria },
      { id: 'fila', label: 'Fila', render: (row: UbicacionAlmacenamiento) => row.fila ?? '—' },
      { id: 'caja', label: 'Caja', render: (row: UbicacionAlmacenamiento) => row.caja ?? '—' },
      {
        id: 'descripcion',
        label: 'Descripcion',
        render: (row: UbicacionAlmacenamiento) => row.descripcion ?? '—',
      },
    ],
    [],
  );

  const openCreate = () => {
    setEditing(null);
    setFormValues(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: UbicacionAlmacenamiento) => {
    setEditing(row);
    setFormValues({
      estanteria: row.estanteria,
      fila: row.fila ?? '',
      caja: row.caja ?? '',
      descripcion: row.descripcion ?? '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      estanteria: formValues.estanteria.trim(),
      fila: formValues.fila.trim() || undefined,
      caja: formValues.caja.trim() || undefined,
      descripcion: formValues.descripcion.trim() || undefined,
    };

    if (!payload.estanteria) {
      setSnackbar({ open: true, message: 'La estanteria es obligatoria.', severity: 'error' });
      return;
    }

    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id_ubicacion_almacenamiento, payload });
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

  const handleDelete = async (row: UbicacionAlmacenamiento) => {
    const label = formatUbicacionAlmacenamiento(row);
    if (!window.confirm(`Eliminar la ubicacion "${label}"?`)) return;
    try {
      await remove.mutateAsync(row.id_ubicacion_almacenamiento);
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
            Ubicaciones de almacenamiento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define estanterias, filas y cajas donde se guardan los productos fisicos.
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
          emptyMessage="Aun no hay ubicaciones de almacenamiento registradas."
        >
          <DataTable
            title="Listado"
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id_ubicacion_almacenamiento}
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

        <StorageLocationFormDialog
          open={dialogOpen}
          title={editing ? 'Editar ubicacion de almacenamiento' : 'Nueva ubicacion de almacenamiento'}
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

export default StorageLocationsPage;
