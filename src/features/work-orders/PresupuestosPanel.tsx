import { CalendarClock, CircleDollarSign, FileCheck2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { isExpiredBudget } from './work-order-domain';
import { useBudgetAction, useWorkOrderBudgets, type BudgetState, type BudgetType, type WorkOrderStage } from './work-order-hooks';

const STATE_LABELS: Record<BudgetState, string> = { BORRADOR: 'Borrador', PREPARADO: 'Preparado', APROBADO: 'Aprobado', RECHAZADO: 'Rechazado', VENCIDO: 'Vencido' };
const ELEMENT_LABELS = { MP: 'Materiales', MOD: 'Mano de obra', CIP: 'Costos indirectos', TERCEROS: 'Terceros', ENTREGA: 'Entrega' } as const;
const money = (value: number) => `$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(value)}`;
const date = (value: string) => new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC' }).format(new Date(value));

export function PresupuestosPanel({ orderId, stages, additionalName }: { orderId: string; stages: WorkOrderStage[]; additionalName: string }) {
  const budgets = useWorkOrderBudgets(orderId);
  const action = useBudgetAction(orderId);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const stageNames = new Map(stages.map((stage) => [stage.id, stage.nombre]));
  const typeLabel = (type: BudgetType) => type === 'BASE' ? 'Base' : type === 'ADICIONAL' ? additionalName : 'Revisión';

  if (budgets.isLoading) return <p role="status">Cargando presupuesto…</p>;
  if (budgets.isError) return <p role="alert" className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm font-semibold text-danger">{apiErrorMessage(budgets.error)}</p>;

  return <section aria-labelledby="budget-title">
    <div className="mb-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><p className="flex items-center gap-2 text-sm font-semibold text-ink-soft"><CircleDollarSign className="size-4 text-granate" /> Precio contractual</p>{budgets.data?.precioContractual === undefined ? <p className="mt-2 font-semibold text-ink-soft">No disponible para tu permiso.</p> : <p className="mt-2 text-2xl font-extrabold text-granate-deep">{money(budgets.data.precioContractual)}</p>}</div>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><p className="flex items-center gap-2 text-sm font-semibold text-ink-soft"><FileCheck2 className="size-4 text-granate" /> Costo previsto aprobado</p><p className="mt-2 text-2xl font-extrabold text-granate-deep">{money(budgets.data?.costoPrevistoTotal ?? 0)}</p></div>
    </div>
    <h2 id="budget-title" className="mb-4 text-xl font-bold text-granate-deep">Versiones del presupuesto</h2>
    {budgets.data?.presupuestos.length === 0 && <p className="rounded-2xl border border-line bg-white p-5 text-ink-soft">Todavía no hay versiones de presupuesto.</p>}
    <div className="grid gap-4">{budgets.data?.presupuestos.map((budget) => {
      const expired = isExpiredBudget(budget);
      const preparedByCurrentUser = budget.preparadoPor === currentUserId;
      const approvedBase = budget.tipo === 'BASE' && budget.estado === 'APROBADO';
      return <article key={budget.id} data-testid={`presupuesto-${budget.id}`} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-action">{typeLabel(budget.tipo)} #{budget.numero}</p><p className="mt-1 text-lg font-bold text-ink">{budget.precio === undefined ? 'Precio no disponible' : money(budget.precio)}</p>{budget.causaAdicional && <p className="mt-1 text-sm text-ink-soft">{budget.causaAdicional}</p>}</div><span className="rounded-full bg-granate-tenue px-3 py-1 text-xs font-bold text-granate">{STATE_LABELS[budget.estado]}</span></div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft"><span className="inline-flex items-center gap-2"><CalendarClock className="size-4" /> Vigente desde {date(budget.vigenteDesde)} por {budget.vigenciaDias} días</span><span>Plazo: {budget.plazoDias} días</span><span>Costo previsto: {money(budget.costoPrevisto)}</span></div>
        {budget.renglones.length > 0 && <ul className="mt-4 divide-y divide-line rounded-xl border border-line">{budget.renglones.map((line, index) => <li key={line.id ?? `${line.elemento}-${index}`} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[1fr_auto_auto]"><span className="font-semibold text-ink">{ELEMENT_LABELS[line.elemento]}{line.etapaId ? ` · ${stageNames.get(line.etapaId) ?? 'Etapa no disponible'}` : ''}</span><span className="text-ink-soft">{line.cantidad} · unidad {line.unidadId}</span><span className="font-bold text-ink">{money(line.precio)}</span></li>)}</ul>}
        {approvedBase && <p className="mt-4 text-sm font-semibold text-ink-soft">Base aprobada: solo lectura.</p>}
        {budget.estado === 'PREPARADO' && expired && <p className="mt-4 text-sm font-semibold text-danger">Vencida: revalidá primero.</p>}
        {budget.estado === 'PREPARADO' && !expired && preparedByCurrentUser && <p className="mt-4 text-sm font-semibold text-ink-soft">La persona que preparó esta versión no puede aprobarla.</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {budget.estado === 'BORRADOR' && <Button size="sm" onClick={() => action.mutate({ budgetId: budget.id, action: 'preparar' })} loading={action.isPending}>Preparar</Button>}
          {budget.estado === 'PREPARADO' && !preparedByCurrentUser && <Button size="sm" onClick={() => action.mutate({ budgetId: budget.id, action: 'aprobar' })} disabled={expired || action.isPending}>Aprobar</Button>}
          {budget.estado === 'PREPARADO' && <Button size="sm" variant="secondary" onClick={() => action.mutate({ budgetId: budget.id, action: 'rechazar' })} disabled={action.isPending}>Rechazar</Button>}
          {(budget.estado === 'VENCIDO' || (budget.estado === 'PREPARADO' && expired)) && <Button size="sm" variant="secondary" onClick={() => action.mutate({ budgetId: budget.id, action: 'revalidar' })} loading={action.isPending}><RefreshCw className="size-4" /> Revalidar</Button>}
        </div>
      </article>;
    })}</div>
    {action.isError && <p role="alert" className="mt-4 text-sm font-semibold text-danger">{apiErrorMessage(action.error)}</p>}
  </section>;
}
