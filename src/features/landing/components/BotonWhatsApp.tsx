import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHATSAPP_URL } from '../contacto';

/**
 * La única acción de la landing. Se repite igual en todos lados para que la
 * persona aprenda un solo botón: mismo texto, mismo destino.
 */
export function BotonWhatsApp({ tamano = 'grande', className }: { tamano?: 'grande' | 'chico'; className?: string }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md bg-action font-semibold text-surface transition-colors hover:bg-granate',
        tamano === 'grande' ? 'px-7 py-4 text-base sm:text-lg' : 'px-4 py-2 text-sm',
        className,
      )}
    >
      <MessageCircle className={tamano === 'grande' ? 'size-5' : 'size-4'} aria-hidden="true" />
      Hablemos por WhatsApp
    </a>
  );
}
