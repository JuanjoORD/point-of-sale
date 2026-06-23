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
import { Categoria, UbicacionAlmacenamiento, formatUbicacionAlmacenamiento } from '../types/inventory.types';

export interface ProductFormValues {
  nombre_producto: string;
  descripcion: string;
  codigo_barras: string;
  precio_costo: string;
  precio_venta: string;
  es_servicio: boolean;
  id_categoria: string;
  id_ubicacion_almacenamiento: string;
  activo: boolean;
}

interface ProductFormDialogProps {
  open: boolean;
  title: string;
  values: ProductFormValues;
  categorias: Categoria[];
  ubicacionesAlmacenamiento: UbicacionAlmacenamiento[];
  isEditing: boolean;
  loading?: boolean;
  onChange: <K extends keyof ProductFormValues>(name: K, value: ProductFormValues[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function ProductFormDialog({
  open,
  title,
  values,
  categorias,
  ubicacionesAlmacenamiento,
  isEditing,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
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
              value={values.nombre_producto}
              onChange={(e) => onChange('nombre_producto', e.target.value)}
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
            <TextField
              label="Codigo de barras"
              value={values.codigo_barras}
              onChange={(e) => onChange('codigo_barras', e.target.value)}
              fullWidth
              margin="dense"
            />
            <Box className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <TextField
                label="Precio costo"
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={values.precio_costo}
                onChange={(e) => onChange('precio_costo', e.target.value)}
                required
                fullWidth
                margin="dense"
              />
              <TextField
                label="Precio venta"
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={values.precio_venta}
                onChange={(e) => onChange('precio_venta', e.target.value)}
                required
                fullWidth
                margin="dense"
              />
            </Box>
            <FormControl fullWidth margin="dense">
              <InputLabel id="producto-categoria-label">Categoria</InputLabel>
              <Select
                labelId="producto-categoria-label"
                label="Categoria"
                value={values.id_categoria}
                onChange={(e) => onChange('id_categoria', e.target.value)}
              >
                <MenuItem value="">Sin categoria</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat.id_categoria} value={String(cat.id_categoria)}>
                    {cat.nombre_categoria}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!values.es_servicio && (
              <FormControl fullWidth margin="dense">
                <InputLabel id="producto-ubicacion-almacenamiento-label">
                  Ubicacion de almacenamiento
                </InputLabel>
                <Select
                  labelId="producto-ubicacion-almacenamiento-label"
                  label="Ubicacion de almacenamiento"
                  value={values.id_ubicacion_almacenamiento}
                  onChange={(e) => onChange('id_ubicacion_almacenamiento', e.target.value)}
                >
                  <MenuItem value="">Sin ubicacion</MenuItem>
                  {ubicacionesAlmacenamiento.map((ubicacion) => (
                    <MenuItem
                      key={ubicacion.id_ubicacion_almacenamiento}
                      value={String(ubicacion.id_ubicacion_almacenamiento)}
                    >
                      {formatUbicacionAlmacenamiento(ubicacion)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={values.es_servicio}
                  onChange={(e) => onChange('es_servicio', e.target.checked)}
                />
              }
              label="Es servicio (no descuenta inventario)"
            />
            {isEditing && (
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

export default ProductFormDialog;
