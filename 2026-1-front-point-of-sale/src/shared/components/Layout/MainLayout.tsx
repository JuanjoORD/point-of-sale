import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { colorTokens } from '@/shared/config/colors';
import SideNav from './SideNav';
import AppHeader from './AppHeader';

function MainLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colorTokens.background.default }}>
      <SideNav />
      <Box component="section" sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppHeader />
        <Box component="main" className="p-4 md:p-6">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
