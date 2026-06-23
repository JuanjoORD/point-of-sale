import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '@/auth/contexts/AuthContext';
import { profileApi } from '../services/profile.service';

function ProfilePage() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!nombre.trim()) {
      setSnackbar({ open: true, message: 'El nombre es obligatorio.', severity: 'error' });
      return;
    }

    if (password && password.length < 8) {
      setSnackbar({ open: true, message: 'La contrasena debe tener al menos 8 caracteres.', severity: 'error' });
      return;
    }

    if (password && password !== confirmPassword) {
      setSnackbar({ open: true, message: 'Las contrasenas no coinciden.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const updated = await profileApi.update({
        nombre: nombre.trim(),
        ...(password ? { password } : {}),
      });

      localStorage.setItem('pos_user', JSON.stringify(updated));
      setPassword('');
      setConfirmPassword('');
      setSnackbar({ open: true, message: 'Perfil actualizado. Vuelve a iniciar sesion si cambiaste la contrasena.', severity: 'success' });
      window.location.reload();
    } catch {
      setSnackbar({ open: true, message: 'No se pudo actualizar el perfil.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Mi cuenta
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Actualiza tu nombre y contrasena de acceso.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', p: 3, maxWidth: 480 }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <TextField label="Correo" value={user?.email ?? ''} disabled fullWidth />
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Nueva contrasena (opcional)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            inputProps={{ minLength: 8 }}
          />
          <TextField
            label="Confirmar contrasena"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            disabled={!password}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
      </Paper>

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

export default ProfilePage;
