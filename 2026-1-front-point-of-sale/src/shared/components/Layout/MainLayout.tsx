import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

/**
 * Layout principal con sidebar lateral y área de contenido.
 * El sidebar (SideNav) y el header se añaden en Fase 8.
 */
function MainLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* SideNav — Fase 8 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;
