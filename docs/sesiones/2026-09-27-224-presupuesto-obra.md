---
issue: 224
repo: CosteAR-frontend
pr: 239
rama: feat/presupuesto-obra
agente: codex
modelo: gpt-5
tanda: C1
inicio: 2026-09-27T18:27-03:00
fin: 2026-09-27T19:06-03:00
minutos: 39
tokens: no-informado
clears: 0
intentos_hasta_verde: 2
rojos_deliberados: 1
rebotes_de_guarda: 0
---

# 2026-09-27 — El presupuesto de la obra queda visible y respeta la doble aprobación

Prompt vigente de Alan: `b3e7221`.

## Qué se hizo

- Se agregó la pestaña Presupuesto al detalle de la obra, con precio contractual, costo previsto aprobado, versiones, vigencia y renglones por elemento y etapa.
- Se conectaron las acciones preparar, aprobar, rechazar y revalidar a las rutas publicadas por backend #472.
- Se deshabilita aprobar cuando la versión está vencida y se ofrece revalidar; quien preparó una versión no ve la acción Aprobar.
- La base aprobada se identifica explícitamente como solo lectura y la ausencia de precio por permisos se declara en vez de mostrar cero.
- Se escribió primero el E2E del camino negativo y se comprobó rojo antes de implementar (Constitución §5).

## Decisiones que tomé sobre la marcha

- **Qué decidí:** usar `VersionPresupuesto` del léxico del paquete para nombrar los adicionales. **Qué otra opción había:** escribir «Adicional» fijo en la pantalla. **Por qué elegí esta:** el rubro decide el vocabulario y no el frontend (Constitución §4).
- **Qué decidí:** declarar «No disponible para tu permiso» cuando el GET omite `precioContractual`. **Qué otra opción había:** mostrar cero. **Por qué elegí esta:** cero sería un valor inventado (Constitución §2).
- **Qué decidí:** mostrar el `unidadId` que viaja en cada renglón, sin inferir un nombre desde el elemento. **Qué otra opción había:** deducir «kg», «horas» u otra unidad. **Por qué elegí esta:** el contrato no publica el nombre y la unidad debe viajar declarada (Constitución §3).
- **Qué decidí:** usar la identidad de sesión para ocultar Aprobar al preparador y dejar el resto de permisos a la API. **Qué otra opción había:** inventar permisos en el perfil del frontend. **Por qué elegí esta:** el contrato actual del perfil no publica permisos de presupuesto y el backend ya aplica el 403.

## Dónde el issue no alcanzaba

- No define un formulario de alta ni el contrato necesario para resolver nombres de unidades. Se implementaron la lectura y las cuatro transiciones pedidas, sin inventar campos.
- No define permisos de presupuesto dentro del perfil de sesión. La pantalla anticipa solamente la separación preparador/aprobador que puede comprobar con los datos publicados; la API sigue siendo la autoridad para los demás permisos.

## Qué quedó afuera

- Alta y edición de versiones, porque faltan el contrato visible de unidades y criterios de formulario.
- Informe presupuesto contra real, expresamente fuera de alcance en #224.

## Con qué se verifica

```bash
npm run lint                    # 0 errores; 109 warnings preexistentes
npm run typecheck               # verde
npm test -- --run               # 70 archivos; 307 tests
npm run build                   # verde
npm run check:feature-tests     # 21/21 features cubiertas
npm run test:e2e                # 226 pass; 2 skip
```
