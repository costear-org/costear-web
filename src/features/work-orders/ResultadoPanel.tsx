import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Camera, CheckCircle2, LockKeyhole, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiErrorMessage } from '@/lib/api';
import {
  useCloseWorkOrder,
  useReopenWorkOrder,
  useWorkOrderClosurePhotos,
  useWorkOrderDeviationReport,
  type DeviationElement,
  type DeviationSense,
  type WorkOrderState,
} from './work-order-hooks';

const ELEMENT_LABELS: Record<DeviationElement, string> = {
  MP: 'Materiales',
  MOD: 'Mano de obra',
  CIF: 'Costos indirectos',
  ENTREGA: 'Entrega',
};
const CAUSE_LABELS = {
  PRECIO: 'Precio',
  CANTIDAD: 'Cantidad',
  EFICIENCIA: 'Eficiencia',
  ALCANCE: 'Alcance',
  ASIGNACION: 'Asignación',
} as const;
const PENDING_LABELS: Record<string, string> = {
  PARTE_HORAS: 'Hay horas sin aprobar.',
  FACTURA_O_COSTO: 'Hay facturas o costos pendientes de revisión.',
  CONTINGENCIA: 'Hay partidas pendientes de revisión.',
  CAMBIO_PRESUPUESTO: 'Hay cambios de presupuesto sin resolver.',
};
const number = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' });

function amount(value: number) {
  return number.format(value);
}

function isForbidden(error: unknown) {
  return isAxiosError(error) && error.response?.status === 403;
}

function pendingLabels(error: unknown): string[] {
  if (!isAxiosError(error)) return [];
  const details = (error.response?.data as { error?: { details?: { pendientes?: unknown } } } | undefined)?.error?.details;
  if (!Array.isArray(details?.pendientes)) return [];
  return [...new Set(details.pendientes.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('tipo' in item) || typeof item.tipo !== 'string') return [];
    return [PENDING_LABELS[item.tipo] ?? 'Hay una carga pendiente de resolver.'];
  }))];
}

function SenseBadge({ sense }: { sense: DeviationSense }) {
  const favorable = sense === 'FAVORABLE';
  const neutral = sense === 'NEUTRA';
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${neutral ? 'bg-surface-alt text-ink-soft' : favorable ? 'bg-ok/10 text-ok' : 'bg-danger/10 text-danger'}`}>
    {favorable ? <TrendingDown className="size-3.5" /> : !neutral ? <TrendingUp className="size-3.5" /> : null}
    {sense}
  </span>;
}

export function ResultadoPanel({
  orderId,
  companyId,
  orderName,
  orderState,
}: {
  orderId: string;
  companyId: string;
  orderName: string;
  orderState: WorkOrderState;
}) {
  const report = useWorkOrderDeviationReport(orderId);
  const photos = useWorkOrderClosurePhotos(orderId);
  const closeOrder = useCloseWorkOrder(orderId, companyId);
  const reopenOrder = useReopenWorkOrder(orderId, companyId);
  const [closeError, setCloseError] = useState<unknown>();
  const [reopenError, setReopenError] = useState<string>();
  const lowerOrderName = orderName.toLocaleLowerCase('es');
  const reportForbidden = report.isError && isForbidden(report.error);
  const marginsVisible = report.data?.margenEsperado !== undefined && report.data?.margenReal !== undefined;

  async function close() {
    setCloseError(undefined);
    try {
      await closeOrder.mutateAsync();
    } catch (error) {
      setCloseError(error);
    }
  }

  async function reopen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReopenError(undefined);
    const form = event.currentTarget;
    const motivo = String(new FormData(form).get('motivo') ?? '').trim();
    if (!motivo) {
      setReopenError(`Explicá por qué necesitás reabrir la ${lowerOrderName}.`);
      return;
    }
    try {
      await reopenOrder.mutateAsync(motivo);
      form.reset();
    } catch (error) {
      setReopenError(apiErrorMessage(error));
    }
  }

  const pending = pendingLabels(closeError);

  return <section aria-labelledby="result-title" className="grid gap-6">
    <div>
      <h2 id="result-title" className="text-xl font-extrabold text-granate-deep">Resultado de la {lowerOrderName}</h2>
      <p className="mt-1 text-sm text-ink-soft">Presupuesto, costo real y causas informadas por el sistema.</p>
    </div>

    {report.isLoading && <p role="status" className="rounded-2xl border border-line bg-white p-5 text-ink-soft">Cargando resultado…</p>}
    {reportForbidden && <p role="alert" className="rounded-2xl border border-danger/20 bg-danger/5 p-5 font-semibold text-danger"><LockKeyhole className="mr-2 inline size-5" />No tenés permiso para ver el margen de esta {lowerOrderName}.</p>}
    {report.isError && !reportForbidden && <p role="alert" className="rounded-2xl border border-danger/20 bg-danger/5 p-5 font-semibold text-danger">No pudimos cargar el resultado: {apiErrorMessage(report.error)}</p>}

    {report.data && <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-line bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Costo presupuestado</p><p className="mt-2 text-2xl font-extrabold text-ink">{amount(report.data.costoPresupuestado)}</p><p className="text-[11px] text-ink-soft">Moneda no informada</p></article>
        <article className="rounded-2xl border border-line bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Costo real</p><p className="mt-2 text-2xl font-extrabold text-ink">{amount(report.data.costoReal)}</p><p className="text-[11px] text-ink-soft">Moneda no informada</p></article>
        {marginsVisible ? <>
          <article className="rounded-2xl border border-line bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Margen esperado</p><p className="mt-2 text-2xl font-extrabold text-granate-deep">{amount(report.data.margenEsperado!)}</p><p className="text-[11px] text-ink-soft">Moneda no informada</p></article>
          <article className="rounded-2xl border border-line bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Margen real</p><p className="mt-2 text-2xl font-extrabold text-granate-deep">{amount(report.data.margenReal!)}</p><p className="text-[11px] text-ink-soft">Moneda no informada</p></article>
        </> : <article className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:col-span-2"><p className="flex items-center gap-2 font-bold text-ink"><LockKeyhole className="size-5 text-granate" /> No tenés permiso para ver el margen</p><p className="mt-2 text-sm text-ink-soft">Los valores de precio y margen no fueron informados para tu cuenta.</p></article>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="px-5 py-4 text-left text-lg font-extrabold text-granate-deep">Presupuesto vs. real por elemento</caption>
          <thead className="border-y border-line bg-surface-alt text-xs uppercase tracking-wide text-ink-soft"><tr><th className="px-5 py-3">Elemento</th><th className="px-5 py-3 text-right">Presupuesto</th><th className="px-5 py-3 text-right">Real</th><th className="px-5 py-3 text-right">Desvío</th><th className="px-5 py-3">Lectura</th></tr></thead>
          <tbody className="divide-y divide-line">{report.data.elementos.map((item) => <tr key={item.elemento}><th className="px-5 py-4 font-bold text-ink">{ELEMENT_LABELS[item.elemento]}</th><td className="px-5 py-4 text-right font-mono text-ink">{amount(item.presupuestado)}</td><td className="px-5 py-4 text-right font-mono text-ink">{amount(item.real)}</td><td className="px-5 py-4 text-right font-mono font-bold text-ink">{amount(item.desvio)}</td><td className="px-5 py-4"><SenseBadge sense={item.sentido} /></td></tr>)}</tbody>
        </table>
        <p className="border-t border-line px-5 py-3 text-[11px] text-ink-soft">Importes en moneda no informada por el contrato.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-action">Puente del desvío</p><h3 className="mt-1 text-lg font-extrabold text-granate-deep">Qué movió el resultado</h3></div><div className="text-right"><p className="font-mono text-xl font-extrabold text-ink">{amount(report.data.desvioTotal)}</p><SenseBadge sense={report.data.sentido} /></div></div>
          <ul className="mt-4 divide-y divide-line">{report.data.puente.map((item, index) => <li key={`${item.elemento}-${item.causa}-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-bold text-ink">{CAUSE_LABELS[item.causa]}</p><p className="text-xs text-ink-soft">{ELEMENT_LABELS[item.elemento]}</p></div><div className="flex items-center gap-3"><span className="font-mono font-bold text-ink">{amount(item.importe)}</span><SenseBadge sense={item.sentido} /></div></li>)}</ul>
          <p className="mt-3 text-[11px] text-ink-soft">Importes en moneda no informada por el contrato.</p>
        </article>
        <article className="rounded-2xl border border-line bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-action">Proyección al terminar</p><dl className="mt-4 grid gap-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-ink-soft">Incurrido</dt><dd className="font-mono font-bold text-ink">{amount(report.data.proyeccionAlTerminar.incurrido)}</dd></div><div className="flex justify-between gap-4"><dt className="text-ink-soft">Comprometido</dt><dd className="font-mono font-bold text-ink">{amount(report.data.proyeccionAlTerminar.comprometido)}</dd></div><div className="flex justify-between gap-4 border-t border-line pt-3"><dt className="font-bold text-ink">Total proyectado</dt><dd className="font-mono font-extrabold text-granate-deep">{amount(report.data.proyeccionAlTerminar.total)}</dd></div><div className="flex justify-between gap-4"><dt className="text-ink-soft">Presupuesto</dt><dd className="font-mono font-bold text-ink">{amount(report.data.proyeccionAlTerminar.presupuesto)}</dd></div></dl><p className="mt-4 text-[11px] text-ink-soft">Importes en moneda no informada por el contrato.</p></article>
      </div>
    </>}

    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-extrabold text-granate-deep"><CheckCircle2 className="size-5" /> Cierre de la {lowerOrderName}</h3>
      {orderState === 'PENDIENTE_CIERRE' && <><p className="mt-2 text-sm text-ink-soft">El sistema comprobará que no queden cargas pendientes antes de guardar la foto de cierre.</p><Button className="mt-4" onClick={close} loading={closeOrder.isPending}>Cerrar {orderName}</Button></>}
      {orderState === 'CERRADA' && <form onSubmit={reopen} className="mt-4 grid gap-3"><label className="grid gap-1.5 text-sm font-bold text-ink">Motivo de reapertura<textarea name="motivo" rows={3} maxLength={500} className="rounded-xl border border-line px-3 py-2 font-normal focus:border-granate focus:outline-none focus:ring-[3px] focus:ring-granate/15" /></label><div><Button type="submit" variant="secondary" loading={reopenOrder.isPending}><RotateCcw className="size-4" /> Reabrir {orderName}</Button></div></form>}
      {!['PENDIENTE_CIERRE', 'CERRADA'].includes(orderState) && <p className="mt-2 text-sm text-ink-soft">La {lowerOrderName} debe quedar pendiente de cierre antes de cerrarla.</p>}
      {pending.length > 0 && <div role="alert" className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"><p className="font-bold">Todavía no se puede cerrar.</p><ul className="mt-2 list-disc space-y-1 pl-5">{pending.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      {Boolean(closeError) && pending.length === 0 && <p role="alert" className="mt-4 text-sm font-semibold text-danger">{apiErrorMessage(closeError)}</p>}
      {reopenError && <p role="alert" className="mt-4 text-sm font-semibold text-danger">{reopenError}</p>}
    </article>

    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-extrabold text-granate-deep"><Camera className="size-5" /> Historial de fotos de cierre</h3>
      {photos.isLoading && <p role="status" className="mt-3 text-sm text-ink-soft">Cargando historial…</p>}
      {photos.isError && <p role="alert" className="mt-3 text-sm font-semibold text-danger">No pudimos cargar el historial: {apiErrorMessage(photos.error)}</p>}
      {photos.data?.length === 0 && <p className="mt-3 text-sm text-ink-soft">Todavía no hay fotos de cierre.</p>}
      <ol className="mt-4 grid gap-3">{photos.data?.map((photo) => <li key={photo.id} className="rounded-xl border border-line bg-surface-alt p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-ink">Foto #{photo.version}</p><time className="text-xs text-ink-soft">{date.format(new Date(photo.createdAt))}</time></div><p className="mt-1 text-xs text-ink-soft">Motor {photo.versionMotor}</p>{photo.motivoReapertura && <p className="mt-2 text-sm text-ink"><span className="font-bold">Motivo de reapertura:</span> {photo.motivoReapertura}</p>}</li>)}</ol>
    </article>
  </section>;
}
