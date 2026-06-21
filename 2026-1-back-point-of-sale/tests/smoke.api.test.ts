import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Smoke API', () => {
  it('GET /health responde con estado y db', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: expect.stringMatching(/^(ok|degraded)$/),
      db: expect.stringMatching(/^(ok|error)$/),
    });
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/v1/productos sin token responde 401', async () => {
    const res = await request(app).get('/api/v1/productos');

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/v1/ventas sin token responde 401', async () => {
    const res = await request(app).get('/api/v1/ventas');

    expect(res.status).toBe(401);
  });

  it('GET /api/v1/dashboard/ventas-dia sin token responde 401', async () => {
    const res = await request(app).get('/api/v1/dashboard/ventas-dia');

    expect(res.status).toBe(401);
  });

  it('POST /api/v1/auth/login con body invalido responde 400', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'no-es-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('GET /ruta-inexistente responde 404', async () => {
    const res = await request(app).get('/api/v1/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/v1/reportes/ventas sin token responde 401', async () => {
    const res = await request(app).get('/api/v1/reportes/ventas');

    expect(res.status).toBe(401);
  });
});
