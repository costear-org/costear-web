import { testConSesion as test, expect, laAppPinto } from './fixtures';

const COMPANY_ID = '55555555-5555-4555-8555-555555555555';
const ORDER_ID = '66666666-6666-4666-8666-666666666666';

const report = {
  ordenId: ORDER_ID,
  costoPresupuestado: 1_500_000,
  costoReal: 1_565_000,
  precioContractual: 2_250_000,
  margenEsperado: 750_000,
  margenReal: 685_000,
  desvioTotal: 65_000,
  sentido: 'DESFAVORABLE',
  elementos: [
    { elemento: 'MP', presupuestado: 260_000, real: 273_500, desvio: 13_500, sentido: 'DESFAVORABLE', comprometido: 0, proyeccionAlTerminar: 273_500 },
    { elemento: 'MOD', presupuestado: 640_000, real: 675_000, desvio: 35_000, sentido: 'DESFAVORABLE', comprometido: 0, proyeccionAlTerminar: 675_000 },
    { elemento: 'CIF', presupuestado: 300_000, real: 326_500, desvio: 26_500, sentido: 'DESFAVORABLE', comprometido: 0, proyeccionAlTerminar: 326_500 },
    { elemento: 'ENTREGA', presupuestado: 300_000, real: 290_000, desvio: -10_000, sentido: 'FAVORABLE', comprometido: 0, proyeccionAlTerminar: 290_000 },
  ],
  puente: [
    { causa: 'PRECIO', elemento: 'MP', importe: 13_500, sentido: 'DESFAVORABLE' },
    { causa: 'EFICIENCIA', elemento: 'MOD', importe: 35_000, sentido: 'DESFAVORABLE' },
    { causa: 'ASIGNACION', elemento: 'CIF', importe: 26_500, sentido: 'DESFAVORABLE' },
    { causa: 'ALCANCE', elemento: 'ENTREGA', importe: -10_000, sentido: 'FAVORABLE' },
  ],
  proyeccionAlTerminar: { incurrido: 1_565_000, comprometido: 0, total: 1_565_000, presupuesto: 1_500_000 },
};

const baseOrder = {
  id: ORDER_ID,
  codigo: 'OB-101',
  descripcion: 'Módulo de prueba',
  cliente: 'Cliente ficticio',
};

test('muestra margen y puente, lista pendientes, cierra y reabre la obra conservando las fotos', async ({ page, consola }) => {
  let state = 'PENDIENTE_CIERRE';
  let closeAttempts = 0;
  const photos: Array<Record<string, unknown>> = [];

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const fulfill = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    if (request.method() === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/paquete-rubro`) return fulfill({ data: { category: 'construccion-modular', lexicon: { OrdenTrabajo: 'Obra', EtapaOrden: 'Etapa', PlantillaOrden: 'Modelo', VersionPresupuesto: 'Adicional', Deposito: 'Depósito' } } });
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${ORDER_ID}`) return fulfill({ data: { ...baseOrder, estado: state, etiquetaEstado: state === 'CERRADA' ? 'Cerrada' : 'Pendiente de cierre' } });
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${ORDER_ID}/etapas`) return fulfill({ data: [] });
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${ORDER_ID}/informe-desvio`) return fulfill({ data: report });
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${ORDER_ID}/fotos-cierre`) return fulfill({ data: photos });
    if (request.method() === 'POST' && path === `/api/v1/ordenes-trabajo/${ORDER_ID}/cierre`) {
      closeAttempts += 1;
      if (closeAttempts === 1) return fulfill({ error: { code: 'ORDER_CLOSE_PENDING_ITEMS', message: 'No se puede cerrar: hay cargas pendientes de resolver', details: { pendientes: [{ tipo: 'PARTE_HORAS', id: 'parte-1' }] } } }, 422);
      state = 'CERRADA';
      const photo = { id: 'foto-1', ordenId: ORDER_ID, version: 1, congelado: report, versionMotor: '1.0.0', cerradoPor: 'usuario-e2e', motivoReapertura: null, anteriorId: null, createdAt: '2026-09-30T12:00:00.000Z' };
      photos.push(photo);
      return fulfill({ data: photo }, 201);
    }
    if (request.method() === 'POST' && path === `/api/v1/ordenes-trabajo/${ORDER_ID}/reapertura`) {
      const body = request.postDataJSON() as { motivo: string };
      state = 'PENDIENTE_CIERRE';
      photos.push({ id: 'foto-2', ordenId: ORDER_ID, version: 2, congelado: report, versionMotor: '1.0.0', cerradoPor: 'usuario-e2e', motivoReapertura: body.motivo, anteriorId: 'foto-1', createdAt: '2026-09-30T12:05:00.000Z' });
      return fulfill({ data: { ...baseOrder, estado: state, etiquetaEstado: 'Pendiente de cierre' } });
    }
    return route.fallback();
  });

  await page.goto(`/companies/${COMPANY_ID}/ordenes-trabajo/${ORDER_ID}`);
  await laAppPinto(page);
  await page.getByRole('tab', { name: 'Resultado' }).click();

  await expect(page.getByText('685.000')).toBeVisible();
  await expect(page.getByText('65.000').first()).toBeVisible();
  await expect(page.getByText('Moneda no informada').first()).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar Obra' }).click();
  await expect(page.getByRole('alert')).toContainText('Hay horas sin aprobar.');

  await page.getByRole('button', { name: 'Cerrar Obra' }).click();
  await expect(page.getByText('Foto #1')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reabrir Obra' })).toBeVisible();
  await page.getByRole('button', { name: 'Reabrir Obra' }).click();
  await expect(page.getByRole('alert')).toContainText('Explicá por qué necesitás reabrir la obra.');
  await page.getByLabel('Motivo de reapertura').fill('Llegó una factura posterior al cierre');
  await page.getByRole('button', { name: 'Reabrir Obra' }).click();

  await expect(page.getByText('Foto #2')).toBeVisible();
  await expect(page.getByText(/Llegó una factura posterior al cierre/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar Obra' })).toBeVisible();
  expect(consola.mensajes).toEqual([]);
});

test('un usuario de planta ve el 403 del margen y nunca un cero inventado', async ({ page, consola }) => {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const fulfill = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    if (request.method() === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/paquete-rubro`) return fulfill({ data: { category: 'construccion-modular', lexicon: { OrdenTrabajo: 'Obra', EtapaOrden: 'Etapa', PlantillaOrden: 'Modelo', VersionPresupuesto: 'Adicional' } } });
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${ORDER_ID}`) return fulfill({ data: { ...baseOrder, estado: 'PENDIENTE_CIERRE', etiquetaEstado: 'Pendiente de cierre' } });
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${ORDER_ID}/etapas`) return fulfill({ data: [] });
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${ORDER_ID}/informe-desvio`) return fulfill({ error: { code: 'FORBIDDEN', message: 'Forbidden' } }, 403);
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${ORDER_ID}/fotos-cierre`) return fulfill({ data: [] });
    return route.fallback();
  });

  await page.goto(`/companies/${COMPANY_ID}/ordenes-trabajo/${ORDER_ID}`);
  await laAppPinto(page);
  await page.getByRole('tab', { name: 'Resultado' }).click();

  await expect(page.getByRole('alert')).toContainText('No tenés permiso para ver el margen de esta obra.');
  await expect(page.getByText('$ 0')).toHaveCount(0);
  expect(consola.mensajes).toEqual([]);
});
