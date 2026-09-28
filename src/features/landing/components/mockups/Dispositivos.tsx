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
          CosteAR
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
      <div className="relative overflow-hidden rounded-[2.1rem]">
        <span aria-hidden="true" className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />
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
