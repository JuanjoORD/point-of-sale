import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/auth/contexts/AuthContext';
import { appAssets } from '@/shared/config/assets';
import { colorTokens } from '@/shared/config/colors';
import { APP_NAV_ITEMS, canSeeNavItem } from '@/shared/config/nav.config';

const DRAWER_WIDTH = 260;

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/': <DashboardOutlinedIcon />,
  '/reports/sales': <AssessmentOutlinedIcon />,
  '/reports/top-products': <LeaderboardOutlinedIcon />,
  '/sales': <PointOfSaleOutlinedIcon />,
  '/inventory/categories': <CategoryOutlinedIcon />,
  '/inventory/locations': <PlaceOutlinedIcon />,
  '/inventory/products': <Inventory2OutlinedIcon />,
  '/customers': <PeopleOutlineIcon />,
  '/settings/users': <ManageAccountsOutlinedIcon />,
  '/settings/roles': <AdminPanelSettingsOutlinedIcon />,
  '/settings/profile': <AccountCircleOutlinedIcon />,
};

interface SideNavProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function NavBrand() {
  return (
    <Toolbar className="px-4">
      <Box className="flex items-center gap-2">
        <Box component="img" src={appAssets.brand.logoCompact} alt={appAssets.brand.name} sx={{ width: 36, height: 36 }} />
        <Typography variant="subtitle1" fontWeight={700} color="inherit">
          {appAssets.brand.shortName}
        </Typography>
      </Box>
    </Toolbar>
  );
}

function SideNav({ mobileOpen = false, onMobileClose }: SideNavProps) {
  const { hasPermission, canManageSecurity } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const visibleItems = APP_NAV_ITEMS.filter((item) =>
    canSeeNavItem(item, hasPermission, canManageSecurity),
  );

  const navList = (
    <List sx={{ px: 1, py: 2 }}>
      {visibleItems.map((item) => (
        <ListItemButton
          key={item.path}
          component={NavLink}
          to={item.path}
          end={item.path === '/'}
          onClick={onMobileClose}
          sx={{
            borderRadius: 1,
            mb: 0.5,
            color: colorTokens.sidebar.textMuted,
            '&.active': {
              bgcolor: colorTokens.sidebar.active,
              color: colorTokens.sidebar.text,
            },
            '&:hover': {
              bgcolor: colorTokens.sidebar.hover,
              color: colorTokens.sidebar.text,
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            {NAV_ICONS[item.path]}
          </ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );

  const drawerPaper = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box' as const,
    bgcolor: colorTokens.sidebar.bg,
    color: colorTokens.sidebar.text,
    borderRight: 'none',
  };

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': drawerPaper,
        }}
        open
      >
        <NavBrand />
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        {navList}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': drawerPaper,
      }}
    >
      <NavBrand />
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      {navList}
    </Drawer>
  );
}

export default SideNav;
