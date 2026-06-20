# Workflow recomendado con Copilot (Backend)

## Estado actual del proyecto
- Fase 0 completada: base tecnica y convenciones.
- Fase 2 completada: migraciones SQL, seeds base y reglas de nomenclatura.
- Fase 3 completada: AUTH con JWT, autenticar y autorizar por permiso.
- Fase 4 completada: CRUD de categorias, ubicaciones, productos, usuarios, roles y clientes.
- Proximo bloque: inventario por ubicacion y alertas de stock minimo.

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
- Antes de editar, revisar la bitacora y el estado actual.
- Trabajar en bloques de una sola responsabilidad por sesion.
- No saltar al frontend de inventario/ventas hasta cerrar el dominio de inventario en backend.
