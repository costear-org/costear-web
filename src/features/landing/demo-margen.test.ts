import { describe, expect, it } from 'vitest';
import { UMBRAL_ALERTA, calcularEjemplo, subaQueCruzaElUmbral } from './demo-margen';

describe('ejemplo de la landing: qué le pasa al margen cuando sube el dólar', () => {
  it('sin suba del dólar, el producto deja algo más del 21 %', () => {
    const r = calcularEjemplo(0);

    expect(r.costoTotal).toBe(67_300);
    expect(r.margen).toBeCloseTo(0.2174, 4);
    expect(r.debajoDelUmbral).toBe(false);
  });

  it('solo se encarece la parte de los materiales que se paga en dólares', () => {
    const r = calcularEjemplo(0.25);
    const materiales = r.lineas.find((l) => l.id === 'materiales');
    const manoDeObra = r.lineas.find((l) => l.id === 'mano-de-obra');

    expect(materiales?.importe).toBe(38_700 + 31_000 * 0.25);
    expect(manoDeObra?.importe).toBe(17_400);
    expect(r.costoTotal).toBe(75_050);
  });

  it('con un 25 % de suba el margen cae debajo del umbral y salta el aviso', () => {
    const r = calcularEjemplo(0.25);

    expect(r.margen).toBeLessThan(UMBRAL_ALERTA);
    expect(r.debajoDelUmbral).toBe(true);
  });

  it('el precio sugerido devuelve el margen que el producto tenía antes de la suba', () => {
    const inicial = calcularEjemplo(0);
    const r = calcularEjemplo(0.25);

    expect((r.precioSugerido - r.costoTotal) / r.precioSugerido).toBeCloseTo(inicial.margen, 6);
  });

  it('el umbral se cruza con una suba de entre 18 % y 19 %', () => {
    const suba = subaQueCruzaElUmbral();

    expect(suba).toBeGreaterThan(0.18);
    expect(suba).toBeLessThan(0.19);
    expect(calcularEjemplo(suba - 0.001).debajoDelUmbral).toBe(false);
    expect(calcularEjemplo(suba + 0.001).debajoDelUmbral).toBe(true);
  });

  it('rechaza una suba fuera del rango que muestra la página', () => {
    expect(() => calcularEjemplo(-0.1)).toThrow();
    expect(() => calcularEjemplo(0.6)).toThrow();
  });
});
