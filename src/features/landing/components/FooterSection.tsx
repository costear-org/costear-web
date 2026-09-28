import { CosteARLogo } from '@/components/layout/CosteARLogo';
import { EMAIL_URL, WHATSAPP_URL } from '../contacto';

export function FooterSection({ onAccessClick }: { onAccessClick: () => void }) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="size-7">
            <CosteARLogo className="size-full text-granate" animate={false} />
          </span>
          <span className="font-semibold text-granate-deep">Costear</span>
          <span className="text-sm text-ink-soft">Hecho en Tucumán, Argentina</span>
        </div>
        <nav aria-label="Contacto" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-granate">WhatsApp</a>
          <a href={EMAIL_URL} className="hover:text-granate">Email</a>
          <button type="button" onClick={onAccessClick} className="cursor-pointer hover:text-granate">Ingresar</button>
        </nav>
      </div>
    </footer>
  );
}
