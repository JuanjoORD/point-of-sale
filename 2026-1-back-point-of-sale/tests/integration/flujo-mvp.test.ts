import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

const runIntegration = process.env.RUN_INTEGRATION === '1';
const testEmail = process.env.TEST_ADMIN_EMAIL ?? 'admin@pos.local';
const testPassword = process.env.TEST_ADMIN_PASSWORD ?? '';

describe.skipIf(!runIntegration || !testPassword)('Integracion MVP con BD', () => {
  let accessToken = '';

  beforeAll(async () => {
    const health = await request(app).get('/health');
    if (health.body.db !== 'ok') {
      throw new Error('BD no disponible para pruebas de integracion');
    }

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    if (login.status !== 200) {
      throw new Error(`Login de integracion fallo (${login.status}): ${login.body?.error ?? 'sin detalle'}`);
    }

    accessToken = login.body.access_token;
  });

  it('login retorna token y permisos', async () => {
    expect(accessToken).toBeTruthy();
  });

  it('perfil y endpoints clave responden 200', async () => {
    const auth = { Authorization: `Bearer ${accessToken}` };

    const perfil = await request(app).get('/api/v1/auth/perfil').set(auth);
    expect(perfil.status).toBe(200);
    expect(perfil.body.user?.email).toBeDefined();

    const categorias = await request(app).get('/api/v1/categorias').set(auth);
    expect(categorias.status).toBe(200);
    expect(categorias.body.data).toBeInstanceOf(Array);

    const productos = await request(app).get('/api/v1/productos').set(auth);
    expect(productos.status).toBe(200);

    const inventario = await request(app).get('/api/v1/inventario').set(auth);
    expect(inventario.status).toBe(200);

    const alertas = await request(app).get('/api/v1/inventario/alertas').set(auth);
    expect(alertas.status).toBe(200);

    const dashboard = await request(app).get('/api/v1/dashboard/ventas-dia').set(auth);
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data.total_ventas).toBeDefined();

    const hoy = new Date().toISOString().slice(0, 10);
    const reporte = await request(app)
      .get(`/api/v1/reportes/ventas?fecha_inicio=${hoy}&fecha_fin=${hoy}`)
      .set(auth);
    expect(reporte.status).toBe(200);
    expect(reporte.body.data.cantidad_tickets).toBeDefined();
  });

  it('reportes exigen rango de fechas valido', async () => {
    const auth = { Authorization: `Bearer ${accessToken}` };

    const sinFechas = await request(app).get('/api/v1/reportes/ventas').set(auth);
    expect(sinFechas.status).toBe(400);

    const rangoInvalido = await request(app)
      .get('/api/v1/reportes/ventas?fecha_inicio=2026-06-20&fecha_fin=2026-06-01')
      .set(auth);
    expect(rangoInvalido.status).toBe(400);
  });

  it('endpoint protegido por permiso responde segun rol', async () => {
    const auth = { Authorization: `Bearer ${accessToken}` };

    const probe = await request(app).get('/api/v1/auth/permiso-prueba').set(auth);
    expect(probe.status).toBe(200);
  });
});
