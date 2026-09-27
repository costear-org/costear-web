---
issue: 207
repo: CosteAR-frontend
pr: 233
rama: feat/planeamiento-resultados
agente: codex
modelo: gpt-5
tanda: B3
inicio: 2026-09-27T06:14-03:00
fin: 2026-09-27T06:32-03:00
minutos: 18
tokens: no-informado
clears: 0
intentos_hasta_verde: 1
rojos_deliberados: 2
rebotes_de_guarda: 0
---

# 2026-09-27 — Cuánto vender para alcanzar la ganancia buscada

## Qué se hizo

- Se agregó al tablero del dueño un formulario para definir el objetivo como resultado absoluto o porcentaje sobre el capital.
- Se conectó `POST /companies/{companyId}/analisis/planeamiento-resultados` mediante una mutación tipada de TanStack Query.
- Se muestran cantidad necesaria, ventas necesarias y resultado logrado sin recalcular los valores del backend.
- Se cubrieron el ejemplo numérico del issue, el rechazo 422 de R12 y la ausencia de equilibrio en tests unitarios y E2E.
- Se trabajó con la versión `b3e7221` del prompt vigente de `CosteAR-os`.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** enviar al backend el nombre plural visible de la unidad de gestión y mostrar la unidad que vuelve en la respuesta.
  **Qué otra opción había:** enviar el código técnico (`cajon`) y pluralizar únicamente al renderizar.
  **Por qué elegí esta:** el contrato devuelve la unidad que recibe; así la unidad viaja con el valor y no aparece un código interno al usuario (Constitución §3).
- **Qué decidí:** ubicar el formulario dentro del tablero existente y reutilizar `Input`, `Button`, `Card`, `formatMoney`, `apiErrorMessage` y los helpers de unidad.
  **Qué otra opción había:** crear una ruta y controles visuales nuevos.
  **Por qué elegí esta:** el issue define una pantalla del backend #423 pero no exige navegación separada; reutilizar el sistema existente mantiene el alcance y evita componentes duplicados.
- **Qué decidí:** limpiar el resultado anterior antes de cada cálculo y mostrar el mensaje del backend sin reinterpretarlo.
  **Qué otra opción había:** conservar el último resultado mientras se informa el error.
  **Por qué elegí esta:** un resultado viejo junto a un error nuevo podría presentarse como vigente; se declara la ausencia en vez de inventar continuidad (Constitución §2).

## Dónde el issue no alcanzaba

- No indicaba si la unidad enviada debía ser el código o el nombre visible. Se eligió el nombre plural para que el backend lo devuelva junto con la cantidad.
- No indicaba dónde ubicar el formulario. Se integró en el tablero del dueño, junto al resto del análisis marginal.
- No indicaba moneda configurable. El tablero y el formato monetario actual trabajan en ARS, por lo que se conservó ese contrato sin ampliar el alcance.
- El worktree ya contenía una implementación sin commitear al iniciar esta corrida; se la auditó contra el contrato de backend #423, se corrigió la unidad y se verificó completa antes de presentarla.

## Qué quedó afuera

- Planeamiento en modalidad monetaria: no forma parte del criterio de aceptación.
- Objetivos como porcentaje sobre ventas o costos: R12 los rechaza explícitamente.
- Configuración de otra moneda: no fue solicitada y el tablero actual usa ARS.

## Con qué se verifica

```bash
npm test -- --run src/features/owner-dashboard/PlaneamientoResultadosPanel.test.tsx src/features/owner-dashboard/owner-dashboard-hooks.test.tsx
# 2 archivos, 11 tests verdes

npm run lint
# 0 errores; 109 warnings preexistentes

npm run typecheck
# verde

npx playwright test tests/e2e/tablero-dueno.spec.ts --grep "calcula cuánto vender"
# 4/4 verdes (cuatro viewports)

npm run test
# 65 archivos, 289 tests verdes

npm run check:feature-tests
# 20/20 features cubiertas

npm run build
# verde

npm run test:e2e
# 198 verdes, 2 omitidos previstos
```
