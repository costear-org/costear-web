#!/usr/bin/env node
/**
 * Regenera las capturas reales de la app que usa la landing
 * (src/assets/landing). Corre el frontend de verdad con la API simulada y
 * datos ficticios de un negocio de ejemplo: ningún dato de cliente.
 *
 * Uso: con `npm run dev` levantado en :5173,
 *   node scripts/capturas-landing.mjs
 */
import { chromium } from 'playwright';

const out = process.argv[2] ?? 'src/assets/landing';
const base = 'http://localhost:5173';

const hoy = '2026-03-15T12:00:00.000Z';
const EMPRESA = {
  id: 'emp-1', name: 'Metalúrgica del Norte', industry: 'Metalúrgica', cuit: null, isActive: true,
  createdAt: hoy, periodicity: 'MONTHLY', _count: { costStructures: 1 }, condicionIva: 'RESPONSABLE_INSCRIPTO',
};
const FIJAS = {
  '/api/v1/user/profile': { data: { id: 'u1', email: 'demo@ejemplo.com', name: 'Marcela', role: 'COST_PROFESSIONAL', mustChangePassword: false, needsTermsAcceptance: false } },
  '/api/v1/companies': { data: [EMPRESA] },
  '/api/v1/macro/latest': { data: [
    { id: 'm1', source: 'BCRA', indicatorCode: 'USD_OFICIAL', value: '1250.50', effectiveDate: hoy },
    { id: 'm2', source: 'INDEC', indicatorCode: 'IPC', value: '2.4', effectiveDate: hoy },
  ] },
  '/api/v1/alerts': { data: [
    { id: 'a1', type: 'MARGIN_BELOW_THRESHOLD', message: 'Estantería metálica: el margen bajó a 12,7 %', threshold: '15', actualValue: '12.7', isRead: false, createdAt: hoy, severidad: 'ADVERTENCIA', indicador: null, indicadorEtiqueta: null, unidadValor: '%', unidadUmbral: '%', motivoNoEvaluada: null },
  ] },
  '/api/v1/validaciones/pending/count': { data: { count: 0 } },
  '/api/v1/companies/emp-1/cost-structures': { data: [{ id: 'est-1', companyId: 'emp-1', productName: 'Estantería metálica 5 estantes', period: '2026-03', status: 'ACTIVE', costingSystem: 'ORDERS' }] },
  '/api/v1/structures/est-1/periods/open': { data: { id: 'per-1', structureId: 'est-1', companyId: 'emp-1', code: '2026-03', label: 'Marzo', status: 'OPEN' } },
  '/api/v1/periods/per-1/tablero-dueno': { data: { periodo: { id: 'per-1', codigo: '2026-03' }, corrida: null, unidadGestion: { codigo: 'unidad', nombre: 'Unidad', factor: 1 }, rubro: { clave: 'METALURGICA', nombreProducto: 'Producto', icons: {}, kpisHome: [
    { clave: 'costo', etiqueta: 'Costo por unidad', unidad: 'ARS/unidad', valor: 75050, completo: true },
    { clave: 'contribucion', etiqueta: 'Contribución marginal', unidad: 'ARS/unidad', valor: 22400, completo: true },
    { clave: 'equilibrio', etiqueta: 'Punto de equilibrio', unidad: 'unidades', valor: 58, completo: true },
  ] }, pendientes: [] } },
  '/api/v1/companies/emp-1/indicadores-macro': { data: [
    { clave: 'USD_OFICIAL', etiqueta: 'Dólar oficial', valor: 1250, unidad: 'ARS/USD', fecha: '2026-03-14T00:00:00.000Z', fuenteNombre: 'Banco Central', fuenteUrl: 'https://fuente.example/dolar' },
    { clave: 'IPC_NACIONAL', etiqueta: 'Inflación mensual', valor: 2.4, unidad: '%', fecha: '2026-03-14T00:00:00.000Z', fuenteNombre: 'INDEC', fuenteUrl: 'https://fuente.example/ipc' },
  ] },
  '/api/v1/me/preferencias': { data: { home: { accesosRapidos: [] } } },
  '/api/v1/me/preferencias/catalogo': { data: [] },
};

const sinFixture = new Set();
const browser = await chromium.launch();
async function rutear(page) { await page.route('**/api/v1/**', (route) => {
  const req = route.request();
  const p = new URL(req.url()).pathname;
  if (req.method() === 'POST' && p === '/api/v1/auth/refresh') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { accessToken: 't' } }) });
  }
  if (p in FIJAS) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIJAS[p]) });
  sinFixture.add(`${req.method()} ${p}`);
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
}); }
const tomas = [
  { ruta: '/dashboard', nombre: 'tablero-escritorio', viewport: { width: 1280, height: 720 } },
  { ruta: '/dashboard', nombre: 'tablero-celular', viewport: { width: 390, height: 844 }, isMobile: true },
];
for (const t of tomas) {
  const page = await browser.newPage({ viewport: t.viewport, deviceScaleFactor: 2, isMobile: !!t.isMobile, hasTouch: !!t.isMobile });
  await rutear(page);
  await page.goto(base + t.ruta);
  await page.waitForTimeout(4000);
  // El pie de la app afirma un aval académico que no existe formalmente: no va en la landing.
  await page.addStyleTag({ content: 'main ~ footer, footer { display: none !important; }' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: out + '/' + t.nombre + '.jpg', type: 'jpeg', quality: 82, clip: t.clip });
  await page.close();
}
console.log([...sinFixture].join('\n'));
await browser.close();
