# Pruebas de Integracion Backend

## Objetivo
Validar el MVP backend con pruebas automaticas smoke (sin BD obligatoria) y pruebas de integracion opcionales con MSSQL.

## Scripts

```bash
# Compilacion
npx tsc --noEmit

# Lint
npm run lint

# Pruebas smoke (auth, permisos, health, errores)
npm test

# Pruebas de integracion con BD (requiere credenciales)
npm run test:integration
```

## Pruebas smoke (`tests/smoke.api.test.ts`)
Se ejecutan siempre con `npm test`:
- Health check con estado de BD.
- Endpoints protegidos responden 401 sin token.
- Validacion de login con body invalido (400).
- Rutas inexistentes responden 404.

## Pruebas de integracion (`tests/integration/flujo-mvp.test.ts`)
Requieren:
1. MSSQL levantado con migraciones y seed aplicados.
2. Usuario admin con password real (no el hash PLACEHOLDER del seed).
3. Variables de entorno:

```env
RUN_INTEGRATION=1
TEST_ADMIN_EMAIL=admin@pos.local
TEST_ADMIN_PASSWORD=tu_password_real
```

Flujo validado:
- Login y perfil.
- Lectura de catalogos, inventario, alertas.
- Dashboard ventas del dia.
- Reportes por rango.
- Validacion de fechas en reportes.
- Endpoint con permiso `reportes:leer`.

## Criterio de cierre MVP backend
- [x] Compila sin errores.
- [x] Pruebas smoke pasan.
- [x] Rate limit en login/refresh.
- [x] Health check reporta estado de BD.
- [x] Modulos MVP implementados y documentados.

## Notas
- Las pruebas de integracion se omiten automaticamente si `RUN_INTEGRATION` no es `1` o falta `TEST_ADMIN_PASSWORD`.
- Para validar venta transaccional completa, ejecutar manualmente POST `/api/v1/ventas` con datos de prueba en ambiente local.
