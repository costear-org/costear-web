import { calcularEjemplo, enPesos } from '../demo-margen';
import { BotonWhatsApp } from './BotonWhatsApp';
import { Icono } from './Icono';

const antes = calcularEjemplo(0);
const despues = calcularEjemplo(0.1);

export function CierreSection() {
  return (
    <section aria-labelledby="titulo-cierre" className="bg-surface px-4 pb-24 sm:px-6 md:pb-32">
      <div className="panel-granate relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-7 py-16 text-surface sm:px-14 md:py-20">
        <div className="hero-grilla pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative grid gap-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <h2 id="titulo-cierre" className="text-4xl font-medium leading-tight tracking-[-0.03em] sm:text-5xl">
              ¿Cuándo fue la última vez que remarcaste con números?
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-surface/70">
              Contanos qué fabricás y cómo calculás tus precios hoy. En una charla vemos si CosteAR te sirve y
              qué habría que adaptar.
            </p>
            <div className="mt-9">
              <BotonWhatsApp sobreOscuro />
            </div>
          </div>
          <div className="relative hidden md:col-span-5 md:block" aria-hidden="true">
            <div className="tarjeta-flotante ml-auto w-72 rotate-3 rounded-2xl bg-surface p-5 text-ink">
              <div className="flex items-center gap-3">
                <Icono nombre="etiqueta" className="size-9" />
                <span className="text-sm text-ink-soft">Estantería metálica</span>
              </div>
              <p className="mt-4 text-sm text-ink-soft line-through decoration-action/60">{enPesos(antes.precioDeVenta)}</p>
              <p className="font-mono text-4xl font-semibold tabular-nums text-granate-deep">{enPesos(despues.precioSugerido)}</p>
              <p className="mt-3 text-xs text-ink-soft">Precio sugerido tras una suba del 10 % del dólar. Ejemplo.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
