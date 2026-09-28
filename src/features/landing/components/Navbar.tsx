import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { CosteARLogo } from '@/components/layout/CosteARLogo';
import { cn } from '@/lib/utils';
import { WHATSAPP_URL } from '../contacto';
import { LogoWhatsApp } from './LogoWhatsApp';
import { irASeccion } from '../ir-a-seccion';

interface NavbarProps {
  onAccessClick: () => void;
}

const SECCIONES = [
  { href: '#funciones', texto: 'Qué hace' },
  { href: '#como-empezamos', texto: 'Cómo empezamos' },
  { href: '#metodo', texto: 'El método' },
  { href: '#preguntas', texto: 'Preguntas' },
];

/**
 * Barra flotante: transparente sobre el hero y, al bajar, una cápsula de
 * vidrio que acompaña el scroll con la acción siempre a mano.
 */
export function Navbar({ onAccessClick }: NavbarProps) {
  const { accessToken } = useAuthStore();
  const [bajo, setBajo] = useState(false);
  const [activa, setActiva] = useState<string | null>(null);

  // Marca la sección que está a la altura del centro de la pantalla.
  useEffect(() => {
    const secciones = SECCIONES.map((s) => document.querySelector(s.href)).filter((el): el is Element => el !== null);
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) setActiva('#' + entrada.target.id);
        }
      },
      { rootMargin: '-45% 0px -54% 0px' },
    );
    secciones.forEach((el) => observador.observe(el));
    const alVolverArriba = () => {
      if (window.scrollY < 200) setActiva(null);
    };
    window.addEventListener('scroll', alVolverArriba, { passive: true });
    return () => {
      observador.disconnect();
      window.removeEventListener('scroll', alVolverArriba);
    };
  }, []);

  useEffect(() => {
    const alScrollear = () => setBajo(window.scrollY > 24);
    alScrollear();
    window.addEventListener('scroll', alScrollear, { passive: true });
    return () => window.removeEventListener('scroll', alScrollear);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full py-2 pl-4 pr-2 transition-all duration-300',
          bajo ? 'border border-line bg-surface/80 shadow-[0_12px_32px_-20px_color-mix(in_srgb,var(--color-granate-deep)_40%,transparent)] backdrop-blur-xl' : 'border border-transparent',
        )}
      >
        <span className="flex items-center gap-2">
          <span className="size-8">
            <CosteARLogo className="size-full text-granate" animate={false} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-granate-deep">Costear</span>
        </span>

        <nav aria-label="Secciones" className="hidden items-center gap-1 lg:flex">
          {SECCIONES.map((s) => (
            <a
              key={s.href}
              href={s.href}
              onClick={(e) => irASeccion(e, s.href)}
              aria-current={activa === s.href ? 'location' : undefined}
              className={cn(
                'relative rounded-full px-4 py-2 text-sm transition-colors hover:text-ink',
                activa === s.href ? 'font-medium text-granate-deep' : 'text-ink-soft',
              )}
            >
              {s.texto}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-granate transition-transform duration-300',
                  activa === s.href ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAccessClick}
            className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-alt"
          >
            {accessToken ? 'Ir al panel' : 'Ingresar'}
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full bg-granate px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-granate-deep sm:inline-flex"
          >
            <LogoWhatsApp className="size-4" />
            Hablemos
          </a>
        </div>
      </div>
    </header>
  );
}
