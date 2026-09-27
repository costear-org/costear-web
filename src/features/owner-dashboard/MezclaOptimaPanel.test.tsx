// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MezclaOptimaPanel } from './MezclaOptimaPanel';
import type { MezclaOptimaData } from './owner-dashboard-hooks';

afterEach(cleanup);

const AM_06: MezclaOptimaData = {
  recurso: {
    id: '00000000-0000-4000-8000-000000000010',
    clave: 'horas-maquina',
    disponibleEnPeriodo: 1_000,
    unidad: 'hora-maquina',
    nombreUnidad: 'Horas máquina',
  },
  ranking: [
    {
      productoId: '00000000-0000-4000-8000-000000000012',
      producto: 'Producto Y',
      cme: 200,
      cm: 200,
      consumoPorUnidad: 1,
      demandaMaxima: 400,
      cantidadAsignada: 400,
      recursoAsignado: 400,
      unidades: {
        cme: 'moneda/hora-maquina',
        cm: 'moneda/unidad de producto',
        consumoPorUnidad: 'hora-maquina/unidad de producto',
        demandaMaxima: 'unidades de producto',
        cantidadAsignada: 'unidades de producto',
        recursoAsignado: 'hora-maquina',
      },
    },
    {
      productoId: '00000000-0000-4000-8000-000000000011',
      producto: 'Producto X',
      cme: 100,
      cm: 300,
      consumoPorUnidad: 3,
      demandaMaxima: 200,
      cantidadAsignada: 200,
      recursoAsignado: 600,
      unidades: {
        cme: 'moneda/hora-maquina',
        cm: 'moneda/unidad de producto',
        consumoPorUnidad: 'hora-maquina/unidad de producto',
        demandaMaxima: 'unidades de producto',
        cantidadAsignada: 'unidades de producto',
        recursoAsignado: 'hora-maquina',
      },
    },
  ],
  contribucionMarginalTotal: 140_000,
  recursoRestante: 0,
  motivoSinRanking: null,
};

describe('ranking por recurso escaso', () => {
  it('muestra AM-06 ordenado por aporte al recurso y conserva la contribución por unidad', () => {
    render(<MezclaOptimaPanel data={AM_06} />);

    expect(screen.getByText('Horas máquina')).toBeTruthy();
    expect(screen.getByText('1.000 hora-maquina disponibles')).toBeTruthy();
    expect(screen.getByText('$ 140.000,00')).toBeTruthy();

    const filas = screen.getAllByRole('row');
    expect(within(filas[1]!).getByText('Producto Y')).toBeTruthy();
    expect(within(filas[1]!).getAllByText('$ 200,00')).toHaveLength(2);
    expect(within(filas[2]!).getByText('Producto X')).toBeTruthy();
    expect(within(filas[2]!).getByText('$ 100,00')).toBeTruthy();
    expect(within(filas[2]!).getByText('$ 300,00')).toBeTruthy();
  });

  it('sin cuello activo explica la ausencia y no dibuja ningún ranking', () => {
    render(<MezclaOptimaPanel data={{
      recurso: null,
      ranking: [],
      contribucionMarginalTotal: null,
      recursoRestante: null,
      motivoSinRanking: 'No hay un cuello de botella activo; marcá el recurso que limita la producción para calcular el ranking.',
    }} />);

    expect(screen.getByText(/No hay un cuello de botella activo/)).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('con dos recursos activos muestra el mensaje 422 y no dibuja ningún ranking', () => {
    render(<MezclaOptimaPanel error="Hay más de un recurso escaso activo: desactivá el que no limita esta decisión o usá programación lineal para restricciones múltiples." />);

    expect(screen.getByRole('alert').textContent).toMatch(/desactivá el que no limita/);
    expect(screen.queryByRole('table')).toBeNull();
  });
});
