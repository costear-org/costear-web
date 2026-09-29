---
issue: 225
repo: CosteAR-frontend
pr: 243
rama: feat/225-deposito-inventario
agente: codex
modelo: gpt-5
tanda: C1
inicio: 2026-09-29T07:01-03:00
fin: 2026-09-29T08:01-03:00
minutos: 60
tokens: no-informado
clears: 0
intentos_hasta_verde: 13
rojos_deliberados: 1
rebotes_de_guarda: 0
---

# 2026-09-29 — El depósito registra ingresos y salidas por obra

## Recursos — qué se usó

- Prompt vigente de Lauti: `a4e71de`.
- Se instaló el lockfile con `npm ci` porque este worktree no tenía `node_modules`.
- La primera corrida unitaria global tuvo cuatro timeouts del briefing mientras Vitest competía
  con lint, typecheck y build. La única repetición, ejecutada aislada y sin cambiar código, dio
  315/315; se registró como intermitencia de recursos, no como verde de la primera corrida.
- Playwright completo se ejecutó dos veces. La primera dejó 257 casos verdes y un timeout del E2E
  nuevo en WebKit después de completar el flujo en 33 s. Se fijó un límite específico de 60 s para
  ese recorrido de tres escrituras y la segunda suite quedó verde: 258 pasados y 6 salteados.

## Qué se hizo

- Se agregó la entrada protegida `/inventario`, que usa el negocio indicado o el único negocio
  disponible, y pide elegir cuando hay más de uno.
- La pantalla lista artículos con saldo, unidad legible, PPP y valor total. «Depósito» y «Obra»
  salen del léxico del paquete; si faltan, la pantalla declara que el paquete está incompleto.
- Se agregaron formularios de ingreso y salida. El ingreso carga cantidad, costo unitario, gastos,
  fecha, mes y referencia. La salida exige una obra antes de enviar.
- El 422 por saldo insuficiente se muestra con el mensaje real del backend y conserva el formulario.
  Un 403 al listar inventario se declara como falta de permiso; nunca se transforma en ceros.
- El acceso al depósito aparece dentro de Operación sólo cuando el paquete declara ese nombre.
- El E2E recorre primero el rechazo por 80 u. contra saldo 75, luego registra un ingreso y una
  salida asignada a una obra y comprueba que el saldo final vuelve a 75 u., con captura en cuatro
  viewports.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** mostrar PPP y valor sin símbolo monetario, acompañados por «Moneda no informada».
  **Qué otra opción había:** asumir ARS y mostrar `$`. **Por qué elegí esta:** el contrato no publica
  moneda; inventarla contradiría Constitución §2 y §3.
- **Qué decidí:** usar `/inventario` como entrada canónica y aceptar `companyId` en la búsqueda.
  **Qué otra opción había:** crear sólo una ruta anidada bajo `/companies/:id`. **Por qué elegí esta:**
  el paquete ya publica `/inventario` como destino de su acción, mientras el parámetro permite llegar
  desde una operación concreta sin inventar un negocio.
- **Qué decidí:** pedir «Mes al que corresponde» y enviar su primer día como `periodoImputado`.
  **Qué otra opción había:** copiar la fecha del movimiento en silencio. **Por qué elegí esta:** el
  backend exige las dos decisiones y ocultar una habría inventado la imputación (Constitución §9).
- **Qué decidí:** escribir primero el test del rechazo y la obra obligatoria. **Qué otra opción había:**
  implementar la pantalla y cubrirla después. **Por qué elegí esta:** Constitución §5 exige rojo antes
  que verde.
- **Qué decidí:** tomar `Deposito` y `OrdenTrabajo` del paquete y no mostrar el acceso si `Deposito`
  falta. **Qué otra opción había:** hardcodear «Depósito» para todos los rubros. **Por qué elegí esta:**
  Constitución §4 deja el vocabulario en el paquete.

## Dónde el issue no alcanzaba

- No decía cómo representar `periodoImputado`, aunque el contrato lo exige como fecha. La UI lo
  presenta como mes y usa el día 1 sólo como representación del período elegido.
- No decía cómo entrar a la pantalla. Se respetó el destino `/inventario` ya publicado por el paquete
  y se agregó un acceso contextual desde Operación sin sumar una petición nueva a la ficha del negocio.
- El contrato publica `saldoValor` y `ppp`, pero no moneda. Se declaró esa ausencia en vez de asumirla.
- El wrapper global de `npm` resuelve por error un `npm-cli.js` de AppData. Los comandos se ejecutaron
  con el CLI instalado en `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js`.

## Qué quedó afuera

- Devolución y transferencia siguen fuera de alcance por decisión `/agente`; dependen de
  `Coste-AR/CosteAR-backend#501`.
- Alta y edición de artículos, catálogo de unidades y selección de depósito no fueron pedidos.
- No se cambió el permiso backend que decide quién puede leer PPP o valores. La UI sólo declara el
  403 que reciba.

## Con qué se verifica

```bash
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run lint
# 0 errores; 109 advertencias previas

node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run typecheck
# verde

node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test
# 72 archivos, 315 tests pasados

node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build
# verde; advertencia previa de chunk mayor a 500 kB

node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run check:feature-tests
# 22 features verificadas: 22 cubiertas y 0 excepciones

node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:e2e
# 258 pasados, 6 salteados, cuatro viewports, 16.0 min
```
