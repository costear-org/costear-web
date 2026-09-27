import { AlertCircle, ArrowRightLeft, Scale } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import type { PrecioTransferenciaData } from './owner-dashboard-hooks';

const numberFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function valor(value: number, unit: string) {
  return `${numberFormatter.format(value)} ${unit}`;
}

export function PrecioTransferenciaPanel({
  data,
  isLoading = false,
  error,
}: {
  data?: PrecioTransferenciaData;
  isLoading?: boolean;
  error?: string;
}) {
  const usosCompletos = Boolean(
    data?.usoDeCadaCriterio.COSTO_VARIABLE.trim()
    && data.usoDeCadaCriterio.MERCADO.trim(),
  );
  const valoresCompletos = Boolean(data
    && Number.isFinite(data.equilibrioACostoVariable)
    && Number.isFinite(data.equilibrioAMercado)
    && Number.isFinite(data.diferencia));
  const incompleto = data && (!usosCompletos || !valoresCompletos);

  return (
    <Card data-testid="precio-transferencia-panel">
      <CardHeader
        title="Precio de transferencia interna"
        description="Las dos formas de valorar un producto interno cambian el equilibrio, pero sirven para decisiones distintas."
        action={<ArrowRightLeft className="size-5 text-granate" aria-hidden="true" />}
      />
      <CardBody>
        {isLoading && (
          <p role="status" className="text-sm text-ink-soft">Comparando los dos criterios…</p>
        )}

        {error && !isLoading && (
          <div role="alert" className="flex items-start gap-3 text-sm text-ink-soft">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {incompleto && !error && !isLoading && (
          <div role="alert" className="flex items-start gap-3 text-sm text-ink-soft">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <p>La respuesta no informa para qué se usa cada criterio o no trae las tres cifras completas.</p>
          </div>
        )}

        {data && usosCompletos && valoresCompletos && !error && !isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section
                data-testid="transferencia-costo-variable"
                className="rounded-2xl border border-granate/15 bg-granate-tenue p-5"
              >
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-granate">A costo variable</p>
                <p className="mt-2 font-mono-jb text-2xl font-bold text-granate-deep">
                  {valor(data.equilibrioACostoVariable, data.unidades.equilibrioACostoVariable)}
                </p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-ink">
                  {data.usoDeCadaCriterio.COSTO_VARIABLE}
                </p>
              </section>

              <section
                data-testid="transferencia-mercado"
                className="rounded-2xl border border-line bg-surface-alt p-5"
              >
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">A precio de mercado</p>
                <p className="mt-2 font-mono-jb text-2xl font-bold text-ink">
                  {valor(data.equilibrioAMercado, data.unidades.equilibrioAMercado)}
                </p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-ink">
                  {data.usoDeCadaCriterio.MERCADO}
                </p>
              </section>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3">
              <Scale className="mt-0.5 size-4 shrink-0 text-granate" aria-hidden="true" />
              <p className="text-sm text-ink-soft">
                Diferencia entre criterios:{' '}
                <strong className="font-mono-jb text-ink">
                  {valor(data.diferencia, data.unidades.diferencia)}
                </strong>
              </p>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
