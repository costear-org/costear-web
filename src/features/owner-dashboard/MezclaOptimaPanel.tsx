import { AlertCircle, Gauge, ListOrdered } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatMoney } from '@/lib/utils';
import type { MezclaOptimaData } from './owner-dashboard-hooks';

const quantityFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function cantidad(value: number) {
  return quantityFormatter.format(value);
}

export function MezclaOptimaPanel({
  data,
  isLoading = false,
  error,
}: {
  data?: MezclaOptimaData;
  isLoading?: boolean;
  error?: string;
}) {
  const sinRanking = data && data.ranking.length === 0;
  const recurso = data?.recurso;

  return (
    <Card data-testid="mezcla-optima-panel">
      <CardHeader
        title="Qué producir primero"
        description="Ordenado por lo que deja cada unidad del recurso que limita la producción."
        action={<ListOrdered className="size-5 text-granate" aria-hidden="true" />}
      />
      <CardBody>
        {isLoading && (
          <p role="status" className="text-sm text-ink-soft">Buscando el recurso que limita la producción…</p>
        )}

        {error && !isLoading && (
          <div role="alert" className="flex items-start gap-3 text-sm text-ink-soft">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {sinRanking && !error && !isLoading && (
          <div role="status" className="flex items-start gap-3 text-sm text-ink-soft">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <p>{data.motivoSinRanking ?? 'No hay productos con datos suficientes para armar el ranking.'}</p>
          </div>
        )}

        {recurso && data && data.ranking.length > 0 && !error && (
          <>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-surface-alt p-4">
                <div className="flex items-center gap-2 text-granate">
                  <Gauge className="size-4" aria-hidden="true" />
                  <p className="text-[11px] font-extrabold uppercase tracking-wider">Recurso escaso activo</p>
                </div>
                <p className="mt-2 text-base font-bold text-ink">{recurso.nombreUnidad}</p>
                <p className="mt-1 text-[11px] text-ink-soft">
                  {cantidad(recurso.disponibleEnPeriodo)} {recurso.unidad} disponibles
                </p>
              </div>
              <div className="rounded-xl border border-granate/15 bg-granate-tenue p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-granate">Contribución de la mezcla</p>
                <p className="mt-2 font-mono-jb text-xl font-bold text-granate-deep">
                  {formatMoney(data.contribucionMarginalTotal)}
                </p>
                {data.recursoRestante !== null && (
                  <p className="mt-1 text-[11px] text-ink-soft">
                    Quedan {cantidad(data.recursoRestante)} {recurso.unidad} sin asignar.
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[620px] text-left">
                <thead className="bg-surface-alt text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
                  <tr>
                    <th className="px-4 py-3">Prioridad</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Por recurso escaso</th>
                    <th className="px-4 py-3">Por unidad vendida</th>
                    <th className="px-4 py-3">Cantidad asignada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-sm">
                  {data.ranking.map((item, index) => (
                    <tr key={item.productoId}>
                      <td className="px-4 py-3 font-mono-jb font-bold text-granate">{index + 1}</td>
                      <td className="px-4 py-3 font-bold text-ink">{item.producto}</td>
                      <td className="px-4 py-3">
                        <span className="block font-mono-jb font-bold text-ink">{formatMoney(item.cme)}</span>
                        <span className="text-[10px] text-ink-soft">por {recurso.unidad}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block font-mono-jb font-bold text-ink">{formatMoney(item.cm)}</span>
                        <span className="text-[10px] text-ink-soft">por unidad de producto</span>
                      </td>
                      <td className="px-4 py-3 font-mono-jb text-ink">
                        {cantidad(item.cantidadAsignada)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
