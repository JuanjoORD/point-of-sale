import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

export interface StorageLocationFormValues {
  estanteria: string;
  fila: string;
  caja: string;
  descripcion: string;
}

interface StorageLocationFormDialogProps {
  open: boolean;
  title: string;
  values: StorageLocationFormValues;
  loading?: boolean;
  onChange: <K extends keyof StorageLocationFormValues>(name: K, value: StorageLocationFormValues[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function StorageLocationFormDialog({
  open,
  title,
  values,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: StorageLocationFormDialogProps) {
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
              label="Estanteria"
              value={values.estanteria}
              onChange={(e) => onChange('estanteria', e.target.value)}
              required
              fullWidth
              margin="dense"
              placeholder="Ej. A, B1, Pasillo 3"
            />
            <Box className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <TextField
                label="Fila"
                value={values.fila}
                onChange={(e) => onChange('fila', e.target.value)}
                fullWidth
                margin="dense"
                placeholder="Ej. 2, Superior"
              />
              <TextField
                label="Caja"
                value={values.caja}
                onChange={(e) => onChange('caja', e.target.value)}
                fullWidth
                margin="dense"
                placeholder="Ej. 5, Caja roja"
              />
            </Box>
            <TextField
              label="Descripcion"
              value={values.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              multiline
              rows={2}
              fullWidth
              margin="dense"
            />
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

export default StorageLocationFormDialog;
