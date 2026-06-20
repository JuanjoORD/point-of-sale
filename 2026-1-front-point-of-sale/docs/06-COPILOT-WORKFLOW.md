# Workflow recomendado con Copilot (Frontend)

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
