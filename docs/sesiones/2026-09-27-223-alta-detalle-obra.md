---
issue: 223
repo: CosteAR-frontend
pr: 238
rama: feat/alta-detalle-obra
agente: codex
modelo: gpt-5
tanda: C1
inicio: 2026-09-27T17:26-03:00
fin: 2026-09-27T17:52-03:00
minutos: 26
tokens: no-informado
clears: 0
intentos_hasta_verde: 3
rojos_deliberados: 1
rebotes_de_guarda: 1
---

# 2026-09-27 — Alta y seguimiento de obras desde un modelo

Prompt vigente de CosteAR-os: `b3e7221`.

## Qué se hizo

- Se agregó el acceso a Operación desde la ficha del negocio, con listado y alta de obras.
- El alta permite elegir un modelo opcional y lleva al detalle, donde se ven las etapas y se distinguen las de entrega.
- El detalle ofrece solamente la transición siguiente válida y la cancelación cuando corresponde.
- «Obra», «Etapa» y «Modelo» se obtienen del léxico resuelto del paquete de la empresa.
- El conflicto 409 por código repetido conserva el formulario y explica: «Ya existe una obra con ese código.»

## Decisiones que tomé sobre la marcha

- **Qué decidí:** usar rutas anidadas bajo la empresa para listado y detalle.
  **Qué otra opción había:** una pantalla global que obligara a elegir empresa.
  **Por qué elegí esta:** el léxico pertenece a la empresa y la ruta mantiene ese contexto sin inferirlo (Constitución §4).
- **Qué decidí:** mostrar un error explícito si el paquete no publica las tres claves requeridas.
  **Qué otra opción había:** caer silenciosamente a «orden de trabajo».
  **Por qué elegí esta:** un fallback visible inventaría vocabulario ausente (Constitución §2 y §4).
- **Qué decidí:** derivar los botones desde la secuencia de estados publicada por el backend y no mostrar cierre directo.
  **Qué otra opción había:** ofrecer todos los estados y dejar que la API rechazara saltos.
  **Por qué elegí esta:** evita acciones que el contrato ya declara inválidas sin duplicar reglas de presupuesto o cierre.

## Dónde el issue no alcanzaba

- El contrato enumeraba campos principales, pero no detallaba los envelopes JSON de lista, modelos, etapas ni transición; se tomaron de los schemas y rutas mergeados en `backend/dev`.
- La primera corrida remota rebotó porque la guarda de cobertura exige además un test dentro de cada carpeta de feature; el E2E fuera de `src/` no satisface esa convención. Se agregó cobertura unitaria de mensaje 409 y transición siguiente.
- No definía una URL de entrada; se eligió la ficha del negocio con una acción neutral «Operación», y el nombre específico se resuelve recién con el paquete.
- No indicaba si una obra podía cancelarse desde esta fase; el backend lo permite para cualquier estado no final y la pantalla refleja exactamente esa posibilidad.

## Qué quedó afuera

- Presupuesto e inventario, como exige el alcance del issue.
- El cierre definitivo: el backend exige su flujo específico y este issue no lo incluye.

## Con qué se verifica

```bash
npm run lint       # 0 errores; 109 warnings preexistentes
npm run typecheck  # verde
npm run test       # 70 archivos, 306 tests verdes
npm run build      # verde
npm run test:e2e   # 222 tests verdes, 2 omitidos; 8/8 casos nuevos verdes en cuatro viewports
npm run check:feature-tests # 21 features cubiertas, 0 excepciones
```
