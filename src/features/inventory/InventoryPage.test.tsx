import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryWorkspace } from './InventoryPage';

const registerMovement = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
  useSearch: () => ({}),
}));

vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('@/lib/api', () => ({
  apiErrorMessage: (error: unknown) => error instanceof Error ? error.message : 'Error inesperado',
}));

vi.mock('./inventory-hooks', () => ({
  useArticles: () => ({
    data: [{
      id: 'article-1',
      codigo: 'CHA-01',
      descripcion: 'Chapa de prueba',
      unidadId: 'unit-1',
      unidad: { id: 'unit-1', nombre: 'unidad', simbolo: 'u.' },
      almacenable: true,
      saldoCantidad: 75,
      saldoValor: 88_500,
      ppp: 1_180,
    }],
    isLoading: false,
    isError: false,
    error: null,
  }),
  useRegisterInventoryMovement: () => ({
    mutateAsync: registerMovement,
    isPending: false,
  }),
}));

vi.mock('@/features/work-orders/work-order-hooks', () => ({
  usePackageLexicon: () => ({
    data: { category: 'CONSTRUCCION_MODULAR', lexicon: { OrdenTrabajo: 'Obra', Deposito: 'Depósito' } },
    isLoading: false,
  }),
  useWorkOrders: () => ({
    data: [{ id: 'order-1', codigo: 'OB-01', descripcion: 'Módulo de prueba', cliente: 'Cliente ficticio', estado: 'EN_PRODUCCION', etiquetaEstado: 'En producción' }],
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

describe('depósito e inventario', () => {
  beforeEach(() => registerMovement.mockReset());

  it('impide una salida sin obra y conserva el rechazo del backend con el saldo disponible', async () => {
    registerMovement.mockRejectedValueOnce(new Error('La salida de 80 supera el saldo disponible de 75'));
    render(<InventoryWorkspace companyId="company-1" />);

    expect(screen.getByRole('heading', { name: 'Depósito' })).toBeTruthy();
    expect(screen.getByText('75 u.')).toBeTruthy();
    expect(screen.getByText('PPP 1.180')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Registrar salida' }));
    fireEvent.change(screen.getByLabelText('Artículo'), { target: { value: 'article-1' } });
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-09-29' } });
    fireEvent.change(screen.getByLabelText('Mes al que corresponde'), { target: { value: '2026-09' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Registrar salida' }));

    expect(registerMovement).not.toHaveBeenCalled();
    expect((await screen.findByRole('alert')).textContent).toContain('Elegí una Obra para registrar la salida.');

    fireEvent.change(screen.getByLabelText('Obra'), { target: { value: 'order-1' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Registrar salida' }));

    await waitFor(() => expect(registerMovement).toHaveBeenCalledWith(expect.objectContaining({
      articuloId: 'article-1',
      tipo: 'SALIDA',
      cantidad: 80,
      ordenId: 'order-1',
      periodoImputado: '2026-09-01',
    })));
    expect((await screen.findByRole('alert')).textContent).toContain('La salida de 80 supera el saldo disponible de 75');
  });
});
// @vitest-environment jsdom
