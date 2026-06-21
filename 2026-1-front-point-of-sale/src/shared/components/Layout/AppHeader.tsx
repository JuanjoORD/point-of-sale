import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useAuth } from '@/auth/contexts/AuthContext';
import { appAssets } from '@/shared/config/assets';

function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar className="flex justify-between gap-4">
        <Box className="flex items-center gap-3">
          <Box
            component="img"
            src={appAssets.brand.logo}
            alt={appAssets.brand.name}
            sx={{ height: 32, display: { xs: 'none', md: 'block' } }}
          />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {appAssets.brand.name}
          </Typography>
        </Box>

        <Box className="flex items-center gap-3">
          <Typography variant="body2" color="text.secondary">
            {user?.nombre}
          </Typography>
          <Button variant="outlined" size="small" onClick={() => logout()}>
            Cerrar sesion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
