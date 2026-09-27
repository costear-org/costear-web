// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlaneamientoResultadosPanel } from './PlaneamientoResultadosPanel';
import type { PlaneamientoResultadosInput } from './owner-dashboard-hooks';

afterEach(cleanup);

function completarBase() {
  fireEvent.change(screen.getByLabelText('Costos fijos'), { target: { value: '8000' } });
  fireEvent.change(screen.getByLabelText('Costo variable por unidad'), { target: { value: '30' } });
  fireEvent.change(screen.getByLabelText('Precio por unidad'), { target: { value: '100' } });
}

describe('planeamiento de resultados', () => {
  it('muestra cuánto vender para lograr un porcentaje sobre el capital', async () => {
    const onCalculate = vi.fn(async (_input: PlaneamientoResultadosInput) => ({
      cantidadNecesaria: 170.3971119,
      ventasNecesarias: 17_039.71119,
      resultadoLogrado: 3_927.7978339,
      basadoEn: 'porcentaje_sobre_capital' as const,
      unidades: { cantidadNecesaria: 'unidades', ventasNecesarias: 'ARS', resultadoLogrado: 'ARS' },
    }));
    render(<PlaneamientoResultadosPanel companyId="company-1" unit="unidad" onCalculate={onCalculate} />);

    completarBase();
    fireEvent.click(screen.getByLabelText('Porcentaje sobre el capital'));
    fireEvent.change(screen.getByLabelText('Ganancia buscada'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Capital fijo invertido'), { target: { value: '30000' } });
    fireEvent.change(screen.getByLabelText('Capital por peso de costo variable'), { target: { value: '0.25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calcular objetivo' }));

    await waitFor(() => expect(onCalculate).toHaveBeenCalledTimes(1));
    expect(onCalculate).toHaveBeenCalledWith({
      modalidad: 'fisica',
      costosFijos: 8000,
      costoVariableUnitario: 30,
      precioUnitario: 100,
      unidadCantidad: 'unidad',
      moneda: 'ARS',
      objetivo: {
        tipo: 'porcentaje_sobre_capital',
        tasa: 0.1,
        capitalFijo: 30000,
        capitalPorPesoCostoVariable: 0.25,
      },
    });

    const result = await screen.findByTestId('planeamiento-resultado');
    expect(within(result).getByText('170,40 unidades')).toBeTruthy();
    expect(within(result).getByText('$ 17.039,71')).toBeTruthy();
    expect(within(result).getByText('$ 3.927,80')).toBeTruthy();
  });

  it('muestra el mensaje 422 de R12 tal cual lo publica el backend', async () => {
    const response = {
      status: 422,
      data: { error: { message: 'Yardín muestra que al vender la mitad el objetivo sobre ventas empeora.' } },
    } as AxiosResponse;
    const onCalculate = vi.fn(async () => {
      throw new AxiosError('unprocessable', undefined, undefined, undefined, response);
    });
    render(<PlaneamientoResultadosPanel companyId="company-1" unit="unidad" onCalculate={onCalculate} />);

    completarBase();
    fireEvent.change(screen.getByLabelText('Resultado que querés lograr'), { target: { value: '4000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calcular objetivo' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Yardín muestra que al vender la mitad el objetivo sobre ventas empeora.');
  });

  it('explica por qué no hay equilibrio y no muestra infinito ni un guion', async () => {
    const motivo = 'La contribución marginal disponible es cero o negativa; no existe un volumen que alcance el objetivo.';
    const onCalculate = vi.fn(async () => ({
      cantidadNecesaria: null,
      ventasNecesarias: null,
      resultadoLogrado: null,
      basadoEn: 'resultado_absoluto' as const,
      unidades: { cantidadNecesaria: 'unidades', ventasNecesarias: 'ARS', resultadoLogrado: 'ARS' },
      motivo,
    }));
    render(<PlaneamientoResultadosPanel companyId="company-1" unit="unidad" onCalculate={onCalculate} />);

    completarBase();
    fireEvent.change(screen.getByLabelText('Resultado que querés lograr'), { target: { value: '4000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calcular objetivo' }));

    const result = await screen.findByTestId('planeamiento-resultado');
    expect(within(result).getByText(motivo)).toBeTruthy();
    expect(result.textContent).not.toMatch(/Infinity|∞|—/);
  });
});
