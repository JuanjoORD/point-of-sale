import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

export interface FormField {
  name: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
  maxRows?: number;
}

interface EntityDialogProps {
  open: boolean;
  title: string;
  fields: FormField[];
  values: Record<string, string>;
  submitLabel?: string;
  loading?: boolean;
  onChange: (name: string, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function EntityDialog({
  open,
  title,
  fields,
  values,
  submitLabel = 'Guardar',
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: EntityDialogProps) {
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
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                value={values[field.name] ?? ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                required={field.required}
                multiline={field.multiline}
                rows={field.multiline ? field.maxRows ?? 3 : undefined}
                fullWidth
                margin="dense"
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EntityDialog;
