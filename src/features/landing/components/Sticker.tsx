import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * El sticker de la remarcadora: el motivo visual de toda la landing. Los
 * viejos quedan apagados y torcidos debajo; el que calcula CosteAR se estampa
 * arriba, en granate.
 */
interface StickerProps {
  children: ReactNode;
  tono?: 'viejo' | 'nuevo' | 'papel';
  giro?: number;
  estampar?: boolean;
  className?: string;
}

export function Sticker({ children, tono = 'papel', giro = 0, estampar = false, className }: StickerProps) {
  return (
    <span
      className={cn(
        'sticker inline-block font-mono font-bold tabular-nums',
        tono === 'viejo' && 'sticker-viejo',
        tono === 'nuevo' && 'sticker-nuevo',
        estampar && 'sticker-estampado',
        className,
      )}
      style={{ '--giro': `${giro}deg` } as CSSProperties}
    >
      {children}
    </span>
  );
}
