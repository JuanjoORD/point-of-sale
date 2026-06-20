import { Sequelize } from 'sequelize';
import env from './environment';

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
      requestTimeout: 30000,
    },
  },
  logging: env.NODE_ENV === 'development' ? (sql) => console.log('[SQL]', sql) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDB = async (): Promise<void> => {
  await sequelize.authenticate();
  console.log('[DB] Conexion MSSQL establecida correctamente.');
};

export default sequelize;
