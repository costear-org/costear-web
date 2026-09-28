import { useAuthStore } from '@/stores/auth-store';
import { CosteARLogo } from '@/components/layout/CosteARLogo';
import { BotonWhatsApp } from './BotonWhatsApp';

interface NavbarProps {
  onAccessClick: () => void;
}

/**
 * Sin links a secciones: la landing tiene un solo objetivo y cada salida de
 * más compite con él. Queda la marca, el acceso de quien ya es cliente y la
 * misma acción del hero, siempre a mano.
 */
export function Navbar({ onAccessClick }: NavbarProps) {
  const { accessToken } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <span className="flex shrink-0 items-center gap-2.5">
          <span className="size-8">
            <CosteARLogo className="size-full text-granate" animate={false} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-granate-deep">CosteAR</span>
        </span>

        <div className="flex items-center gap-1 sm:gap-4">
          <button
            type="button"
            onClick={onAccessClick}
            className="cursor-pointer rounded-md px-2 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-granate"
          >
            {accessToken ? 'Ir al panel' : 'Ingresar'}
          </button>
          <BotonWhatsApp tamano="chico" className="hidden sm:inline-flex" />
        </div>
      </div>
    </header>
  );
}
