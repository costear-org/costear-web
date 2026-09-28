import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUBAS_DE_EJEMPLO, calcularEjemplo, enPesos, enPorcentaje } from '../demo-margen';

/**
 * La pieza interactiva de la página: elegís cuánto subió el dólar y la
 * pantalla muestra el precio que mantiene el margen. Es la misma cuenta que
 * hace el producto, con un producto inventado.
 */
export function PanelRemarcadora() {
  const [suba, setSuba] = useState<number>(SUBAS_DE_EJEMPLO[1]);
  const inicial = calcularEjemplo(0);
  const r = calcularEjemplo(suba);

  return (
    <div className="panel-granate relative overflow-hidden rounded-[1.75rem] p-7 text-surface sm:p-10 lg:col-span-2">
      <div className="grid gap-10 md:grid-cols-[1fr_1.15fr] md:items-center">
        <div>
          <h3 className="text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
            Probá qué pasa si sube el dólar
          </h3>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-surface/70">
            Una estantería de {enPesos(inicial.precioDeVenta)} con la chapa importada. Elegí la suba y mirá
            el precio que la sostiene.
          </p>
          <fieldset className="mt-7">
            <legend className="text-sm text-surface/70">Suba del dólar</legend>
            <div className="mt-3 inline-flex rounded-full border border-surface/15 bg-surface/5 p-1">
              {SUBAS_DE_EJEMPLO.map((valor) => (
                <label
                  key={valor}
                  className={cn(
                    'cursor-pointer whitespace-nowrap rounded-full px-3.5 py-2 font-mono text-sm font-semibold tabular-nums transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-surface sm:px-5',
                    suba === valor ? 'bg-surface text-granate-deep' : 'text-surface/80 hover:text-surface',
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
          <p className="mt-4 text-xs text-surface/50">Ejemplo con números inventados.</p>
        </div>

        <div className="min-w-0 rounded-2xl bg-surface p-6 text-ink sm:p-7" aria-live="polite">
          <p className="text-xs text-ink-soft">Estantería metálica, 5 estantes</p>
          <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
            <span className="font-mono tabular-nums line-through decoration-action/60">{enPesos(inicial.precioDeVenta)}</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
            <span className="rounded-full bg-granate-tenue px-2 py-0.5 text-xs font-semibold text-granate">Precio sugerido</span>
          </p>
          <p
            data-testid="precio-remarcado"
            className="mt-1 font-mono text-3xl font-semibold tabular-nums text-granate-deep sm:text-4xl"
          >
            {enPesos(r.precioSugerido)}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-surface-alt p-3">
              <dt className="text-xs text-ink-soft">Tu costo subió</dt>
              <dd className="mt-1 font-mono font-semibold tabular-nums">{enPesos(r.costoTotal - inicial.costoTotal)}</dd>
            </div>
            <div className="rounded-xl bg-surface-alt p-3">
              <dt className="text-xs text-ink-soft">Si no remarcás, te queda</dt>
              <dd className={cn('mt-1 font-mono font-semibold tabular-nums', r.debajoDelUmbral ? 'text-danger' : 'text-ink')}>
                {enPorcentaje(r.margen)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-ink-soft">
            Al precio sugerido volvés a ganar el {enPorcentaje(inicial.margen)}.
          </p>
        </div>
      </div>
    </div>
  );
}
