import { NavLink } from 'react-router-dom';
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
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import { useAuth } from '@/auth/contexts/AuthContext';
import { appAssets } from '@/shared/config/assets';
import { colorTokens } from '@/shared/config/colors';
import { APP_NAV_ITEMS } from '@/shared/config/nav.config';

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
};

function SideNav() {
  const { hasPermission } = useAuth();
  const visibleItems = APP_NAV_ITEMS.filter((item) => hasPermission(item.permission));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: colorTokens.sidebar.bg,
          color: colorTokens.sidebar.text,
          borderRight: 'none',
        },
      }}
    >
      <Toolbar className="px-4">
        <Box className="flex items-center gap-2">
          <Box component="img" src={appAssets.brand.logoCompact} alt={appAssets.brand.name} sx={{ width: 36, height: 36 }} />
          <Typography variant="subtitle1" fontWeight={700} color="inherit">
            {appAssets.brand.shortName}
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ px: 1, py: 2 }}>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
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
    </Drawer>
  );
}

export default SideNav;
