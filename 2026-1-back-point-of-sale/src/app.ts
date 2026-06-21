import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import env from './config/environment';
import sequelize from './config/database';
import { AppError } from './shared/errors/AppError';
import authRoutes from './modules/auth/auth.routes';
import categoriasRoutes from './modules/categorias/categorias.routes';
import ubicacionesRoutes from './modules/ubicaciones/ubicaciones.routes';
import productosRoutes from './modules/productos/productos.routes';
import usuariosRoutes from './modules/usuarios/usuarios.routes';
import rolesRoutes from './modules/roles/roles.routes';
import clientesRoutes from './modules/clientes/clientes.routes';
import inventarioRoutes from './modules/inventario/inventario.routes';
import ventasRoutes from './modules/ventas/ventas.routes';
import dashboardRoutes from './modules/reportes/dashboard.routes';
import reportesRoutes from './modules/reportes/reportes.routes';

const app: Application = express();

// ── Seguridad de cabeceras ───────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);

// ── Rate limit global ─────────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes, intenta mas tarde.' },
  }),
);

// ── Logging ───────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus: 'ok' | 'error' = 'error';
  try {
    await sequelize.authenticate();
    dbStatus = 'ok';
  } catch {
    dbStatus = 'error';
  }

  res.status(200).json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    db: dbStatus,
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas API v1 ──────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categorias', categoriasRoutes);
app.use('/api/v1/ubicaciones', ubicacionesRoutes);
app.use('/api/v1/productos', productosRoutes);
app.use('/api/v1/usuarios', usuariosRoutes);
app.use('/api/v1/roles', rolesRoutes);
app.use('/api/v1/clientes', clientesRoutes);
app.use('/api/v1/inventario', inventarioRoutes);
app.use('/api/v1/ventas', ventasRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reportes', reportesRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Endpoint no encontrado', 404));
});

// ── Error handler global ──────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // Error inesperado: no exponer detalles internos
  console.error('[ERROR]', err);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
