import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';

export interface CustomerFormValues {
  nombre_cliente: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  activo: boolean;
}

interface CustomerFormDialogProps {
  open: boolean;
  title: string;
  values: CustomerFormValues;
  isEditing: boolean;
  isConsumidorFinal?: boolean;
  loading?: boolean;
  onChange: <K extends keyof CustomerFormValues>(name: K, value: CustomerFormValues[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function CustomerFormDialog({
  open,
  title,
  values,
  isEditing,
  isConsumidorFinal = false,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: CustomerFormDialogProps) {
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
              value={values.nombre_cliente}
              onChange={(e) => onChange('nombre_cliente', e.target.value)}
              required
              fullWidth
              margin="dense"
              disabled={isConsumidorFinal}
            />
            <TextField
              label="NIT"
              value={values.nit}
              onChange={(e) => onChange('nit', e.target.value)}
              fullWidth
              margin="dense"
              disabled={isConsumidorFinal}
            />
            <TextField
              label="Direccion"
              value={values.direccion}
              onChange={(e) => onChange('direccion', e.target.value)}
              multiline
              rows={2}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Telefono"
              value={values.telefono}
              onChange={(e) => onChange('telefono', e.target.value)}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Correo electronico"
              type="email"
              value={values.email}
              onChange={(e) => onChange('email', e.target.value)}
              fullWidth
              margin="dense"
            />
            {isEditing && !isConsumidorFinal && (
              <FormControlLabel
                control={
                  <Switch
                    checked={values.activo}
                    onChange={(e) => onChange('activo', e.target.checked)}
                  />
                }
                label="Activo"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CustomerFormDialog;
