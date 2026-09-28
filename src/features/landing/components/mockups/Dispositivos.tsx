import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Marcos para mostrar capturas reales de la app. Las capturas se sacan con el
 * frontend de verdad y datos de ejemplo (ver docs/sesiones de #240), así que
 * lo que se ve en la landing es el producto, no un dibujo.
 */
export function VentanaNavegador({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn('ventana overflow-hidden rounded-2xl border border-line bg-surface', className)}>
      <div className="flex items-center gap-3 border-b border-line bg-surface-alt px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-line-strong" />
          <span className="size-3 rounded-full bg-line-strong" />
          <span className="size-3 rounded-full bg-line-strong" />
        </span>
        <span className="mx-auto flex items-center gap-1.5 rounded-md bg-surface px-3 py-1 text-xs text-ink-soft">
          <Lock className="size-3" aria-hidden="true" />
          Costear
        </span>
        <span className="w-12" aria-hidden="true" />
      </div>
      <img src={src} alt={alt} className="block w-full" loading="eager" decoding="async" />
    </div>
  );
}

export function Telefono({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn('telefono rounded-[2.6rem] bg-ink p-2', className)}>
      <div className="relative overflow-hidden rounded-[2.1rem] bg-surface-alt">
        {/* Franja de estado, como en un teléfono real: la captura empieza debajo
            de la isla y la barra de la app no queda tapada. */}
        <div aria-hidden="true" className="relative flex h-8 items-center justify-between px-5 text-[10px] font-semibold text-ink">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-[2px] bg-ink" />
            <span className="h-2.5 w-5 rounded-[3px] border border-ink p-[1px]">
              <span className="block h-full w-3/4 rounded-[1px] bg-ink" />
            </span>
          </span>
        </div>
        <img src={src} alt={alt} className="block w-full" loading="lazy" decoding="async" />
      </div>
    </div>
  );
}

export function TarjetaFlotante({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('tarjeta-flotante rounded-2xl border border-line bg-surface/95 p-4 text-left text-ink backdrop-blur-md', className)}>
      {children}
    </div>
  );
}
