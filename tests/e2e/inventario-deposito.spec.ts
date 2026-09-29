import { testConSesion as test, expect, laAppPinto } from './fixtures';

const COMPANY_ID = '15151515-1515-4515-8515-151515151515';
const ARTICLE_ID = '25252525-2525-4525-8525-252525252525';
const ORDER_ID = '35353535-3535-4535-8535-353535353535';

// El flujo recorre tres escrituras y espera la invalidación del listado tras
// cada una. WebKit supera de forma consistente los 30 s por unos pocos
// segundos; el margen evita confundir duración real con una regresión.
test.setTimeout(60_000);

test('registra ingreso y salida por obra, rechaza el exceso y termina con 75 u.', async ({ page, consola }) => {
  let saldoCantidad = 75;
  let saldoValor = 88_500;
  let ppp = 1_180;
  const writes: Array<Record<string, unknown>> = [];

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    if (method === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/paquete-rubro`) {
      return json({ data: { category: 'CONSTRUCCION_MODULAR', lexicon: { OrdenTrabajo: 'Obra', Deposito: 'Depósito' } } });
    }
    if (method === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/ordenes-trabajo`) {
      return json({ data: [{ id: ORDER_ID, codigo: 'OB-01', descripcion: 'Módulo de prueba', cliente: 'Cliente ficticio', estado: 'EN_PRODUCCION', etiquetaEstado: 'En producción' }] });
    }
    if (method === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/articulos`) {
      return json({ data: [{ id: ARTICLE_ID, codigo: 'CHA-01', descripcion: 'Chapa de prueba', unidadId: '45454545-4545-4545-8545-454545454545', unidad: { id: '45454545-4545-4545-8545-454545454545', nombre: 'unidad', simbolo: 'u.' }, almacenable: true, saldoCantidad, saldoValor, ppp }] });
    }
    if (method === 'POST' && path === `/api/v1/companies/${COMPANY_ID}/movimientos-inventario`) {
      const body = request.postDataJSON() as Record<string, unknown>;
      writes.push(body);
      const cantidad = Number(body.cantidad);
      if (body.tipo === 'SALIDA' && cantidad > saldoCantidad) {
        return json({ error: { code: 'STOCK_INSUFICIENTE', message: `La salida de ${cantidad} supera el saldo disponible de ${saldoCantidad}` } }, 422);
      }
      if (body.tipo === 'INGRESO') {
        saldoValor += cantidad * Number(body.costoUnitario);
        saldoCantidad += cantidad;
        ppp = saldoValor / saldoCantidad;
      } else {
        expect(body).toMatchObject({ tipo: 'SALIDA', ordenId: ORDER_ID });
        saldoValor -= cantidad * ppp;
        saldoCantidad -= cantidad;
      }
      return json({ data: { id: `movement-${writes.length}` } }, 201);
    }
    return route.fallback();
  });

  await page.goto(`/inventario?companyId=${COMPANY_ID}`);
  await laAppPinto(page);
  await expect(page.getByRole('heading', { name: 'Depósito' })).toBeVisible();
  await expect(page.getByText('75 u.')).toBeVisible();
  await expect(page.getByText('PPP 1.180')).toBeVisible();

  await page.getByRole('button', { name: 'Registrar salida' }).click();
  await page.getByLabel('Artículo', { exact: true }).selectOption(ARTICLE_ID);
  await page.getByLabel('Cantidad').fill('80');
  await page.getByLabel('Fecha').fill('2026-09-29');
  await page.getByLabel('Mes al que corresponde').fill('2026-09');
  await page.getByRole('button', { name: 'Guardar salida' }).click();
  expect(writes).toHaveLength(0);

  await page.getByLabel('Obra').selectOption(ORDER_ID);
  await page.getByRole('button', { name: 'Guardar salida' }).click();
  await expect(page.getByRole('alert')).toHaveText('La salida de 80 supera el saldo disponible de 75');
  expect(writes).toHaveLength(1);

  await page.getByRole('button', { name: 'Registrar ingreso' }).click();
  await page.getByLabel('Artículo', { exact: true }).selectOption(ARTICLE_ID);
  await page.getByLabel('Cantidad').fill('10');
  await page.getByLabel('Costo por unidad').fill('1300');
  await page.getByLabel('Fecha').fill('2026-09-29');
  await page.getByLabel('Mes al que corresponde').fill('2026-09');
  await page.getByRole('button', { name: 'Guardar ingreso' }).click();
  await expect(page.getByRole('status')).toHaveText('Ingreso registrado.');
  await expect(page.getByText('85 u.')).toBeVisible();

  await page.getByRole('button', { name: 'Registrar salida' }).click();
  await page.getByLabel('Artículo', { exact: true }).selectOption(ARTICLE_ID);
  await page.getByLabel('Obra').selectOption(ORDER_ID);
  await page.getByLabel('Cantidad').fill('10');
  await page.getByLabel('Fecha').fill('2026-09-29');
  await page.getByLabel('Mes al que corresponde').fill('2026-09');
  await page.getByRole('button', { name: 'Guardar salida' }).click();

  await expect(page.getByText('75 u.')).toBeVisible();
  expect(writes).toHaveLength(3);
  expect(writes[2]).toMatchObject({
    articuloId: ARTICLE_ID,
    tipo: 'SALIDA',
    cantidad: 10,
    ordenId: ORDER_ID,
    periodoImputado: '2026-09-01',
  });
  await page.getByText('75 u.').scrollIntoViewIfNeeded();
  expect(consola.mensajes).toEqual([]);
});
