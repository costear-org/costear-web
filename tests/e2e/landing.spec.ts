import { test, expect, laAppPinto } from './fixtures';

test.setTimeout(60_000);

/**
 * La landing tiene un solo objetivo: que la persona nos escriba. El recorrido
 * que importa es entender la promesa, probar la remarcadora y llegar a un
 * canal de contacto que funcione. Movimiento reducido para que las tarjetas
 * del hero estén quietas en la captura.
 */
test.use({ reducedMotion: 'reduce' });

test('el hero dice la promesa y lleva a WhatsApp', async ({ page, consola }) => {
  await page.goto('/');
  await laAppPinto(page);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Remarcá con números,\s*no a ojo\./);
  const hero = page.locator('main > section').first();
  await expect(hero.getByRole('link', { name: 'Hablemos por WhatsApp' })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/5493816580360\?text=/,
  );
  await expect(hero.getByText('Capturas de Costear con datos de ejemplo.')).toBeVisible();

  expect(consola.mensajes).toEqual([]);
});

test('la remarcadora devuelve el precio que mantiene el margen', async ({ page, consola }) => {
  await page.goto('/');
  await laAppPinto(page);

  await page.getByText('30 %', { exact: true }).click();
  await expect(page.getByTestId('precio-remarcado')).toHaveText(/97\.884/);
  await expect(page.getByText('$ 9.300', { exact: true })).toBeVisible();

  expect(consola.mensajes).toEqual([]);
});

test('las preguntas frecuentes responden cuánto cuesta', async ({ page }) => {
  await page.goto('/');
  await laAppPinto(page);

  await page.getByText('¿Cuánto cuesta?').click();
  await expect(page.getByText(/te pasamos el precio antes de empezar/)).toBeVisible();
});

test('el cierre lleva a WhatsApp y las preguntas ofrecen el email', async ({ page }) => {
  await page.goto('/');
  await laAppPinto(page);

  const cierre = page.locator('section', { has: page.locator('#titulo-cierre') });
  await cierre.scrollIntoViewIfNeeded();
  await expect(cierre.getByRole('link', { name: 'Hablemos por WhatsApp' })).toBeVisible();
  await expect(page.locator('#preguntas').getByRole('link', { name: 'proyectocostear@gmail.com' })).toHaveAttribute(
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

test('la barra marca la sección en la que está la persona y sigue fija al bajar', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith('Mobile'), 'los links de sección solo se muestran en escritorio');

  await page.goto('/');
  await laAppPinto(page);

  await page.locator('#metodo').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelector('#metodo')?.scrollIntoView({ block: 'center' }));

  const barra = page.getByRole('banner');
  await expect(barra.getByRole('link', { name: 'El método' })).toHaveAttribute('aria-current', 'location');
  await expect(barra.getByRole('link', { name: 'Qué hace' })).not.toHaveAttribute('aria-current', 'location');
  expect(await barra.evaluate((el) => el.getBoundingClientRect().top)).toBe(0);
});

test('los links de sección bajan hasta la sección sin cambiar la dirección', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith('Mobile'), 'los links de sección solo se muestran en escritorio');

  await page.goto('/');
  await laAppPinto(page);

  await page.getByRole('banner').getByRole('link', { name: 'Qué hace' }).click();
  await expect(page.locator('#funciones')).toBeInViewport();
  expect(new URL(page.url()).hash).toBe('');
});
