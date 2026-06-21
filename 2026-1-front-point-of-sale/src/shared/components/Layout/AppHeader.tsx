import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '@/auth/contexts/AuthContext';
import { appAssets } from '@/shared/config/assets';
import { useCurrentNavItem } from '@/shared/hooks/usePageTitle';

interface AppHeaderProps {
  onOpenNav?: () => void;
}

function AppHeader({ onOpenNav }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const currentNavItem = useCurrentNavItem();

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar className="flex justify-between gap-4">
        <Box className="flex min-w-0 items-center gap-2">
          {onOpenNav && (
            <IconButton
              edge="start"
              aria-label="Abrir menu"
              onClick={onOpenNav}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            component="img"
            src={appAssets.brand.logo}
            alt={appAssets.brand.name}
            sx={{ height: 32, display: { xs: 'none', md: 'block' } }}
          />
          <Box className="min-w-0">
            <Typography variant="h6" fontWeight={700} color="text.primary" noWrap>
              {currentNavItem?.label ?? appAssets.brand.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {appAssets.brand.name}
            </Typography>
          </Box>
        </Box>

        <Box className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Typography variant="body2" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
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
