---
issue: 211
repo: CosteAR-frontend
pr: 237
rama: feat/ranking-rotacion
agente: codex
modelo: gpt-5
tanda: B3
inicio: 2026-09-27T11:21-03:00
fin: 2026-09-27T11:59-03:00
minutos: 38
tokens: no-informado
clears: 0
intentos_hasta_verde: 3
rojos_deliberados: 2
rebotes_de_guarda: 1
---

# 2026-09-27 — Ranking comercial por margen y rotación

## Qué se hizo

- Se incorporó al tablero del dueño el ranking que ordena por rendimiento (`margen × rotación`) y deja margen, rotación y rendimiento a la vista.
- Se agregó el cambio opcional a orden por margen, mostrando siempre la advertencia que devuelve el backend.
- Las rotaciones por defecto se rotulan como «estimada (valor por defecto)» y los productos excluidos explican qué dato falta cargar.
- Se cubrió el fixture AM-13 con pruebas de componente, hook y Playwright en cuatro viewports.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** ubicar el ranking junto a los demás análisis del tablero y consultar el endpoint con el período seleccionado.
  **Qué otra opción había:** crear una pantalla o ruta independiente.
  **Por qué elegí esta:** el issue pedía una pantalla de análisis y el tablero ya reúne los paneles B3 relacionados; además el contrato real exige `periodoId`. Se aplicaron Constitución §1 y §3.
- **Qué decidí:** traducir `ROTACION_SIN_DECLARAR` a una explicación concreta y conservar el producto fuera del ranking.
  **Qué otra opción había:** mostrar el código técnico o inventar una rotación cero.
  **Por qué elegí esta:** evita jerga y declara la ausencia sin fabricar un valor (Constitución §1 y §2).
- **Qué decidí:** enviar `criterio=margen` sólo cuando la persona elige ese orden; para el orden inicial se usa el default contractual.
  **Qué otra opción había:** enviar siempre el parámetro.
  **Por qué elegí esta:** mantiene la llamada inicial alineada con el contrato por defecto y hace explícita la decisión alternativa.

## Dónde el issue no alcanzaba

- El contrato resumido del issue no mencionaba que `periodoId` es obligatorio. Se verificó el schema y la ruta del backend #428 y se usó el período ya seleccionado en el tablero.
- No indicaba dónde integrar el panel. Se siguió el patrón de los análisis B3 ya presentes en el tablero del dueño.
- El primer intento de la suite completa corrió en paralelo con el build: 296 pruebas pasaron y las cuatro pruebas del briefing excedieron su timeout de 5 segundos. Repetida la suite de forma aislada, pasaron 300/300.
- Al actualizar contra `dev`, el panel de precio de transferencia del issue #210 había entrado en las mismas zonas de integración. Se conservaron ambos paneles y se verificaron juntos con 18 pruebas unitarias y 8 E2E en cuatro viewports.
- Prompt de trabajo vigente: `b3e7221`.

## Qué quedó afuera

- El formulario para cargar rotaciones, expresamente fuera de alcance en el issue.
- No se modificó el cálculo ni el orden: ambos vienen del backend y se muestran sin recalcular.

## Con qué se verifica

```bash
npm run lint                 # 0 errores; 109 warnings preexistentes
npm run typecheck            # verde
npm test                     # 68 archivos, 300 pruebas verdes
npm run build                # verde
npm run check:feature-tests  # 20/20 features cubiertas
npm run test:e2e             # 210 verdes, 2 omitidas
```
