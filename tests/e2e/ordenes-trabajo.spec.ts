import { testConSesion as test, expect, laAppPinto } from './fixtures';

const COMPANY_ID = '55555555-5555-4555-8555-555555555555';

test('un código repetido explica que ya existe una obra con ese código', async ({ page, consola }) => {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/ordenes-trabajo`) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    }
    if (request.method() === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/plantillas-orden`) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    }
    if (request.method() === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/paquete-rubro`) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { category: 'construccion-modular', lexicon: { OrdenTrabajo: 'Obra', EtapaOrden: 'Etapa', PlantillaOrden: 'Modelo', VersionPresupuesto: 'Adicional' } } }) });
    }
    if (request.method() === 'POST' && path === `/api/v1/companies/${COMPANY_ID}/ordenes-trabajo`) {
      return route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: { code: 'CONFLICT', message: 'El código ya existe' } }) });
    }
    return route.fallback();
  });

  await page.goto(`/companies/${COMPANY_ID}/ordenes-trabajo`);
  await laAppPinto(page);
  await page.getByRole('button', { name: 'Nueva Obra' }).click();
  await page.getByLabel('Código').fill('OB-001');
  await page.getByLabel('Descripción').fill('Módulo habitacional de prueba');
  await page.getByLabel('Cliente').fill('Cliente ficticio');
  await page.getByRole('button', { name: 'Crear Obra' }).click();

  await expect(page.getByRole('alert')).toHaveText('Ya existe una obra con ese código.');
  expect(consola.mensajes).toEqual([]);
});

test('da de alta una obra desde un modelo, muestra siete etapas y avanza su estado', async ({ page, consola }) => {
  const orderId = '66666666-6666-4666-8666-666666666666';
  const templateId = '77777777-7777-4777-8777-777777777777';
  let state = 'BORRADOR';
  const labels: Record<string, string> = { BORRADOR: 'Borrador', COTIZADA: 'Cotizada' };
  const stages = ['Diseño', 'Corte', 'Estructura', 'Instalaciones', 'Terminaciones', 'Control final', 'Entrega'].map((nombre, index) => ({
    id: `88888888-8888-4888-8888-88888888888${index}`,
    clave: `etapa-${index + 1}`,
    nombre,
    orden: index + 1,
    esEntrega: nombre === 'Entrega',
  }));
  const order = () => ({ id: orderId, codigo: 'OB-040', descripcion: 'Módulo de 40 pies', cliente: 'Cliente ficticio', estado: state, etiquetaEstado: labels[state] });

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (method === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/ordenes-trabajo`) return json({ data: [] });
    if (method === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/plantillas-orden`) return json({ data: [{ id: templateId, nombre: 'Modelo 40 pies', etapas: stages }] });
    if (method === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/paquete-rubro`) return json({ data: { category: 'construccion-modular', lexicon: { OrdenTrabajo: 'Obra', EtapaOrden: 'Etapa', PlantillaOrden: 'Modelo', VersionPresupuesto: 'Adicional' } } });
    if (method === 'POST' && path === `/api/v1/companies/${COMPANY_ID}/ordenes-trabajo`) {
      expect(request.postDataJSON()).toMatchObject({ codigo: 'OB-040', plantillaId: templateId });
      return json({ data: order() }, 201);
    }
    if (method === 'GET' && path === `/api/v1/ordenes-trabajo/${orderId}`) return json({ data: order() });
    if (method === 'GET' && path === `/api/v1/ordenes-trabajo/${orderId}/etapas`) return json({ data: stages });
    if (method === 'POST' && path === `/api/v1/ordenes-trabajo/${orderId}/transiciones`) {
      state = 'COTIZADA';
      return json({ data: order() });
    }
    return route.fallback();
  });

  await page.goto(`/companies/${COMPANY_ID}/ordenes-trabajo`);
  await laAppPinto(page);
  await page.getByRole('button', { name: 'Nueva Obra' }).click();
  await page.getByLabel('Código').fill('OB-040');
  await page.getByLabel('Descripción').fill('Módulo de 40 pies');
  await page.getByLabel('Cliente').fill('Cliente ficticio');
  await page.getByLabel('Modelo opcional').selectOption(templateId);
  await page.getByRole('button', { name: 'Crear Obra' }).click();

  await expect(page.getByRole('heading', { name: 'Módulo de 40 pies' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(7);
  await expect(page.getByRole('listitem').filter({ hasText: 'Control final' })).not.toContainText('Entrega');
  await expect(page.getByRole('listitem').filter({ hasText: 'Entrega' })).toContainText('Entrega');
  await page.getByRole('button', { name: 'Pasar a Cotizada' }).click();
  await expect(page.getByText('Cotizada', { exact: true })).toBeVisible();
  expect(consola.mensajes).toEqual([]);
});

test('una versión vencida exige revalidar y quien preparó no ve aprobar', async ({ page, consola }) => {
  const orderId = '66666666-6666-4666-8666-666666666666';
  const expiredBudgetId = '99999999-9999-4999-8999-999999999991';
  const ownBudgetId = '99999999-9999-4999-8999-999999999992';
  const draftBudgetId = '99999999-9999-4999-8999-999999999993';
  const order = { id: orderId, codigo: 'OB-040', descripcion: 'Módulo de 40 pies', cliente: 'Cliente ficticio', estado: 'COTIZADA', etiquetaEstado: 'Cotizada' };
  let revalidated = false;

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (request.method() === 'GET' && path === `/api/v1/companies/${COMPANY_ID}/paquete-rubro`) return json({ data: { category: 'construccion-modular', lexicon: { OrdenTrabajo: 'Obra', EtapaOrden: 'Etapa', PlantillaOrden: 'Modelo', VersionPresupuesto: 'Adicional' } } });
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${orderId}`) return json({ data: order });
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${orderId}/etapas`) return json({ data: [] });
    if (request.method() === 'GET' && path === `/api/v1/ordenes-trabajo/${orderId}/presupuestos`) return json({ data: {
      precioContractual: 2_250_000,
      costoPrevistoTotal: 1_500_000,
      presupuestos: [
        { id: expiredBudgetId, ordenId: orderId, tipo: 'BASE', numero: 1, estado: 'PREPARADO', vigenteDesde: '2026-01-01T00:00:00.000Z', vigenciaDias: 7, costoPrevisto: 1_400_000, precio: 2_100_000, plazoDias: 30, preparadoPor: 'otra-persona', renglones: [] },
        { id: ownBudgetId, ordenId: orderId, tipo: 'ADICIONAL', numero: 2, estado: 'PREPARADO', vigenteDesde: '2026-09-27T00:00:00.000Z', vigenciaDias: 7, costoPrevisto: 100_000, precio: 150_000, plazoDias: 2, preparadoPor: 'usuario-e2e', causaAdicional: 'Cambio solicitado', renglones: [] },
        { id: draftBudgetId, ordenId: orderId, tipo: 'REVISION', numero: 3, estado: 'BORRADOR', vigenteDesde: '2026-09-27T00:00:00.000Z', vigenciaDias: 7, costoPrevisto: 1_550_000, precio: 2_300_000, plazoDias: 30, preparadoPor: null, renglones: [] },
      ],
    } });
    if (request.method() === 'POST' && path === `/api/v1/presupuestos/${expiredBudgetId}/revalidar`) {
      revalidated = true;
      return json({ data: { id: expiredBudgetId, estado: 'BORRADOR' } });
    }
    return route.fallback();
  });

  await page.goto(`/companies/${COMPANY_ID}/ordenes-trabajo/${orderId}`);
  await laAppPinto(page);
  await page.getByRole('tab', { name: 'Presupuesto' }).click();

  await expect(page.getByText('$ 2.250.000')).toBeVisible();
  const expiredCard = page.getByTestId(`presupuesto-${expiredBudgetId}`);
  await expect(expiredCard.getByRole('button', { name: 'Aprobar' })).toBeDisabled();
  await expect(expiredCard.getByText('Vencida: revalidá primero.')).toBeVisible();
  await expiredCard.getByRole('button', { name: 'Revalidar' }).click();
  await expect.poll(() => revalidated).toBe(true);
  const ownCard = page.getByTestId(`presupuesto-${ownBudgetId}`);
  await expect(ownCard.getByRole('button', { name: 'Aprobar' })).toHaveCount(0);
  await expect(ownCard.getByText('La persona que preparó esta versión no puede aprobarla.')).toBeVisible();
  await expect(page.getByTestId(`presupuesto-${draftBudgetId}`).getByRole('button', { name: 'Preparar' })).toBeVisible();
  expect(consola.mensajes).toEqual([]);
});
