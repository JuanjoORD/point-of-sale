import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { appAssets } from '@/shared/config/assets';
import { colorTokens } from '@/shared/config/colors';

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('Credenciales incorrectas o servicio no disponible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="flex min-h-screen items-center justify-center p-4"
      sx={{
        bgcolor: colorTokens.background.default,
        backgroundImage: `url(${appAssets.images.loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }} elevation={3}>
        <Box className="mb-3 flex flex-col items-center gap-2">
          <Box component="img" src={appAssets.brand.logoCompact} alt={appAssets.brand.name} sx={{ width: 56, height: 56 }} />
          <Typography variant="h5" fontWeight={700} textAlign="center">
            {appAssets.brand.name}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
          Inicia sesion para continuar
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Correo electronico"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            autoFocus
            autoComplete="email"
          />
          <TextField
            label="Contrasena"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            autoComplete="current-password"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default LoginPage;
