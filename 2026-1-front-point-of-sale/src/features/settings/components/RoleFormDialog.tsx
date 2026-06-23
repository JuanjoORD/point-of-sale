import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Permiso } from '../types/settings.types';

export interface RoleFormValues {
  nombre_rol: string;
  descripcion: string;
  permisos: number[];
}

interface RoleFormDialogProps {
  open: boolean;
  title: string;
  values: RoleFormValues;
  permisos: Permiso[];
  loading?: boolean;
  onChange: <K extends keyof RoleFormValues>(name: K, value: RoleFormValues[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function groupPermisos(permisos: Permiso[]): Map<string, Permiso[]> {
  const groups = new Map<string, Permiso[]>();
  for (const permiso of permisos) {
    const [recurso] = permiso.codigo_permiso.split(':');
    const list = groups.get(recurso) ?? [];
    list.push(permiso);
    groups.set(recurso, list);
  }
  return groups;
}

function RoleFormDialog({
  open,
  title,
  values,
  permisos,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: RoleFormDialogProps) {
  const groups = groupPermisos(permisos);

  const togglePermiso = (id: number) => {
    const next = values.permisos.includes(id)
      ? values.permisos.filter((p) => p !== id)
      : [...values.permisos, id];
    onChange('permisos', next);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box className="flex flex-col gap-2 pt-1">
            <TextField
              label="Nombre del rol"
              value={values.nombre_rol}
              onChange={(e) => onChange('nombre_rol', e.target.value)}
              required
              fullWidth
              margin="dense"
            />
            <TextField
              label="Descripcion"
              value={values.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              multiline
              rows={2}
              fullWidth
              margin="dense"
            />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
              Permisos
            </Typography>
            {Array.from(groups.entries()).map(([recurso, items]) => (
              <Box key={recurso} sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {recurso}
                </Typography>
                <FormGroup row>
                  {items.map((permiso) => (
                    <FormControlLabel
                      key={permiso.id_permiso}
                      control={
                        <Checkbox
                          checked={values.permisos.includes(permiso.id_permiso)}
                          onChange={() => togglePermiso(permiso.id_permiso)}
                        />
                      }
                      label={permiso.codigo_permiso.split(':')[1]}
                    />
                  ))}
                </FormGroup>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default RoleFormDialog;
