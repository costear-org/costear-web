import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHATSAPP_URL } from '../contacto';

/**
 * La acción principal de la landing, igual en todos lados: mismo texto,
 * mismo destino. `sobreOscuro` la invierte para los fondos granate.
 */
export function BotonWhatsApp({ sobreOscuro = false, className }: { sobreOscuro?: boolean; className?: string }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group inline-flex items-center gap-3 rounded-full py-2 pl-6 pr-2 text-base font-semibold transition-colors',
        sobreOscuro ? 'bg-surface text-granate-deep hover:bg-granate-tenue' : 'bg-granate text-surface hover:bg-granate-deep',
        className,
      )}
    >
      Hablemos por WhatsApp
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-full transition-transform group-hover:rotate-[-8deg]',
          sobreOscuro ? 'bg-action text-surface' : 'bg-surface text-granate',
        )}
      >
        <MessageCircle className="size-5" aria-hidden="true" />
      </span>
    </a>
  );
}
