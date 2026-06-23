import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import { Categoria, useCategoriaMutations, useCategorias } from '../hooks/useCategorias';

const FORM_FIELDS = [
  { name: 'nombre_categoria', label: 'Nombre', required: true },
  { name: 'descripcion', label: 'Descripcion', multiline: true, maxRows: 3 },
];

const emptyForm = { nombre_categoria: '', descripcion: '' };

function CategoriesPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError } = useCategorias(search);
  const { create, update, remove, getErrorMessage } = useCategoriaMutations();

  const canCreate = hasPermission(PERMISSIONS.PRODUCTOS_CREAR);
  const canEdit = hasPermission(PERMISSIONS.PRODUCTOS_EDITAR);

  const columns = useMemo(
    () => [
      { id: 'nombre', label: 'Nombre', render: (row: Categoria) => row.nombre_categoria },
      {
        id: 'descripcion',
        label: 'Descripcion',
        render: (row: Categoria) => row.descripcion ?? '—',
      },
    ],
    [],
  );

  const openCreate = () => {
    setEditing(null);
    setFormValues(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: Categoria) => {
    setEditing(row);
    setFormValues({
      nombre_categoria: row.nombre_categoria,
      descripcion: row.descripcion ?? '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      nombre_categoria: formValues.nombre_categoria.trim(),
      descripcion: formValues.descripcion.trim() || undefined,
    };

    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id_categoria, payload });
        setSnackbar({ open: true, message: 'Categoria actualizada.', severity: 'success' });
      } else {
        await create.mutateAsync(payload);
        setSnackbar({ open: true, message: 'Categoria creada.', severity: 'success' });
      }
      setDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: getErrorMessage(error), severity: 'error' });
    }
  };

  const handleDelete = async (row: Categoria) => {
    if (!window.confirm(`Eliminar la categoria "${row.nombre_categoria}"?`)) return;
    try {
      await remove.mutateAsync(row.id_categoria);
      setSnackbar({ open: true, message: 'Categoria eliminada.', severity: 'success' });
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
            Categorias
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra las categorias de productos y servicios.
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
          emptyMessage="Aun no hay categorias registradas."
          emptyAction={
            canCreate ? (
              <Button variant="contained" onClick={openCreate}>
                Registrar primera categoria
              </Button>
            ) : undefined
          }
        >
          <DataTable
            title="Listado"
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id_categoria}
            canCreate={canCreate}
            createLabel="Nueva categoria"
            onCreate={openCreate}
            renderActions={
              canEdit
                ? (row) => (
                    <>
                      <IconButton aria-label="Editar categoria" onClick={() => openEdit(row)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton aria-label="Eliminar categoria" onClick={() => handleDelete(row)}>
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
          title={editing ? 'Editar categoria' : 'Nueva categoria'}
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

export default CategoriesPage;
