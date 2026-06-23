import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QueryState from '@/shared/components/Feedback/QueryState';
import DataTable from '@/shared/components/DataTable/DataTable';
import { useAuth } from '@/auth/contexts/AuthContext';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import UserFormDialog, { UserFormValues } from '../components/UserFormDialog';
import { useRolesDisponibles, useUsuarioMutations, useUsuarios } from '../hooks/useUsuarios';
import { Usuario } from '../types/settings.types';

const emptyForm: UserFormValues = {
  nombre: '',
  email: '',
  password: '',
  activo: true,
  roles: [],
};

function UsersPage() {
  const { canManageSecurity, user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [formValues, setFormValues] = useState<UserFormValues>(emptyForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const canRead = canManageSecurity(PERMISSIONS.USUARIOS_LEER);
  const canCreate = canManageSecurity(PERMISSIONS.USUARIOS_CREAR);
  const canEdit = canManageSecurity(PERMISSIONS.USUARIOS_EDITAR);

  const { data, isLoading, isError } = useUsuarios(search);
  const { data: rolesDisponibles = [] } = useRolesDisponibles(canRead);
  const { create, update, remove, getErrorMessage } = useUsuarioMutations();

  const canModifyRow = (row: Usuario): boolean => {
    if (!canEdit) return false;
    if (row.es_usuario_sistema) {
      return currentUser?.id_usuario === row.id_usuario;
    }
    return true;
  };

  const canDeleteRow = (row: Usuario): boolean => {
    if (!canEdit) return false;
    if (row.es_usuario_sistema) return false;
    return true;
  };

  const columns = useMemo(
    () => [
      { id: 'nombre', label: 'Nombre', render: (row: Usuario) => row.nombre },
      { id: 'email', label: 'Email', render: (row: Usuario) => row.email },
      {
        id: 'roles',
        label: 'Roles',
        render: (row: Usuario) => (
          <Box className="flex flex-wrap gap-1">
            {row.roles.map((rol) => (
              <Chip key={rol} label={rol} size="small" />
            ))}
          </Box>
        ),
      },
      {
        id: 'activo',
        label: 'Estado',
        render: (row: Usuario) => (
          <Box className="flex flex-wrap items-center gap-1">
            <Chip
              size="small"
              label={row.activo ? 'Activo' : 'Inactivo'}
              color={row.activo ? 'success' : 'default'}
            />
            {row.es_usuario_sistema && (
              <Chip size="small" label="Admin sistema" color="warning" variant="outlined" />
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

  const openEdit = (row: Usuario) => {
    const roleIds = rolesDisponibles
      .filter((r) => row.roles.includes(r.nombre_rol))
      .map((r) => r.id_rol);

    setEditing(row);
    setFormValues({
      nombre: row.nombre,
      email: row.email,
      password: '',
      activo: row.activo,
      roles: roleIds,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formValues.nombre.trim() || !formValues.email.trim()) {
      setSnackbar({ open: true, message: 'Nombre y email son obligatorios.', severity: 'error' });
      return;
    }
    if (!editing && formValues.password.length < 8) {
      setSnackbar({ open: true, message: 'La contrasena debe tener al menos 8 caracteres.', severity: 'error' });
      return;
    }
    if (formValues.roles.length === 0) {
      setSnackbar({ open: true, message: 'Debe asignar al menos un rol.', severity: 'error' });
      return;
    }

    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id_usuario,
          payload: {
            nombre: formValues.nombre.trim(),
            email: formValues.email.trim(),
            activo: formValues.activo,
            roles: formValues.roles,
            ...(formValues.password ? { password: formValues.password } : {}),
          },
        });
        setSnackbar({ open: true, message: 'Usuario actualizado.', severity: 'success' });
      } else {
        await create.mutateAsync({
          nombre: formValues.nombre.trim(),
          email: formValues.email.trim(),
          password: formValues.password,
          roles: formValues.roles,
        });
        setSnackbar({ open: true, message: 'Usuario creado.', severity: 'success' });
      }
      setDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  const handleDelete = async (row: Usuario) => {
    if (!window.confirm(`Eliminar al usuario "${row.nombre}"?`)) return;
    try {
      await remove.mutateAsync(row.id_usuario);
      setSnackbar({ open: true, message: 'Usuario eliminado.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  const rows = data?.data ?? [];
  const isSaving = create.isPending || update.isPending;

  if (!canRead) {
    return <Alert severity="warning">No tienes permiso para gestionar usuarios.</Alert>;
  }

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Usuarios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Administra cuentas de acceso y asignacion de roles.
        </Typography>
      </Box>

      <Box className="flex flex-wrap items-center gap-3">
        <TextField
          label="Buscar por nombre o email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 360, flexGrow: 1 }}
        />
        {canCreate && (
          <Button variant="contained" onClick={openCreate} sx={{ ml: { sm: 'auto' } }}>
            Nuevo usuario
          </Button>
        )}
      </Box>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && rows.length === 0}
        emptyMessage="Aun no hay usuarios registrados."
        emptyAction={
          canCreate ? (
            <Button variant="contained" onClick={openCreate}>
              Registrar primer usuario
            </Button>
          ) : undefined
        }
      >
        <DataTable
          title="Listado"
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id_usuario}
          canCreate={canCreate}
          createLabel="Nuevo usuario"
          onCreate={openCreate}
          renderActions={
            canEdit
              ? (row) => (
                  <>
                    {canModifyRow(row) && (
                      <IconButton aria-label="Editar usuario" onClick={() => openEdit(row)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    )}
                    {canDeleteRow(row) && (
                      <IconButton aria-label="Eliminar usuario" onClick={() => handleDelete(row)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </>
                )
              : undefined
          }
        />
      </QueryState>

      <UserFormDialog
        open={dialogOpen}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        values={formValues}
        rolesDisponibles={rolesDisponibles}
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
  );
}

export default UsersPage;
