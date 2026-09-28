/**
 * El ejemplo interactivo de la landing: un producto ficticio y qué le pasa a
 * su margen cuando sube el dólar.
 *
 * No es un número de cliente ni sale del backend (FE-07 cubre la plata de un
 * cliente real; esto es una ilustración y la página lo dice). Los importes son
 * inventados a propósito para que la cuenta se pueda seguir de cabeza: solo
 * se encarece la parte de los materiales que se paga en dólares, igual que en
 * una estructura real donde la mano de obra va por paritaria y no por el tipo
 * de cambio.
 */

export const UMBRAL_ALERTA = 0.15;
export const SUBA_MAXIMA = 0.4;
/** Las subas que se pueden probar en la remarcadora de la landing. */
export const SUBAS_DE_EJEMPLO = [0.05, 0.1, 0.2, 0.3] as const;

const PRECIO_DE_VENTA = 86_000;
const MATERIALES = 38_700;
const MATERIALES_EN_DOLARES = 31_000;
const MANO_DE_OBRA = 17_400;
const GASTOS_DE_FABRICA = 11_200;

export type LineaDeCosto = {
  id: 'materiales' | 'mano-de-obra' | 'gastos-de-fabrica';
  nombre: string;
  detalle: string;
  importe: number;
  cambiaConElDolar: boolean;
};

export type ResultadoEjemplo = {
  lineas: LineaDeCosto[];
  costoTotal: number;
  precioDeVenta: number;
  margen: number;
  debajoDelUmbral: boolean;
  precioSugerido: number;
};

const COSTO_INICIAL = MATERIALES + MANO_DE_OBRA + GASTOS_DE_FABRICA;
const MARGEN_INICIAL = (PRECIO_DE_VENTA - COSTO_INICIAL) / PRECIO_DE_VENTA;

export function calcularEjemplo(subaDelDolar: number): ResultadoEjemplo {
  if (subaDelDolar < 0 || subaDelDolar > SUBA_MAXIMA) {
    throw new RangeError(`La suba del dólar tiene que estar entre 0 y ${SUBA_MAXIMA}`);
  }

  const lineas: LineaDeCosto[] = [
    {
      id: 'materiales',
      nombre: 'Materiales',
      detalle: 'Chapa y tornillería, en su mayoría importadas',
      importe: MATERIALES + MATERIALES_EN_DOLARES * subaDelDolar,
      cambiaConElDolar: true,
    },
    {
      id: 'mano-de-obra',
      nombre: 'Mano de obra',
      detalle: 'Horas de corte, plegado y armado',
      importe: MANO_DE_OBRA,
      cambiaConElDolar: false,
    },
    {
      id: 'gastos-de-fabrica',
      nombre: 'Gastos de fábrica',
      detalle: 'Luz, mantenimiento y alquiler del taller',
      importe: GASTOS_DE_FABRICA,
      cambiaConElDolar: false,
    },
  ];

  const costoTotal = lineas.reduce((total, linea) => total + linea.importe, 0);
  const margen = (PRECIO_DE_VENTA - costoTotal) / PRECIO_DE_VENTA;

  return {
    lineas,
    costoTotal,
    precioDeVenta: PRECIO_DE_VENTA,
    margen,
    debajoDelUmbral: margen < UMBRAL_ALERTA,
    precioSugerido: costoTotal / (1 - MARGEN_INICIAL),
  };
}

/** La suba del dólar a partir de la cual el margen queda debajo del umbral. */
export function subaQueCruzaElUmbral(): number {
  const costoMaximo = PRECIO_DE_VENTA * (1 - UMBRAL_ALERTA);
  return (costoMaximo - COSTO_INICIAL) / MATERIALES_EN_DOLARES;
}

const PESOS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});
const PORCENTAJE = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const enPesos = (importe: number) => PESOS.format(importe);
export const enPorcentaje = (valor: number) => PORCENTAJE.format(valor);
