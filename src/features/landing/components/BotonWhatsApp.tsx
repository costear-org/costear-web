import { cn } from '@/lib/utils';
import { WHATSAPP_URL } from '../contacto';
import { LogoWhatsApp } from './LogoWhatsApp';

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
        'inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-base font-semibold transition-colors',
        sobreOscuro ? 'bg-surface text-granate-deep hover:bg-granate-tenue' : 'bg-granate text-surface hover:bg-granate-deep',
        className,
      )}
    >
      <LogoWhatsApp className="size-5" />
      Hablemos por WhatsApp
    </a>
  );
}
