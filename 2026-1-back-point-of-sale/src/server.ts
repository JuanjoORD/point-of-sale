import app from './app';
import env from './config/environment';
import { connectDB } from './config/database';

const start = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`[SERVER] Corriendo en puerto ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('[SERVER] Error al iniciar:', error);
    process.exit(1);
  }
};

start();
