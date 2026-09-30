---
issue: 227
repo: CosteAR-frontend
pr: 246
rama: feat/227-informe-obra
agente: codex
modelo: gpt-5
tanda: C1
inicio: 2026-09-30T07:04:19-03:00
fin: 2026-09-30T08:33:02-03:00
minutos: 89
tokens: no-informado
clears: 0
intentos_hasta_verde: 25
rojos_deliberados: 1
rebotes_de_guarda: 0
---

# 2026-09-30 — La obra muestra su resultado y puede cerrarse sin perder la historia

Prompt operativo vigente: `CosteAR-os/software/prompts/lauti.md` versión `a4e71de`.

## Recursos — qué se usó

- Se instaló el lockfile con `npm ci` porque el worktree no tenía `node_modules`; el shim de npm del perfil estaba roto y se usó `C:\Program Files\nodejs\npm.cmd`.
- Los 25 intentos cuentan ejecuciones funcionales separadas de test, lint, tipos, build, guarda y Playwright, incluidos los arranques fallidos por entorno y las correcciones intermedias. La instalación de dependencias no se contó como verificación.
- El rojo deliberado fue el test de 403 escrito antes de que existiera `ResultadoPanel`.
- La suite E2E completa tardó 22,3 minutos con un worker.

## Qué se hizo

- Se agregó la pestaña **Resultado** al detalle de la Obra, con presupuesto vs. real por elemento, márgenes, puente del desvío y proyección al terminar. La pantalla muestra los valores que entrega backend y no reproduce sus fórmulas.
- Se agregó el cierre de la Obra. Si backend responde que quedan horas, costos, partidas o cambios de presupuesto pendientes, la pantalla los lista en lenguaje legible y no expone UUID.
- Se agregó la reapertura con motivo obligatorio y el historial de fotos de cierre con versión, fecha, versión de motor y motivo de reapertura.
- Se cubrieron las dos formas vigentes de restricción de margen: respuesta 403 y respuesta 200 sin los campos de precio/margen. Ninguna se convierte en cero.
- Se agregó prueba de componente y un E2E que recorre bloqueo, cierre, foto, validación de motivo y reapertura; un segundo E2E cubre el 403. Los dos dejan captura completa en los cuatro viewports.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** mostrar los importes sin símbolo y declarar «Moneda no informada».
  **Qué otra opción había:** copiar el `$` que usa la pestaña Presupuesto.
  **Por qué elegí esta:** el nuevo contrato no publica moneda ni unidad. Inferir pesos habría inventado la unidad, contra Constitución §2 y §3.
- **Qué decidí:** manejar tanto el 403 pedido por el issue como la omisión de `margenEsperado`/`margenReal` que hace hoy la ruta backend para un operador sin permiso.
  **Qué otra opción había:** implementar sólo el 403 literal del criterio.
  **Por qué elegí esta:** la ruta vigente filtra campos y responde 200; ignorarlo habría mostrado una pantalla incompleta sin explicación. Se declararon ambas ausencias, conforme Constitución §2 y §9.
- **Qué decidí:** mostrar el signo, total y sentido del puente exactamente como llegan de backend.
  **Qué otra opción había:** volver a sumar partidas o convertir importes favorables a absolutos en frontend.
  **Por qué elegí esta:** el frontend no es otro motor de cálculo; alterar el signo o recalcular abriría una segunda verdad.
- **Qué decidí:** el historial muestra metadatos estables y el motivo, sin interpretar `congelado`.
  **Qué otra opción había:** adivinar la estructura interna del JSON y reconstruir una vista histórica.
  **Por qué elegí esta:** el schema publica `congelado` como `unknown`; interpretarlo sin contrato violaría Constitución §9.
- **Qué decidí:** traducir los tipos técnicos de pendientes a cuatro mensajes y omitir sus ids.
  **Qué otra opción había:** imprimir la respuesta de backend sin procesar.
  **Por qué elegí esta:** quien usa la pantalla decide qué resolver y no necesita identificadores técnicos (Constitución §1).

## Dónde el issue no alcanzaba

- El issue exige 403 para planta, pero la implementación vigente de backend devuelve 200 y elimina los campos de margen cuando falta `ordenes.ver_margen`. Se cubrieron los dos contratos observables.
- Ninguno de los endpoints monetarios declara moneda. La pantalla no podía usar `$` sin inferir.
- «Historial de fotos» no define si hay que abrir el JSON congelado. El schema tampoco tipa ese contenido; se mostró la historia verificable disponible y no se inventó un visor.
- No se definió si cerrar debía llevar confirmación adicional. Se conservó una acción explícita y se dejó que backend valide pendientes; no se agregó un modal sin criterio.

## Qué quedó afuera

- La cartera de Obras, excluida expresamente por el issue.
- Un visor del contenido congelado de cada foto: `congelado` sigue publicado como `unknown`.
- Cambios al motor, a los contratos backend y a la pestaña Presupuesto.

## Con qué se verifica

```text
npm run lint
0 errores, 109 advertencias preexistentes.

npm run typecheck
verde.

npm run test -- --pool=forks --maxWorkers=1
73 archivos, 319 tests pasados.

npm run build
verde; 2.857 módulos transformados.

npm run check:feature-tests
22/22 features cubiertas, 0 excepciones.

npm run test:e2e -- --workers=1 --reporter=line
266 pasados, 6 salteados, 22,3 min, cuatro viewports.

gh pr update-branch 246
rama ya al día con dev.

Checks remotos del PR #246
build-and-test 1m43s; E2E 16m38s; G7 y Vercel verdes.
```
