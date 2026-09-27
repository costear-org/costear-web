---
issue: 208
repo: CosteAR-frontend
pr: 234
rama: feat/punto-indiferencia
agente: codex
modelo: gpt-5
tanda: B3
inicio: 2026-09-27T07:18-03:00
fin: 2026-09-27T07:52-03:00
minutos: 34
tokens: no-informado
clears: 0
intentos_hasta_verde: 3
rojos_deliberados: 1
rebotes_de_guarda: 0
---

# 2026-09-27 — Comparación simple para saber qué alternativa conviene

## Recursos

- Prompt vigente de Alan: `b3e7221`.
- Se instalaron las dependencias exactas del lockfile con `npm ci` porque el worktree era nuevo.
- El primer rojo confirmó que la pantalla todavía no existía. Hubo dos correcciones de selectores de test antes del verde completo.

## Qué se hizo

- Se agregó al tablero del negocio una sola pantalla que alterna entre “Fabricar o comprar” y “Un equipo u otro”.
- La pantalla carga costos fijos y variables de las dos alternativas, consulta el endpoint de indiferencia y muestra el volumen, el costo común y qué conviene por debajo y por encima.
- Cuando no existe un punto, muestra el motivo literal del backend y no inventa infinito ni otro reemplazo.
- Se cubrió el fixture AM-04 y el camino sin punto con tests unitarios y E2E en cuatro viewports.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** usar nombres fijos según el modo (`Fabricar` / `Comprar` o `Equipo A` / `Equipo B`).
  **Qué otra opción había:** pedir nombres libres para cada estructura.
  **Por qué elegí esta:** el issue pide que cambie el rótulo, no agrega un dato de nombre, y así se mantiene una carga mínima para el dueño (Constitución §1 y §9).
- **Qué decidí:** tomar la unidad plural declarada por el tablero y la unidad/costo devueltos por el endpoint para presentar el resultado.
  **Qué otra opción había:** inferir “unidades” o fijarla en el componente.
  **Por qué elegí esta:** la unidad debe viajar declarada con el valor (Constitución §3).
- **Qué decidí:** derivar las frases “por debajo” y “por encima” únicamente de `convieneA` y `convieneB`.
  **Qué otra opción había:** recalcular la conveniencia comparando los costos ingresados.
  **Por qué elegí esta:** el frontend no recalcula resultados económicos publicados por backend (FE-07).

## Dónde el issue no alcanzaba

- No definía si los nombres de las alternativas eran editables; se usaron los rótulos del propio modo.
- No definía dónde ubicar el bloque dentro del tablero; se colocó junto a las demás herramientas de análisis, después de planeamiento de resultados.
- El primer intento E2E buscaba el texto completo desde el nodo `<strong>` y falló aunque la pantalla era correcta; se ajustó el selector al párrafo contenedor.

## Qué quedó afuera

- No se implementó `dejar_de_fabricar` ni R25: el contrato indicado por este issue es la comparación genérica de dos estructuras.
- No se agregaron nombres libres ni persistencia de escenarios porque el issue no los pide.

## Con qué se verifica

```bash
npm run lint
# 0 errores; 109 warnings preexistentes

npm run typecheck
# verde

npm test
# 66 archivos, 292 tests verdes

npm run build
# verde

npm run test:e2e -- --grep "compara dos equipos con AM-04"
# 4/4 verdes

npm run test:e2e
# 202 verdes, 2 omitidos

gh pr checks 234 -R Coste-AR/CosteAR-frontend
# build, E2E, G7, guardas, Vercel y auto-etiquetado verdes
```
