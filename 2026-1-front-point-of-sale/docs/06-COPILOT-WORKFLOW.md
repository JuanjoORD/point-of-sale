# Workflow recomendado con Copilot (Frontend)

## Estado actual del proyecto
- Fase 0 completada: app base, routing, auth shell y cliente API.
- Tailwind ya está configurado como estandar para utilidades de UI.
- Login ya conecta contra el backend real con refresh automático de token.
- Proximo bloque: pantallas maestras y flujo POS.

## Ciclo por sesion
1. Pedir estado actual del modulo.
2. Definir objetivo pequeno de UI/flujo.
3. Implementar componente/pagina.
4. Probar manualmente escenario principal.
5. Registrar avance en bitacora.

## Prompt plantilla
"Contexto: feature X. Objetivo: Y. Restricciones: React+TS, TanStack Query, Zustand, MUI, permisos por rol. Salida esperada: archivos + pruebas manuales."

## Reglas
- Pedir implementacion por pasos pequenos.
- Pedir manejo de estados loading/error/empty.
- Pedir accesibilidad minima (labels, focus, teclado).
- Pedir resumen de riesgos al final.

## Como usar este workflow ahora
- Priorizar componentes reutilizables para tablas, formularios y dialogs.
- No duplicar logica de permisos: usar `PermissionGuard` y la API de auth.
- Mantener cada sesion enfocada en una pantalla o flujo especifico.
