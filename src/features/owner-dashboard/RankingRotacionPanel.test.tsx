// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RankingRotacionPanel } from './RankingRotacionPanel';
import type { RankingRotacionData } from './owner-dashboard-hooks';

afterEach(cleanup);

const AM_13: RankingRotacionData = {
  ranking: [
    { producto: 'Producto A', margen: 0.2, rotacion: 12, rendimiento: 2.4, rotacionOrigen: 'DEFAULT' },
    { producto: 'Producto B', margen: 0.6, rotacion: 2, rendimiento: 1.2, rotacionOrigen: 'DECLARADA' },
  ],
  criterio: 'rendimiento',
  advertencia: null,
  excluidos: [{ producto: 'Producto C', motivo: 'ROTACION_SIN_DECLARAR' }],
};

describe('ranking de comercio por rotacion y margen', () => {
  it('muestra AM-13 por rendimiento con margen, rotacion y origen a la vista', () => {
    render(<RankingRotacionPanel data={AM_13} criterio="rendimiento" onCriterioChange={() => undefined} />);

    const filas = screen.getAllByRole('row');
    expect(within(filas[1]!).getByText('Producto A')).toBeTruthy();
    expect(within(filas[1]!).getByText('20%')).toBeTruthy();
    expect(within(filas[1]!).getByText('12')).toBeTruthy();
    expect(within(filas[1]!).getByText('estimada (valor por defecto)')).toBeTruthy();
    expect(within(filas[2]!).getByText('Producto B')).toBeTruthy();
    expect(within(filas[2]!).getByText('60%')).toBeTruthy();
    expect(within(filas[2]!).getAllByText('2')).toHaveLength(2);
    expect(within(filas[2]!).queryByText('estimada (valor por defecto)')).toBeNull();
    expect(screen.getByText(/Producto C/)).toBeTruthy();
    expect(screen.getByText('Falta cargar cuántas veces rota este producto en el período')).toBeTruthy();
  });

  it('hace visible la advertencia cuando el criterio es margen', () => {
    render(<RankingRotacionPanel criterio="margen" onCriterioChange={() => undefined} data={{
      ...AM_13,
      criterio: 'margen',
      advertencia: 'Ordenar sólo por margen ignora cuántas veces rota el stock y puede invertir la prioridad comercial.',
    }} />);

    expect(screen.getByRole('alert').textContent).toMatch(/ignora cuántas veces rota/i);
  });

  it('no acepta una fila default sin el rotulo de origen', () => {
    render(<RankingRotacionPanel data={AM_13} criterio="rendimiento" onCriterioChange={() => undefined} />);

    const filaDefault = screen.getByRole('row', { name: /Producto A/ });
    expect(within(filaDefault).getByText('estimada (valor por defecto)')).toBeTruthy();
  });
});
