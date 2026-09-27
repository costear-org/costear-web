---
issue: 190
repo: CosteAR-frontend
pr: 232
rama: feat/cargadores-entidades
agente: codex
modelo: gpt-5
tanda: B3
inicio: 2026-09-27T01:14:00-03:00
fin: 2026-09-27T01:42:44-03:00
minutos: 29
tokens: no-informado
clears: 0
intentos_hasta_verde: 3
rojos_deliberados: 1
rebotes_de_guarda: 0
---

# 2026-09-27 — El cargador ve sólo su chat y sus sectores

## Qué se hizo

- El rol `EMPRESA_OPERATOR` redirige desde `/tablero` y cualquier ruta protegida al chat de carga, sin sidebar ni secciones de métricas, envíos o vinculación.
- El chat consume el catálogo operativo de backend y sólo ofrece las acciones asociadas a entidades autorizadas. Sin alcance muestra el estado explícito del contrato y oculta el compositor.
- `EMPRESA_ADMIN` y `EMPRESARIO` tienen una entrada «Cargadores de datos» desde la que pueden invitar, revocar y asignar unidades productivas o depósitos.
- Se agregó cobertura unitaria de los tres contratos y Playwright de la vista de carga, la negación por defecto y la gestión administrativa en cuatro viewports.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** usar `operational-catalog` como única fuente del selector visible del chat.
  **Qué otra opción había:** derivar opciones desde estructuras, el rubro o texto local.
  **Por qué elegí esta:** el backend ya publica acción, entidad y etiqueta; derivarlas violaría Constitución §3, §4 y §9.
- **Qué decidí:** conservar los IDs de órdenes y permisos existentes al cambiar unidades o depósitos.
  **Qué otra opción había:** mandar arreglos vacíos y borrar alcance no mostrado por esta pantalla.
  **Por qué elegí esta:** el `PUT` reemplaza el alcance completo; conservar lo no editable evita pérdida silenciosa.
- **Qué decidí:** mostrar la entrada administrativa sólo a `EMPRESA_ADMIN` y `EMPRESARIO`, y rechazar esos accesos desde el rol cargador.
  **Qué otra opción había:** mostrar la ruta a todo rol autenticado y depender del 403 del backend.
  **Por qué elegí esta:** la pantalla no debe prometer una capacidad que el contrato niega y Constitución §4 deja la autorización en el paquete/rol, no en una suposición visual.

## Dónde el issue no alcanzaba

- El contrato del catálogo informa `destino`, pero `POST /empresa-portal/submit` no acepta acción ni entidad. La pantalla exige seleccionar una opción para dar contexto visible, pero no inventa un campo que backend no publica (Constitución §9).
- El issue nombra `/tablero`, mientras el frontend canónico usa `/dashboard`; se agregó el alias protegido `/tablero` para cubrir literalmente el criterio sin cambiar la ruta existente.
- No definía cómo elegir negocio en la pantalla administrativa. Para uno se selecciona automáticamente; para varios se muestra selector, sin implementar el flujo «empresario con varias empresas» que el issue deja fuera.
- Prompt operativo vigente leído fuera del repo: `b3e7221`.

## Qué quedó afuera

- Cambios de roles, persistencia y endpoints: ya pertenecen a backend #401, #418 y #488.
- Un flujo especializado para empresario con varias empresas, fuera de alcance explícito.
- Enviar la acción o entidad seleccionada junto al documento: el contrato de `submit` no publica esos campos.

## Con qué se verifica

```bash
npm run lint
# verde: 0 errores; 109 warnings preexistentes

npm run typecheck
# verde

npm run test
# 64 archivos, 285 tests verdes

npm run check:feature-tests
# 20 features verificadas, 20 cubiertas, 0 excepciones

npm run build
# verde; advertencia preexistente por chunks mayores a 500 kB

npm run test:e2e
# 194 verdes, 2 omitidos, 4 viewports

npx playwright test tests/e2e/cargadores-datos.spec.ts
# 12/12 verdes después del ajuste final de guardas
```
