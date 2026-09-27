---
issue: 210
repo: CosteAR-frontend
pr: 236
rama: feat/precio-transferencia
agente: codex
modelo: gpt-5
tanda: B3
inicio: 2026-09-27T09:20-03:00
fin: 2026-09-27T11:25-03:00
minutos: 125
tokens: no-informado
clears: 0
intentos_hasta_verde: 4
rojos_deliberados: 2
rebotes_de_guarda: 0
---

# 2026-09-27 — Las dos cifras del precio de transferencia explican para qué sirven

Prompt vigente de CosteAR-os: `b3e7221`.

## Qué se hizo

Se agregó al tablero del negocio el panel de precio de transferencia interna. Muestra lado a lado el equilibrio a costo variable y el equilibrio a precio de mercado, la diferencia entre ambos y el uso que el backend declara para cada criterio. El frontend consume el contrato de `GET /companies/{companyId}/analisis/precio-transferencia` sin recalcular los valores.

La cobertura incluye el hook del contrato, el fixture AM-11 (493,42 contra 510,20; diferencia 16,78), los dos caminos donde falta uno de los rótulos de uso y un recorrido Playwright con captura de página completa en cuatro viewports.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** usar las unidades devueltas por el endpoint para cada cifra.
  **Qué otra opción había:** inferir la unidad desde el tablero o escribir “unidades” fijo.
  **Por qué elegí esta:** la unidad viaja con el valor y no se inventa (`Constitución §3`).
- **Qué decidí:** ocultar las tres cifras y declarar la respuesta incompleta si falta cualquiera de los dos textos de uso.
  **Qué otra opción había:** mostrar el número cuyo texto sí llegó.
  **Por qué elegí esta:** el criterio de aceptación trata cifra y propósito como una pareja; mostrar sólo una parte habilitaría una decisión equivocada (`Constitución §2`).
- **Qué decidí:** ubicar el panel junto a las herramientas de análisis marginal existentes del tablero.
  **Qué otra opción había:** crear una ruta o pantalla independiente.
  **Por qué elegí esta:** el issue pidió una pantalla para comparar las dos cifras y el tablero ya concentra AM-02, AM-04, AM-05, AM-06 y AM-09; una ruta nueva agregaba alcance sin aportar al criterio.

## Dónde el issue no alcanzaba

- No definía la ubicación exacta ni la composición visual; se reutilizó el patrón de tarjetas del tablero.
- No decía qué hacer si el endpoint devuelve números pero omite un rótulo. Se declaró el bloque entero incompleto para que el dato no quede sin contexto.
- La primera ejecución no encontró `vitest` porque el worktree nuevo no tenía dependencias; `npm ci` corrigió el entorno.
- La suite E2E completa tuvo un fallo intermitente ajeno en Mobile Safari: tres requests de `configuracion-rubro` fueron rechazadas por controles de acceso del navegador. El caso aislado pasó al repetirlo (1/1). El flujo AM-11 pasó en los cuatro proyectos en ambas corridas.

## Qué quedó afuera

Nada del alcance de #210. No se agregó edición de precios de transferencia ni lógica de cálculo en el cliente.

## Con qué se verifica

```bash
npm run lint
# 0 errores; 109 warnings preexistentes

npm run typecheck
# verde

npm run test
# 68 archivos; 300 tests verdes

npm run build
# verde

npm run check:feature-tests
# 20 features verificadas; 20 cubiertas; 0 excepciones

npx playwright test tests/e2e/tablero-dueno.spec.ts --grep "muestra AM-11"
# 4 tests verdes (chromium, webkit, Mobile Chrome y Mobile Safari)

npm run test:e2e
# 209 verdes, 2 omitidos, 1 intermitente ajeno en Mobile Safari

npx playwright test tests/e2e/configuracion-rubro.spec.ts --project="Mobile Safari" --grep "completa opciones y números obligatorios"
# 1 test verde al repetir el único fallo de la suite completa
```
