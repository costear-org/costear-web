import tableroCelular from '@/assets/landing/tablero-celular.jpg';
import { BotonWhatsApp } from './BotonWhatsApp';
import { Telefono } from './mockups/Dispositivos';

/**
 * El cierre repite la única acción de la página y muestra el producto una vez
 * más, asomando desde abajo: lo último que se ve es la app, no un número suelto.
 */
export function CierreSection() {
  return (
    <section aria-labelledby="titulo-cierre" className="bg-surface px-4 pb-24 sm:px-6 md:pb-32">
      <div className="panel-granate relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-7 pt-16 text-surface sm:px-14 md:pt-20">
        <div className="hero-grilla pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative grid gap-12 md:grid-cols-12">
          <div className="pb-16 md:col-span-7 md:pb-20">
            <h2 id="titulo-cierre" className="text-4xl font-medium leading-tight tracking-[-0.03em] sm:text-5xl">
              ¿Cuándo fue la última vez que remarcaste con números?
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-surface/70">
              Contanos qué fabricás y cómo calculás tus precios hoy. En una charla vemos si Costear te sirve y
              qué habría que adaptar.
            </p>
            <div className="mt-9">
              <BotonWhatsApp sobreOscuro />
              <p className="mt-4 text-sm text-surface/60">Te responde una persona del equipo, sin compromiso.</p>
            </div>
          </div>
          <div className="relative hidden md:col-span-5 md:block" aria-hidden="true">
            <Telefono src={tableroCelular} alt="" className="absolute -bottom-40 left-1/2 w-60 -translate-x-1/2 rotate-[4deg]" />
          </div>
        </div>
      </div>
    </section>
  );
}
