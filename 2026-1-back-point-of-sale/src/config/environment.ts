import 'dotenv/config';

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    name: process.env.DB_NAME || 'pos_inventario',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Validar variables requeridas al arranque
const required = ['DB_PASSWORD', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    if (env.NODE_ENV === 'production') {
      throw new Error(`Variable de entorno requerida no configurada: ${key}`);
    } else {
      console.warn(`[WARN] Variable de entorno no configurada: ${key}`);
    }
  }
}

export default env;
