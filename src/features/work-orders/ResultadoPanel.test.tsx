// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResultadoPanel } from './ResultadoPanel';

const hooks = vi.hoisted(() => ({
  report: vi.fn(),
  photos: vi.fn(),
  close: vi.fn(),
  reopen: vi.fn(),
}));

vi.mock('./work-order-hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./work-order-hooks')>()),
  useWorkOrderDeviationReport: hooks.report,
  useWorkOrderClosurePhotos: hooks.photos,
  useCloseWorkOrder: hooks.close,
  useReopenWorkOrder: hooks.reopen,
}));

function forbiddenError() {
  return Object.assign(new AxiosError('Forbidden'), {
    response: { status: 403, data: { error: { message: 'Forbidden' } } },
  });
}

const report = {
  ordenId: 'orden-1',
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
} as const;

describe('resultado y cierre de una obra', () => {
  afterEach(cleanup);

  beforeEach(() => {
    hooks.photos.mockReturnValue({ data: [], isLoading: false, isError: false });
    hooks.close.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, isError: false });
    hooks.reopen.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, isError: false });
  });

  it('explica el 403 de planta sin convertir el margen ausente en cero', () => {
    hooks.report.mockReturnValue({
      data: undefined,
      error: forbiddenError(),
      isLoading: false,
      isError: true,
    });

    render(
      <ResultadoPanel
        orderId="orden-1"
        companyId="empresa-1"
        orderName="Obra"
        orderState="PENDIENTE_CIERRE"
      />,
    );

    expect(screen.getByRole('alert').textContent).toContain('No tenés permiso para ver el margen');
    expect(screen.queryByText('$ 0')).toBeNull();
  });

  it('muestra el margen real y el puente informado sin inventar moneda', () => {
    hooks.report.mockReturnValue({ data: report, error: undefined, isLoading: false, isError: false });

    render(<ResultadoPanel orderId="orden-1" companyId="empresa-1" orderName="Obra" orderState="PENDIENTE_CIERRE" />);

    expect(screen.getByText('685.000')).toBeTruthy();
    expect(screen.getAllByText('65.000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('-10.000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Moneda no informada').length).toBeGreaterThan(0);
  });

  it('declara el margen ausente cuando el backend responde 200 sin esos campos', () => {
    const { precioContractual: _price, margenEsperado: _expected, margenReal: _real, ...withoutMargins } = report;
    hooks.report.mockReturnValue({ data: withoutMargins, error: undefined, isLoading: false, isError: false });

    render(<ResultadoPanel orderId="orden-1" companyId="empresa-1" orderName="Obra" orderState="PENDIENTE_CIERRE" />);

    const permissionCard = screen.getByText('No tenés permiso para ver el margen').closest('article');
    expect(permissionCard).toBeTruthy();
    expect(permissionCard?.textContent).not.toContain('0');
  });

  it('lista los pendientes del backend sin exponer identificadores', async () => {
    const pendingError = Object.assign(new AxiosError('Pendientes'), {
      response: {
        status: 422,
        data: {
          error: {
            message: 'No se puede cerrar',
            details: { pendientes: [{ tipo: 'PARTE_HORAS', id: 'parte-secreta' }, { tipo: 'CAMBIO_PRESUPUESTO', id: 'cambio-secreto' }] },
          },
        },
      },
    });
    const mutateAsync = vi.fn().mockRejectedValue(pendingError);
    hooks.report.mockReturnValue({ data: report, error: undefined, isLoading: false, isError: false });
    hooks.close.mockReturnValue({ mutateAsync, isPending: false, isError: false });

    render(<ResultadoPanel orderId="orden-1" companyId="empresa-1" orderName="Obra" orderState="PENDIENTE_CIERRE" />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Obra' }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Hay horas sin aprobar.'));
    expect(screen.getByRole('alert').textContent).toContain('Hay cambios de presupuesto sin resolver.');
    expect(screen.getByRole('alert').textContent).not.toContain('parte-secreta');
  });
});
