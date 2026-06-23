import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QueryState from '@/shared/components/Feedback/QueryState';
import DataTable from '@/shared/components/DataTable/DataTable';
import { useAuth } from '@/auth/contexts/AuthContext';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import RoleFormDialog, { RoleFormValues } from '../components/RoleFormDialog';
import { usePermisos, useRolMutations, useRoles } from '../hooks/useRoles';
import { Rol } from '../types/settings.types';

const emptyForm: RoleFormValues = {
  nombre_rol: '',
  descripcion: '',
  permisos: [],
};

function RolesPage() {
  const { canManageSecurity } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Rol | null>(null);
  const [formValues, setFormValues] = useState<RoleFormValues>(emptyForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const canRead = canManageSecurity(PERMISSIONS.ROLES_LEER);
  const canCreate = canManageSecurity(PERMISSIONS.ROLES_CREAR);
  const canEdit = canManageSecurity(PERMISSIONS.ROLES_EDITAR);

  const { data, isLoading, isError } = useRoles();
  const { data: permisos = [] } = usePermisos(canRead);
  const { create, update, remove, getErrorMessage } = useRolMutations();

  const permisoIdByCode = useMemo(
    () => new Map(permisos.map((p) => [p.codigo_permiso, p.id_permiso])),
    [permisos],
  );

  const columns = useMemo(
    () => [
      { id: 'nombre', label: 'Rol', render: (row: Rol) => row.nombre_rol },
      {
        id: 'descripcion',
        label: 'Descripcion',
        render: (row: Rol) => row.descripcion ?? '—',
      },
      {
        id: 'permisos',
        label: 'Permisos',
        render: (row: Rol) => (
          <Box className="flex flex-wrap gap-1">
            {row.permisos.slice(0, 4).map((p) => (
              <Chip key={p} label={p} size="small" />
            ))}
            {row.permisos.length > 4 && (
              <Chip label={`+${row.permisos.length - 4}`} size="small" variant="outlined" />
            )}
          </Box>
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

  const openEdit = (row: Rol) => {
    const permisoIds = row.permisos
      .map((code) => permisoIdByCode.get(code))
      .filter((id): id is number => id !== undefined);

    setEditing(row);
    setFormValues({
      nombre_rol: row.nombre_rol,
      descripcion: row.descripcion ?? '',
      permisos: permisoIds,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formValues.nombre_rol.trim()) {
      setSnackbar({ open: true, message: 'El nombre del rol es obligatorio.', severity: 'error' });
      return;
    }

    const payload = {
      nombre_rol: formValues.nombre_rol.trim(),
      descripcion: formValues.descripcion.trim() || undefined,
      permisos: formValues.permisos,
    };

    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id_rol, payload });
        setSnackbar({ open: true, message: 'Rol actualizado.', severity: 'success' });
      } else {
        await create.mutateAsync(payload);
        setSnackbar({ open: true, message: 'Rol creado.', severity: 'success' });
      }
      setDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  const handleDelete = async (row: Rol) => {
    if (!window.confirm(`Eliminar el rol "${row.nombre_rol}"?`)) return;
    try {
      await remove.mutateAsync(row.id_rol);
      setSnackbar({ open: true, message: 'Rol eliminado.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  if (!canRead) {
    return (
      <Alert severity="warning">No tienes permiso para gestionar roles.</Alert>
    );
  }

  const rows = data?.data ?? [];
  const isSaving = create.isPending || update.isPending;

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Roles y permisos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define roles y asigna permisos del sistema.
        </Typography>
      </Box>

      {canCreate && (
        <Box>
          <Button variant="contained" onClick={openCreate}>
            Nuevo rol
          </Button>
        </Box>
      )}

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && rows.length === 0}
        emptyMessage="Aun no hay roles personalizados."
        emptyAction={
          canCreate ? (
            <Button variant="contained" onClick={openCreate}>
              Crear primer rol
            </Button>
          ) : undefined
        }
      >
        <DataTable
          title="Listado"
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id_rol}
          canCreate={canCreate}
          createLabel="Nuevo rol"
          onCreate={openCreate}
          renderActions={
            canEdit
              ? (row) => (
                  <>
                    <IconButton aria-label="Editar rol" onClick={() => openEdit(row)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton aria-label="Eliminar rol" onClick={() => handleDelete(row)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </>
                )
              : undefined
          }
        />
      </QueryState>

      <RoleFormDialog
        open={dialogOpen}
        title={editing ? 'Editar rol' : 'Nuevo rol'}
        values={formValues}
        permisos={permisos}
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
  );
}

export default RolesPage;
