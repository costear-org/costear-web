// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PuntoIndiferenciaPanel } from './PuntoIndiferenciaPanel';
import type { PuntoIndiferenciaInput } from './owner-dashboard-hooks';

afterEach(cleanup);

function completarAm04() {
  fireEvent.change(screen.getByLabelText('Costos fijos de Equipo A'), { target: { value: '300000' } });
  fireEvent.change(screen.getByLabelText('Costo variable por unidad de Equipo A'), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText('Costos fijos de Equipo B'), { target: { value: '100000' } });
  fireEvent.change(screen.getByLabelText('Costo variable por unidad de Equipo B'), { target: { value: '150' } });
}

describe('punto de indiferencia', () => {
  it('muestra AM-04 y qué equipo conviene por debajo y por encima', async () => {
    const onCalculate = vi.fn(async (_input: PuntoIndiferenciaInput) => ({
      cantidadIndiferencia: 4_000,
      costoEnElPunto: 700_000,
      convieneA: { desde: 4_000, hasta: null },
      convieneB: { desde: 0, hasta: 4_000 },
      motivoSinPunto: null,
      criterio: 'costos_totales' as const,
      unidades: { cantidad: 'unidades', costo: 'ARS' },
    }));
    render(<PuntoIndiferenciaPanel companyId="company-1" unit="unidades" onCalculate={onCalculate} />);

    fireEvent.click(screen.getByLabelText('Un equipo u otro'));
    completarAm04();
    fireEvent.click(screen.getByRole('button', { name: 'Comparar costos' }));

    await waitFor(() => expect(onCalculate).toHaveBeenCalledTimes(1));
    expect(onCalculate).toHaveBeenCalledWith({
      tipoDecision: 'comparar_estructuras',
      estructuraA: { nombre: 'Equipo A', costosFijos: 300_000, costoVariableUnitario: 100 },
      estructuraB: { nombre: 'Equipo B', costosFijos: 100_000, costoVariableUnitario: 150 },
      unidadCantidad: 'unidades',
      moneda: 'ARS',
    });

    const result = await screen.findByTestId('punto-indiferencia-resultado');
    expect(within(result).getByText('4.000 unidades')).toBeTruthy();
    expect(within(result).getByText('$ 700.000,00')).toBeTruthy();
    expect(result.textContent).toContain('Por debajo: conviene Equipo B');
    expect(result.textContent).toContain('Por encima: conviene Equipo A');
  });

  it('muestra el motivo del backend cuando no existe un punto y nunca infinito', async () => {
    const motivo = 'Las estructuras tienen el mismo costo variable; Comprar conviene en todo volumen.';
    const onCalculate = vi.fn(async () => ({
      cantidadIndiferencia: null,
      costoEnElPunto: null,
      convieneA: null,
      convieneB: { desde: 0, hasta: null },
      motivoSinPunto: motivo,
      criterio: 'costos_totales' as const,
      unidades: { cantidad: 'unidades', costo: 'ARS' },
    }));
    render(<PuntoIndiferenciaPanel companyId="company-1" unit="unidades" onCalculate={onCalculate} />);

    fireEvent.change(screen.getByLabelText('Costos fijos de Fabricar'), { target: { value: '300000' } });
    fireEvent.change(screen.getByLabelText('Costo variable por unidad de Fabricar'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Costos fijos de Comprar'), { target: { value: '100000' } });
    fireEvent.change(screen.getByLabelText('Costo variable por unidad de Comprar'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Comparar costos' }));

    const result = await screen.findByTestId('punto-indiferencia-resultado');
    expect(within(result).getByText(motivo)).toBeTruthy();
    expect(result.textContent).not.toMatch(/Infinity|∞|—/);
  });
});
