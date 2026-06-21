import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
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
import CustomerFormDialog, { CustomerFormValues } from '../components/CustomerFormDialog';
import { PERMISSIONS } from '@/shared/types/permissions.types';
import { useAuth } from '@/auth/contexts/AuthContext';
import { Cliente, useClienteMutations, useClientes } from '../hooks/useClientes';

const emptyForm: CustomerFormValues = {
  nombre_cliente: '',
  nit: '',
  direccion: '',
  telefono: '',
  email: '',
  activo: true,
};

function CustomersPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [formValues, setFormValues] = useState<CustomerFormValues>(emptyForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError } = useClientes(search);
  const { create, update, remove, getErrorMessage } = useClienteMutations();

  const canCreate = hasPermission(PERMISSIONS.CLIENTES_CREAR);
  const canEdit = hasPermission(PERMISSIONS.CLIENTES_EDITAR);

  const columns = useMemo(
    () => [
      { id: 'nombre', label: 'Nombre', render: (row: Cliente) => row.nombre_cliente },
      { id: 'nit', label: 'NIT', render: (row: Cliente) => row.nit ?? '—' },
      { id: 'direccion', label: 'Direccion', render: (row: Cliente) => row.direccion ?? '—' },
      { id: 'telefono', label: 'Telefono', render: (row: Cliente) => row.telefono ?? '—' },
      { id: 'email', label: 'Correo', render: (row: Cliente) => row.email ?? '—' },
      {
        id: 'tipo',
        label: 'Tipo',
        render: (row: Cliente) =>
          row.es_consumidor_final ? (
            <Chip size="small" label="Consumidor final" color="info" />
          ) : (
            '—'
          ),
      },
      {
        id: 'estado',
        label: 'Estado',
        render: (row: Cliente) => (
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

  const openEdit = (row: Cliente) => {
    setEditing(row);
    setFormValues({
      nombre_cliente: row.nombre_cliente,
      nit: row.nit ?? '',
      direccion: row.direccion ?? '',
      telefono: row.telefono ?? '',
      email: row.email ?? '',
      activo: row.activo,
    });
    setDialogOpen(true);
  };

  const buildPayload = () => ({
    nombre_cliente: formValues.nombre_cliente.trim(),
    nit: formValues.nit.trim() || undefined,
    direccion: formValues.direccion.trim() || undefined,
    telefono: formValues.telefono.trim() || undefined,
    email: formValues.email.trim() || undefined,
  });

  const handleSubmit = async () => {
    if (!formValues.nombre_cliente.trim()) {
      setSnackbar({ open: true, message: 'El nombre es obligatorio.', severity: 'error' });
      return;
    }

    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id_cliente,
          payload: {
            ...buildPayload(),
            nit: formValues.nit.trim() || null,
            activo: editing.es_consumidor_final ? undefined : formValues.activo,
          },
        });
        setSnackbar({ open: true, message: 'Cliente actualizado.', severity: 'success' });
      } else {
        await create.mutateAsync(buildPayload());
        setSnackbar({ open: true, message: 'Cliente creado.', severity: 'success' });
      }
      setDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  const handleDelete = async (row: Cliente) => {
    if (row.es_consumidor_final) return;
    if (!window.confirm(`Eliminar al cliente "${row.nombre_cliente}"?`)) return;
    try {
      await remove.mutateAsync(row.id_cliente);
      setSnackbar({ open: true, message: 'Cliente eliminado.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  const rows = data?.data ?? [];
  const isSaving = create.isPending || update.isPending;

  return (
    <PermissionGuard permiso={PERMISSIONS.CLIENTES_LEER}>
      <Box className="flex flex-col gap-4">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra clientes para ventas con nombre, NIT y direccion.
          </Typography>
        </Box>

        <TextField
          label="Buscar por nombre o NIT"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 360 }}
        />

        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && rows.length === 0}
          emptyMessage="Aun no hay clientes registrados."
        >
          <DataTable
            title="Listado"
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id_cliente}
            canCreate={canCreate}
            createLabel="Nuevo cliente"
            onCreate={openCreate}
            renderActions={
              canEdit
                ? (row) => (
                    <>
                      <IconButton aria-label="Editar cliente" onClick={() => openEdit(row)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      {!row.es_consumidor_final && (
                        <IconButton aria-label="Eliminar cliente" onClick={() => handleDelete(row)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </>
                  )
                : undefined
            }
          />
        </QueryState>

        <CustomerFormDialog
          open={dialogOpen}
          title={editing ? 'Editar cliente' : 'Nuevo cliente'}
          values={formValues}
          isEditing={!!editing}
          isConsumidorFinal={!!editing?.es_consumidor_final}
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

export default CustomersPage;
