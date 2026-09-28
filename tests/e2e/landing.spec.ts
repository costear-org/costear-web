import { test, expect, laAppPinto } from './fixtures';

test.setTimeout(60_000);

/**
 * La landing tiene un solo objetivo: que la persona nos escriba. El recorrido
 * que importa es entender la promesa, probar la remarcadora y llegar a un
 * canal de contacto que funcione. Movimiento reducido para que el sticker del
 * hero no se esté animando cuando se toma la captura.
 */
test.use({ reducedMotion: 'reduce' });

test('el hero dice una sola cosa y ofrece una sola acción', async ({ page, consola }) => {
  await page.goto('/');
  await laAppPinto(page);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Remarcá con números, no a ojo.');
  const hero = page.locator('main > section').first();
  await expect(hero.getByRole('link')).toHaveCount(1);
  await expect(hero.getByRole('link', { name: 'Hablemos por WhatsApp' })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/5493816580360\?text=/,
  );

  expect(consola.mensajes).toEqual([]);
});

test('la remarcadora devuelve el precio que mantiene el margen', async ({ page, consola }) => {
  await page.goto('/');
  await laAppPinto(page);

  await page.getByText('30 %', { exact: true }).click();
  await page.getByRole('button', { name: 'Remarcar' }).click();

  await expect(page.getByTestId('precio-remarcado')).toHaveText(/97\.884/);
  await expect(page.getByText(/Tu costo subió \$\s?9\.300 por unidad/)).toBeVisible();

  expect(consola.mensajes).toEqual([]);
});

test('las preguntas frecuentes responden cuánto cuesta', async ({ page }) => {
  await page.goto('/');
  await laAppPinto(page);

  await page.getByText('¿Cuánto cuesta?').click();
  await expect(page.getByText(/te pasamos el precio antes de empezar/)).toBeVisible();
});

test('el cierre ofrece WhatsApp y email', async ({ page }) => {
  await page.goto('/');
  await laAppPinto(page);

  const cierre = page.locator('section', { has: page.locator('#titulo-cierre') });
  await cierre.scrollIntoViewIfNeeded();
  await expect(cierre.getByRole('link', { name: 'Hablemos por WhatsApp' })).toBeVisible();
  await expect(cierre.getByRole('link', { name: /proyectocostear@gmail\.com/ })).toHaveAttribute(
    'href',
    /^mailto:proyectocostear@gmail\.com/,
  );
});

test('la landing no muestra precios de planes, cuenta regresiva ni métricas inventadas', async ({ page }) => {
  await page.goto('/');
  await laAppPinto(page);

  for (const texto of [/Más Popular/i, /\/ mes/, /Cuenta regresiva/i, /Tiempo ahorrado/i, /Comité de Auditoría/i]) {
    await expect(page.getByText(texto)).toHaveCount(0);
  }
});

test('Ingresar abre el acceso del equipo', async ({ page }) => {
  await page.goto('/');
  await laAppPinto(page);

  await page.getByRole('banner').getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('button', { name: 'Cerrar', exact: true })).toBeVisible();
});
