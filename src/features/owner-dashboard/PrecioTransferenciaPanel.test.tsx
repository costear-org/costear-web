// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PrecioTransferenciaPanel } from './PrecioTransferenciaPanel';
import type { PrecioTransferenciaData } from './owner-dashboard-hooks';

afterEach(cleanup);

const AM_11: PrecioTransferenciaData = {
  equilibrioACostoVariable: 493.42105263157896,
  equilibrioAMercado: 510.2040816326531,
  diferencia: 16.783029,
  criterioDecisionMarginal: 'COSTO_VARIABLE',
  avisoDecisionMarginal: 'Las decisiones marginales usan costo variable (R9).',
  usoDeCadaCriterio: {
    COSTO_VARIABLE: 'Decisiones marginales (R9).',
    MERCADO: 'Estado de resultados por sector (R24).',
  },
  unidades: {
    equilibrioACostoVariable: 'unidades',
    equilibrioAMercado: 'unidades',
    diferencia: 'unidades',
  },
};

describe('precio de transferencia — AM-11', () => {
  it('muestra los dos equilibrios, la diferencia y para qué se usa cada criterio', () => {
    render(<PrecioTransferenciaPanel data={AM_11} />);

    const panel = screen.getByTestId('precio-transferencia-panel');
    const costoVariable = within(panel).getByTestId('transferencia-costo-variable');
    const mercado = within(panel).getByTestId('transferencia-mercado');

    expect(within(costoVariable).getByText('493,42 unidades')).toBeTruthy();
    expect(within(costoVariable).getByText('Decisiones marginales (R9).')).toBeTruthy();
    expect(within(mercado).getByText('510,20 unidades')).toBeTruthy();
    expect(within(mercado).getByText('Estado de resultados por sector (R24).')).toBeTruthy();
    expect(within(panel).getByText('16,78 unidades')).toBeTruthy();
  });

  it.each([
    ['costo variable', { ...AM_11, usoDeCadaCriterio: { ...AM_11.usoDeCadaCriterio, COSTO_VARIABLE: '' } }],
    ['mercado', { ...AM_11, usoDeCadaCriterio: { ...AM_11.usoDeCadaCriterio, MERCADO: '' } }],
  ])('declara datos incompletos si falta el rótulo de uso de %s', (_criterio, data) => {
    render(<PrecioTransferenciaPanel data={data} />);

    expect(screen.getByRole('alert').textContent).toMatch(/no informa para qué se usa cada criterio/i);
    expect(screen.queryByText('493,42 unidades')).toBeNull();
    expect(screen.queryByText('510,20 unidades')).toBeNull();
  });
});
