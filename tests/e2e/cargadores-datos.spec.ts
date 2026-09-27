import { test, expect, laAppPinto } from './fixtures';

const operatorProfile = {
  id: 'operator-e2e',
  email: 'cargador@ejemplo.com',
  name: 'Persona Cargadora',
  role: 'EMPRESA_OPERATOR',
  mustChangePassword: false,
  needsTermsAcceptance: false,
};

test('el cargador que entra al tablero ve solo el chat y sus opciones autorizadas', async ({ page, consola }) => {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() === 'POST' && path === '/api/v1/auth/refresh') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { accessToken: 'token-e2e' } }) });
    }
    const bodies: Record<string, unknown> = {
      '/api/v1/user/profile': { data: operatorProfile },
      '/api/v1/empresa-portal/my-companies': { data: [{ id: 'm1', connectionId: 'connection-1', connection: { id: 'connection-1', company: { id: 'company-1', name: 'Negocio de prueba', industry: null }, costist: { id: 'admin-1', name: 'Administración' } } }] },
      '/api/v1/empresa-portal/connections/connection-1/operational-catalog': { data: { estado: 'disponible', mensaje: null, acciones: [{ clave: 'produccion-diaria', nombre: 'Producción diaria', descripcion: 'Carga diaria', superficie: 'chat', destino: 'produccion', entidad: { tipo: 'UnidadProductiva', id: 'unit-1', referencia: 'Sector A', etiqueta: 'Galpón' } }] } },
      '/api/v1/empresa-portal/my-submissions': { data: [] },
      '/api/v1/empresa-portal/connections/connection-1/structures': { data: [] },
    };
    const key = path === '/api/v1/empresa-portal/my-submissions' ? path : path;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(bodies[key] ?? { data: [] }) });
  });

  await page.goto('/tablero');
  await laAppPinto(page);
  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByText('Chat de carga')).toBeVisible();
  await expect(page.getByRole('button', { name: /Producción diaria/ })).toBeVisible();
  await expect(page.getByText('Galpón · Sector A')).toBeVisible();
  await expect(page.locator('aside')).toHaveCount(0);
  await expect(page.getByText('Métricas')).toHaveCount(0);
  expect(consola.mensajes).toEqual([]);
});

test('sin entidades autorizadas el chat niega por defecto con un mensaje explícito', async ({ page, consola }) => {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() === 'POST' && path === '/api/v1/auth/refresh') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { accessToken: 'token-e2e' } }) });
    }
    const data = path === '/api/v1/user/profile'
      ? operatorProfile
      : path === '/api/v1/empresa-portal/my-companies'
        ? [{ id: 'm1', connectionId: 'connection-1', connection: { id: 'connection-1', company: { id: 'company-1', name: 'Negocio de prueba', industry: null } } }]
        : path.endsWith('/operational-catalog')
          ? { estado: 'sin_entidades_autorizadas', mensaje: 'Todavía no te asignaron un galpón.', acciones: [] }
          : [];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data }) });
  });

  await page.goto('/portal');
  await laAppPinto(page);
  await expect(page.getByText('Todavía no te asignaron un galpón.')).toBeVisible();
  await expect(page.getByPlaceholder('Escribí un mensaje')).toHaveCount(0);
  expect(consola.mensajes).toEqual([]);
});

test('administración gestiona cargadores y sectores desde el sidebar', async ({ page, consola }) => {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() === 'POST' && path === '/api/v1/auth/refresh') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { accessToken: 'token-e2e' } }) });
    }
    const responses: Record<string, unknown> = {
      '/api/v1/user/profile': { id: 'admin-e2e', email: 'admin@ejemplo.com', name: 'Administración', role: 'EMPRESA_ADMIN', mustChangePassword: false, needsTermsAcceptance: false },
      '/api/v1/companies': [{ id: 'company-1', name: 'Negocio de prueba' }],
      '/api/v1/validaciones/pending/count': { count: 0 },
      '/api/v1/empresa-portal/company-1/operators': [{ id: 'operator-1', name: 'Persona Cargadora', email: 'cargador@ejemplo.com', isActive: true, createdAt: '2026-09-27T00:00:00Z', alcance: { unidadesProductivas: [], depositos: [], ordenesTrabajo: [] }, permisos: [] }],
      '/api/v1/empresa-portal/company-1/assignable-entities': { unidadesProductivas: [{ id: 'unit-1', referencia: 'Sector A', etiqueta: 'Galpón' }], depositos: [{ id: 'deposit-1', referencia: 'Depósito central', etiqueta: 'Silo' }] },
      '/api/v1/conexiones': [],
    };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: responses[path] ?? [] }) });
  });

  await page.goto('/cargadores');
  await laAppPinto(page);
  await expect(page.getByRole('heading', { name: 'Cargadores de datos', level: 1 })).toBeVisible();
  await expect(page.getByText('Persona Cargadora')).toBeVisible();
  await expect(page.getByText('Galpón · Sector A')).toBeVisible();
  await expect(page.getByText('Silo · Depósito central')).toBeVisible();
  await expect(page.getByRole('link', { name: /Cargadores de datos/ }).first()).toBeVisible();
  expect(consola.mensajes).toEqual([]);
});
