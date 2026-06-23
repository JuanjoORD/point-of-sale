import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { RolDisponible } from '../types/settings.types';

export interface UserFormValues {
  nombre: string;
  email: string;
  password: string;
  activo: boolean;
  roles: number[];
}

interface UserFormDialogProps {
  open: boolean;
  title: string;
  values: UserFormValues;
  rolesDisponibles: RolDisponible[];
  isEditing: boolean;
  loading?: boolean;
  onChange: <K extends keyof UserFormValues>(name: K, value: UserFormValues[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function UserFormDialog({
  open,
  title,
  values,
  rolesDisponibles,
  isEditing,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: UserFormDialogProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box className="flex flex-col gap-1 pt-1">
            <TextField
              label="Nombre"
              value={values.nombre}
              onChange={(e) => onChange('nombre', e.target.value)}
              required
              fullWidth
              margin="dense"
            />
            <TextField
              label="Correo electronico"
              type="email"
              value={values.email}
              onChange={(e) => onChange('email', e.target.value)}
              required
              fullWidth
              margin="dense"
            />
            <TextField
              label={isEditing ? 'Nueva contrasena (opcional)' : 'Contrasena'}
              type="password"
              value={values.password}
              onChange={(e) => onChange('password', e.target.value)}
              required={!isEditing}
              fullWidth
              margin="dense"
              inputProps={{ minLength: 8 }}
            />
            {isEditing && (
              <FormControlLabel
                control={
                  <Switch
                    checked={values.activo}
                    onChange={(e) => onChange('activo', e.target.checked)}
                  />
                }
                label="Usuario activo"
              />
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel id="usuario-roles-label">Roles</InputLabel>
              <Select
                labelId="usuario-roles-label"
                label="Roles"
                multiple
                value={values.roles.map(String)}
                onChange={(e) => {
                  const selected = e.target.value;
                  const ids = (typeof selected === 'string' ? selected.split(',') : selected).map(
                    (v) => parseInt(v, 10),
                  );
                  onChange('roles', ids);
                }}
                renderValue={(selected) =>
                  rolesDisponibles
                    .filter((r) => selected.includes(String(r.id_rol)))
                    .map((r) => r.nombre_rol)
                    .join(', ')
                }
              >
                {rolesDisponibles.map((rol) => (
                  <MenuItem key={rol.id_rol} value={String(rol.id_rol)}>
                    {rol.nombre_rol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default UserFormDialog;
