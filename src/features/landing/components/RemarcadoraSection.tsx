import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SUBAS_DE_EJEMPLO, calcularEjemplo, enPesos, enPorcentaje } from '../demo-margen';
import { Sticker } from './Sticker';

/**
 * El momento de "lo quiero": la persona elige cuánto subió el dólar, aprieta
 * la remarcadora y sale el precio que mantiene su margen. Dos números, no una
 * tabla: el detalle vive en el producto, acá alcanza con la idea.
 */
export function RemarcadoraSection() {
  const [suba, setSuba] = useState<number>(SUBAS_DE_EJEMPLO[1]);
  const [remarcada, setRemarcada] = useState<number | null>(null);
  const inicial = calcularEjemplo(0);
  const resultado = remarcada === null ? null : calcularEjemplo(remarcada);

  return (
    <section aria-labelledby="titulo-remarcadora" className="bg-surface py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-6">
          <h2 id="titulo-remarcadora" className="text-3xl font-extrabold leading-tight tracking-tight text-granate-deep sm:text-5xl">
            Probalo con una estantería.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
            Hoy la vendés a {enPesos(inicial.precioDeVenta)}. Casi toda la chapa es importada, así que el
            dólar te mueve el costo.
          </p>

          <fieldset className="mt-10">
            <legend className="text-base font-semibold text-ink">¿Cuánto subió el dólar?</legend>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:flex sm:gap-3">
              {SUBAS_DE_EJEMPLO.map((valor) => (
                <label
                  key={valor}
                  className={cn(
                    'cursor-pointer rounded-md border px-2 py-3 text-center font-mono sm:px-5 text-lg font-semibold tabular-nums transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action',
                    suba === valor
                      ? 'border-granate bg-granate text-surface'
                      : 'border-line-strong bg-surface text-ink hover:border-granate',
                  )}
                >
                  <input
                    type="radio"
                    name="suba-dolar"
                    value={valor}
                    checked={suba === valor}
                    onChange={() => setSuba(valor)}
                    className="sr-only"
                  />
                  {Math.round(valor * 100)} %
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={() => setRemarcada(suba)}
            className="mt-8 cursor-pointer rounded-md border-2 border-granate-deep bg-surface px-7 py-3.5 text-base font-bold text-granate-deep transition-colors hover:bg-granate-deep hover:text-surface"
          >
            Remarcar
          </button>
          <p className="mt-3 text-sm text-ink-soft">Ejemplo con números inventados.</p>
        </div>

        <div className="md:col-span-6">
          <div className="flex min-h-80 flex-col justify-center rounded-lg border border-line-strong bg-surface-alt px-6 py-10 sm:px-10">
            <div className="relative h-24">
              <Sticker tono="viejo" giro={-3} className="absolute left-0 top-0 text-3xl">
                {enPesos(inicial.precioDeVenta)}
              </Sticker>
              {resultado && (
                <Sticker
                  key={remarcada}
                  tono="nuevo"
                  giro={2}
                  estampar
                  className="absolute left-6 top-7 text-4xl sm:text-5xl"
                >
                  <span data-testid="precio-remarcado">{enPesos(resultado.precioSugerido)}</span>
                </Sticker>
              )}
            </div>

            <div aria-live="polite" className="mt-10">
              {resultado ? (
                <p className="text-lg leading-relaxed text-ink">
                  Tu costo subió {enPesos(resultado.costoTotal - inicial.costoTotal)} por unidad. Sin
                  remarcar, esta estantería te dejaría{' '}
                  <span className="font-semibold text-danger">{enPorcentaje(resultado.margen)}</span> en
                  vez de {enPorcentaje(inicial.margen)}. A {enPesos(resultado.precioSugerido)} volvés a
                  ganar lo mismo que antes.
                </p>
              ) : (
                <p className="text-lg leading-relaxed text-ink-soft">
                  Elegí una suba y apretá Remarcar para ver el precio nuevo.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
