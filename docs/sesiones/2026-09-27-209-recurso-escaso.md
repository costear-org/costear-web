---
issue: 209
repo: CosteAR-frontend
pr: 235
rama: feat/recurso-escaso
agente: codex
modelo: gpt-5
tanda: B3
inicio: 2026-09-27T08:20:23-03:00
fin: 2026-09-27T08:40:22-03:00
minutos: 20
tokens: no-informado
clears: 0
intentos_hasta_verde: 3
rojos_deliberados: 1
rebotes_de_guarda: 0
---

# 2026-09-27 — Qué producir primero cuando un recurso limita

Prompt vigente de `CosteAR-os`: `b3e7221`.

## Qué se hizo

- El tablero consulta `GET /companies/{companyId}/analisis/mezcla-optima` mediante TanStack Query.
- La pantalla muestra el recurso escaso activo, su disponibilidad y el ranking recibido del backend, con la contribución por unidad del recurso al lado de la contribución por unidad vendida.
- AM-06 queda visible con una contribución total de $ 140.000 y el producto Y primero aunque el producto X tenga mayor contribución por unidad vendida.
- Sin cuello activo se muestra `motivoSinRanking` y no se dibuja una tabla. Con dos recursos activos se muestra el mensaje 422 y tampoco se dibuja ranking.
- Se agregaron pruebas del hook, del componente y un recorrido E2E con captura en cuatro navegadores/viewports.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** integrar la lectura en el tablero del negocio, junto a los demás análisis marginales. **Qué otra opción había:** crear una ruta o pantalla independiente. **Por qué elegí esta:** el issue no pidió navegación nueva y los módulos B3 equivalentes ya viven como paneles del tablero; crear otra ruta ampliaba el alcance.
- **Qué decidí:** titular el panel “Qué producir primero” y explicar el criterio en lenguaje de decisión, manteniendo “recurso escaso” sólo donde nombra el dato del contrato. **Qué otra opción había:** usar “mezcla óptima” y las siglas CME/CM como encabezados. **Por qué elegí esta:** Constitución §1 exige que la persona dueña pueda decidir sin traducir jerga contable.
- **Qué decidí:** mostrar las unidades publicadas y no derivarlas del rubro. **Qué otra opción había:** asumir horas o unidades de producto desde el fixture. **Por qué elegí esta:** Constitución §3 exige que la unidad viaje con el valor.
- **Qué decidí:** respetar el orden y los importes del backend sin recalcular el ranking. **Qué otra opción había:** volver a ordenar por CME en React. **Por qué elegí esta:** evita duplicar la regla de dominio y conserva al backend como fuente del cálculo.

## Dónde el issue no alcanzaba

- No definía una ruta nueva ni la posición del módulo; se siguió el patrón actual del tablero del negocio.
- No especificaba si mostrar `contribucionMarginalTotal`, `recursoRestante` ni la cantidad asignada. Se mostraron porque forman parte del contrato publicado y explican el resultado sin introducir cálculo cliente.
- No indicaba etiquetas legibles para `cme` y `cm`; se usaron “Por recurso escaso” y “Por unidad vendida” para evitar siglas.

## Qué quedó afuera

- La creación y edición de recursos escasos y consumos no pertenece a este issue.
- La programación lineal para dos o más restricciones no está implementada por este contrato; se comunica la instrucción del 422.
- No se eliminó ni renombró ningún test.

## Con qué se verifica

```text
npm run lint
→ 0 errores, 109 warnings preexistentes

npm run typecheck
→ verde

npm test
→ 67 archivos, 296 tests verdes

npm run test:e2e -- --grep "ordena AM-06"
→ 4 tests verdes (Chromium, WebKit, Mobile Chrome, Mobile Safari)

npm run test:e2e
→ 206 tests verdes, 2 omitidos

npm run build
→ verde

npm run check:feature-tests
→ 20 features verificadas: 20 cubiertas y 0 excepciones trazadas
```
