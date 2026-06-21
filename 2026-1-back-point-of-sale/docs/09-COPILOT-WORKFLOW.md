# Workflow recomendado con Copilot (Backend)

## Estado actual del proyecto
- Fases 0-7 completadas: fundacion, BD, auth, maestros, inventario, ventas y reportes.
- Fase 8 completada: QA, pruebas smoke/integracion y hardening MVP backend.
- **MVP backend cerrado.** Proximo foco: frontend (catalogos, POS, dashboard/reportes UI).

## Flujo diario de 2 horas
1. Pedir resumen del estado actual del modulo.
2. Definir objetivo pequeno y medible.
3. Implementar solo ese objetivo.
4. Correr pruebas del modulo.
5. Actualizar bitacora y proximo paso.

## Prompt plantilla
"Contexto: modulo X. Objetivo: Y. Restricciones: TypeScript + Express + Sequelize + convenciones MR/MC. Salida esperada: archivos a crear/modificar y pruebas."

## Reglas para productividad
- Pedir cambios pequenos y verificables.
- Pedir siempre riesgos y casos borde.
- Pedir validacion de permisos por endpoint.
- Cerrar cada sesion con checklist QA.

## Definition of Done
- Compila.
- Pruebas clave pasan.
- Permisos validados.
- Borrado logico aplicado.
- Documentacion actualizada.

## Como usar este workflow ahora
- El backend MVP esta cerrado; no agregar modulos backend salvo bugs o requisitos nuevos.
- Ejecutar `npm test` antes de cambios en backend; usar `npm run test:integration` con BD local si aplica.
- Priorizar frontend: Bloque 5 (catalogos), luego POS y dashboard/reportes UI.
- Consultar `10-PRUEBAS-INTEGRACION.md` para validacion del backend.
