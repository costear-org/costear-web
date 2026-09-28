---
issue: 240
repo: CosteAR-frontend
pr: 241
rama: feat/landing-remarcadora
agente: claude-code
modelo: claude-opus-5-5
tanda: fuera de tanda (pedido directo de Giuli)
inicio: 2026-09-28T11:30-03:00
fin: 2026-09-28T13:20-03:00
minutos: 110
tokens: no-informado
clears: 0
intentos_hasta_verde: 4
rojos_deliberados: 1
rebotes_de_guarda: 2
---

# 2026-09-28 — Landing nueva: «Remarcá con números, no a ojo»

## Qué se hizo

- Se reemplazó la landing entera. Salen el mockup de iPhone, las métricas inventadas (34,8 %, 90 %, un dólar fijo), los planes en dólares, la cuenta regresiva vencida, los íconos de tiendas y el «Comité de Auditoría».
- Hero claro con la grilla de puntos del login (ahora puede ajustarse a su contenedor) y **capturas reales de la app**: el tablero en escritorio y en el celular, sacados del frontend con la API simulada y datos ficticios (`scripts/capturas-landing.mjs`). Tres anotaciones explican qué es cada parte del tablero.
- Íconos propios en degradé granate (`Icono.tsx`), una franja con las fuentes reales (BCRA, INDEC, Costos I y II de la UNT, Excel) en lugar de logos de clientes, y una grilla de funciones: el simulador interactivo de la suba del dólar, la alerta de margen, la carga desde el celular, la trazabilidad y el punto de equilibrio.
- Una acción principal: escribir por WhatsApp, con email como alternativa. Preguntas frecuentes sobre precio, Excel, rubro, conocimientos y datos.
- El ejemplo interactivo vive en `demo-margen.ts`, con test propio escrito en rojo antes de implementarlo (Constitución §5).

## Decisiones que tomé sobre la marcha

- **Qué decidí:** escribirle al dueño, sin jerga. **Qué otra opción había:** hablarle al costista con Wilson, ITCS y prorrateos. **Por qué elegí esta:** Constitución §1.
- **Qué decidí:** mostrar el producto con capturas reales. **Qué otra opción había:** dibujar pantallas en HTML. **Por qué elegí esta:** Giuli marcó que el mockup dibujado no era realista; las capturas salen del frontend de verdad y se pueden regenerar.
- **Qué decidí:** ocultar el pie de la app en las capturas. **Por qué:** dice «auditado académicamente por la Cátedra», un aval que no existe formalmente (Constitución §2). El texto sigue en `AppShell.tsx` y hay que corregirlo aparte.
- **Qué decidí:** capturar los accesos rápidos vacíos. **Qué otra opción había:** inventar etiquetas. **Por qué elegí esta:** el catálogo sale del paquete de cada rubro; inventarlo mostraba algo que la app no ofrece.
- **Qué decidí:** los números grandes del método son resultados de la cátedra que el backend reproduce en sus tests (`cost-statement`, `direct-labor`). **Qué otra opción había:** estadísticas de uso. **Por qué elegí esta:** no hay métricas de uso reales para mostrar.
- **Qué decidí:** decir «sigue lo que se enseña en Costos I y Costos II de la UNT», sin «aval» ni «certificación». **Por qué:** Giuli confirmó que no hay aval formal.
- **Qué decidí:** no mostrar precios ni la estimación «48–72 horas». **Por qué:** se vende con una conversación, y la estimación nadie la midió.
- **Qué decidí:** «negocio» en lugar de «empresa». **Por qué:** lo pidió la guarda de vocabulario.

## Dónde el pedido no alcanzaba

- No había cliente ni testimonio: la página no tiene prueba social y queda el hueco para cuando exista.
- La dirección visual se encontró iterando con Giuli: una hoja de costo con slider (genérica y cargada), stickers de remarcadora (casera), un hero granate sólido (pesado, mockup dibujado) y, finalmente, hero claro con capturas reales. Las referencias que destrabaron fueron cuatro landings de fintech: la vara era la terminación, no copiarlas.

## Qué quedó afuera

- Corregir el pie de la app que afirma un aval académico (`src/components/layout/AppShell.tsx`).
- Capturas reales del simulador y del panel de carga: necesitan más respuestas de la API simuladas. Hoy esos paneles están dibujados.
- Testimonio o logo de cliente, hasta que haya permiso para nombrarlo.
- Medición de conversiones (clicks en WhatsApp o email).

## Con qué se verifica

```bash
npm run lint                    # 0 errores; 109 warnings preexistentes
npm run typecheck               # verde
npx vitest run src/features/landing src/vocabulario.test.ts src/features/auth   # 41/41
npm run check:feature-tests     # 21/21
npx playwright test tests/e2e/landing.spec.ts tests/e2e/smoke-publico.spec.ts tests/e2e/auth.spec.ts --workers=4
                                # 58 pass, 2 skip, en los cuatro viewports
```
