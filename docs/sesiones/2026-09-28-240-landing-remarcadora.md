---
issue: 240
repo: CosteAR-frontend
pr: 241
rama: feat/landing-remarcadora
agente: claude-code
modelo: claude-opus-5-5
tanda: fuera de tanda (pedido directo de Giuli)
inicio: 2026-09-28T11:30-03:00
fin: 2026-09-28T12:40-03:00
minutos: 70
tokens: no-informado
clears: 0
intentos_hasta_verde: 3
rojos_deliberados: 1
rebotes_de_guarda: 1
---

# 2026-09-28 — Landing nueva: «Remarcá con números, no a ojo»

## Qué se hizo

- Se reemplazó la landing entera. Salen el mockup de iPhone, las métricas inventadas (34,8 %, 90 %, un dólar fijo), los planes en dólares, la cuenta regresiva vencida, los íconos de tiendas y el «Comité de Auditoría».
- El lenguaje visual es la remarcadora de precios: stickers viejos apagados debajo y el precio que calcula CosteAR estampado arriba, en granate.
- Una sola acción en toda la página: escribir por WhatsApp (email como alternativa). La barra no tiene links a secciones.
- Recorrido: promesa → los dos errores de remarcar a ojo → probar la remarcadora → la cuenta (costos + dólar e inflación = precio) → respaldo de la cátedra → preguntas frecuentes → cierre.
- El ejemplo interactivo vive en `demo-margen.ts`, con test propio, escrito en rojo antes de implementarlo (Constitución §5).

## Decisiones que tomé sobre la marcha

- **Qué decidí:** escribirle al dueño, sin jerga. **Qué otra opción había:** hablarle al costista con Wilson, ITCS y prorrateos. **Por qué elegí esta:** Constitución §1; el primer borrador mostraba cifras de la cátedra que a un dueño no le dicen nada.
- **Qué decidí:** mostrar una sola prueba del método ($ 943.250 de materia prima consumida). **Qué otra opción había:** la tabla de cuatro comprobaciones. **Por qué elegí esta:** es un resultado que el backend verifica en `tests/domain/cost-statement.test.ts` y se entiende sin saber de costos.
- **Qué decidí:** decir «sigue lo que se enseña en Costos I y Costos II de la UNT». **Qué otra opción había:** «aval» o «certificación». **Por qué elegí esta:** Giuli confirmó que no existe un aval formal; la base de conocimiento confirma la cátedra de Costos I de la UNT.
- **Qué decidí:** no mostrar precios. **Qué otra opción había:** planes. **Por qué elegí esta:** hoy se vende con una conversación que adapta el sistema a cada negocio (pedido de Giuli). La pregunta frecuente lo dice así.
- **Qué decidí:** no usar «48–72 horas → minutos». **Qué otra opción había:** repetirlo del spec original. **Por qué elegí esta:** es una estimación que nadie midió (Constitución §2).
- **Qué decidí:** reemplazar «empresa» por «negocio» en los textos. **Por qué:** lo pidió la guarda de vocabulario (`src/vocabulario.test.ts`).

## Dónde el pedido no alcanzaba

- No había cliente ni testimonio para mostrar: la página no tiene prueba social y queda hueco para cuando exista.
- El primer diseño (una hoja de costo con slider en el hero) Giuli lo rechazó por genérico y cargado. La auditoría que siguió: el hero no pasaba la prueba de los cinco segundos, había siete salidas compitiendo con el objetivo, el esqueleto era el de cualquier SaaS y no se respondían las dudas que frenan una venta por conversación.

## Qué quedó afuera

- Testimonio o logo de cliente, hasta que haya permiso para nombrarlo.
- Medición de conversiones (clicks en WhatsApp o email).

## Con qué se verifica

```bash
npm run lint                    # 0 errores; 109 warnings preexistentes
npm run typecheck               # verde
npx vitest run src/features/landing src/vocabulario.test.ts   # verde
npm test                        # 311/314; los 3 rojos son timeouts de 5 s con la máquina cargada
                                # (vocabulario y briefing), verdes corridos solos
npm run check:feature-tests     # 21/21
npx playwright test tests/e2e/landing.spec.ts tests/e2e/smoke-publico.spec.ts
                                # 49 pass, 2 skip, 1 timeout en webkit con 8 workers; webkit solo: 6/6
```
