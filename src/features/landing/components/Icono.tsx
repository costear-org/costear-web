import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Íconos propios de la landing: formas llenas con degradé granate y un brillo
 * arriba, para que tengan volumen. No son de una librería: son la marca.
 */
export type NombreIcono = 'etiqueta' | 'campana' | 'escudo' | 'celular' | 'planilla' | 'balanza' | 'charla' | 'capas' | 'flecha';

const FORMAS: Record<NombreIcono, string> = {
  // Etiqueta de precio con ojal.
  etiqueta:
    'M34 6h18a6 6 0 0 1 6 6v18a6 6 0 0 1-1.8 4.2L34.2 56.2a6 6 0 0 1-8.4 0L7.8 38.2a6 6 0 0 1 0-8.4L29.8 7.8A6 6 0 0 1 34 6Zm11 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z',
  campana:
    'M32 6a4 4 0 0 1 4 4v1.6c8 1.8 13 8.6 13 17.4v9l5 7v3H10v-3l5-7v-9c0-8.8 5-15.6 13-17.4V10a4 4 0 0 1 4-4Zm-7 44h14a7 7 0 0 1-14 0Z',
  escudo: 'M32 5 54 13v16c0 14-9.4 25.4-22 30-12.6-4.6-22-16-22-30V13L32 5Zm-4 36 17-17-4.2-4.2L28 32.6l-6.8-6.8L17 30l11 11Z',
  celular:
    'M21 4h22a6 6 0 0 1 6 6v44a6 6 0 0 1-6 6H21a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6Zm6 5a2 2 0 0 0 0 4h10a2 2 0 0 0 0-4H27Zm5 40a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  planilla:
    'M14 6h26l12 12v36a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6Zm4 24v6h10v-6H18Zm14 0v6h14v-6H32Zm-14 10v6h10v-6H18Zm14 0v6h14v-6H32ZM40 8v10h10L40 8Z',
  balanza:
    'M30 6h4v8h14l8 18a10 10 0 0 1-20 0l7-15.8H34V52h12v6H18v-6h12V16.2H21L28 32a10 10 0 0 1-20 0l8-18h14V6Zm-12 13.6L12.6 32h10.8L18 19.6Zm28 0L40.6 32h10.8L46 19.6Z',
  charla:
    'M12 8h40a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H30L18 56V44h-6a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Zm8 15a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm12 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm12 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  capas: 'M32 4 60 18 32 32 4 18 32 4Zm-21.6 22L32 36.8 53.6 26 60 29.2 32 43.2 4 29.2 10.4 26Zm0 11.2L32 48l21.6-10.8L60 40.4 32 54.4 4 40.4l6.4-3.2Z',
  flecha: 'M16 8h40v40h-10V25.1L15.5 55.6l-7.1-7.1L38.9 18H16V8Z',
};

export function Icono({ nombre, className, claro = false }: { nombre: NombreIcono; className?: string; claro?: boolean }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn('size-12', className)}>
      <defs>
        <linearGradient id={`${id}-relleno`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={claro ? 'var(--color-surface)' : 'var(--color-action-soft)'} />
          <stop offset="1" stopColor={claro ? 'var(--color-granate-tenue)' : 'var(--color-granate-deep)'} />
        </linearGradient>
        <linearGradient id={`${id}-brillo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-surface)" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="var(--color-surface)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={FORMAS[nombre]} fill={`url(#${id}-relleno)`} fillRule="evenodd" />
      <path d={FORMAS[nombre]} fill={`url(#${id}-brillo)`} fillRule="evenodd" />
    </svg>
  );
}
