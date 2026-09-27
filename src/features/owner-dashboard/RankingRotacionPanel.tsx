import { AlertTriangle, RefreshCw, ShoppingBasket } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import type { CriterioRankingRotacion, RankingRotacionData } from './owner-dashboard-hooks';

const numberFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const percentFormatter = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  maximumFractionDigits: 2,
});

const motivoExclusion = {
  ROTACION_SIN_DECLARAR: 'Falta cargar cuántas veces rota este producto en el período',
} as const;

export function RankingRotacionPanel({
  data,
  isLoading = false,
  error,
  criterio,
  onCriterioChange,
}: {
  data?: RankingRotacionData;
  isLoading?: boolean;
  error?: string;
  criterio: CriterioRankingRotacion;
  onCriterioChange: (criterio: CriterioRankingRotacion) => void;
}) {
  return (
    <Card data-testid="ranking-rotacion-panel">
      <CardHeader
        title="Qué productos rinden más"
        description="Compara el margen con las veces que rota cada producto en el período."
        action={<ShoppingBasket className="size-5 text-granate" aria-hidden="true" />}
      />
      <CardBody>
        <div className="mb-5 flex flex-wrap gap-2" aria-label="Orden del ranking">
          <button
            type="button"
            aria-pressed={criterio === 'rendimiento'}
            onClick={() => onCriterioChange('rendimiento')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${criterio === 'rendimiento' ? 'bg-granate text-white' : 'border border-line bg-white text-ink-soft hover:text-ink'}`}
          >
            Margen × rotación
          </button>
          <button
            type="button"
            aria-pressed={criterio === 'margen'}
            onClick={() => onCriterioChange('margen')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${criterio === 'margen' ? 'bg-granate text-white' : 'border border-line bg-white text-ink-soft hover:text-ink'}`}
          >
            Sólo margen
          </button>
        </div>

        {isLoading && <p role="status" className="text-sm text-ink-soft">Ordenando los productos…</p>}
        {error && !isLoading && <p role="alert" className="text-sm text-danger">{error}</p>}

        {data?.criterio === 'margen' && data.advertencia && !error && (
          <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-ink">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <p>{data.advertencia}</p>
          </div>
        )}

        {data && data.ranking.length === 0 && !error && !isLoading && (
          <p role="status" className="text-sm text-ink-soft">No hay productos con rotación disponible para ordenar.</p>
        )}

        {data && data.ranking.length > 0 && !error && (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-surface-alt text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Prioridad</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Margen</th>
                  <th className="px-4 py-3">Rotación</th>
                  <th className="px-4 py-3">Rendimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {data.ranking.map((item, index) => (
                  <tr key={item.producto}>
                    <td className="px-4 py-3 font-mono-jb font-bold text-granate">{index + 1}</td>
                    <td className="px-4 py-3 font-bold text-ink">{item.producto}</td>
                    <td className="px-4 py-3 font-mono-jb text-ink">{percentFormatter.format(item.margen)}</td>
                    <td className="px-4 py-3">
                      <span className="block font-mono-jb font-bold text-ink">{numberFormatter.format(item.rotacion)}</span>
                      {item.rotacionOrigen === 'DEFAULT' && (
                        <span className="text-[10px] text-warning">estimada (valor por defecto)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono-jb font-bold text-ink">{numberFormatter.format(item.rendimiento)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.excluidos.length > 0 && !error && (
          <div className="mt-5 rounded-xl border border-line bg-surface-alt p-4">
            <div className="flex items-center gap-2 text-granate">
              <RefreshCw className="size-4" aria-hidden="true" />
              <p className="text-[11px] font-extrabold uppercase tracking-wider">Productos que faltan completar</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {data.excluidos.map((item) => (
                <li key={item.producto}><strong className="text-ink">{item.producto}:</strong> {motivoExclusion[item.motivo]}</li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
