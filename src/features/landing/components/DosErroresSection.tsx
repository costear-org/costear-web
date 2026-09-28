import { Sticker } from './Sticker';

/**
 * El problema, contado con los dos modos de equivocarse al remarcar. Es la
 * tensión que el resto de la página resuelve.
 */
export function DosErroresSection() {
  return (
    <section aria-labelledby="titulo-errores" className="border-y border-line bg-surface-alt py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="titulo-errores" className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-granate-deep sm:text-5xl">
          Remarcar a ojo sale mal de dos maneras.
        </h2>

        <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-20">
          <div>
            <Sticker tono="viejo" giro={-4} className="text-3xl sm:text-4xl">
              Subiste de menos
            </Sticker>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink">
              Vendés igual que siempre, pero cada venta te deja menos. Te enterás a fin de mes, cuando ya
              pasó.
            </p>
          </div>
          <div>
            <Sticker tono="viejo" giro={3} className="text-3xl sm:text-4xl">
              Subiste de más
            </Sticker>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink">
              El margen se ve bien en papel, pero tus clientes le compran a otro que sí hizo la cuenta.
            </p>
          </div>
        </div>

        <p className="mt-16 max-w-2xl border-t border-line-strong pt-8 text-xl leading-relaxed text-ink-soft">
          El precio justo sale de lo que te cuesta fabricar. Y eso cambia cada vez que se mueven el dólar,
          la inflación o las paritarias.
        </p>
      </div>
    </section>
  );
}
