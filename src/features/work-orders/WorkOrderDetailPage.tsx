import { useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeft, FileText, ListChecks, PackageCheck } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { apiErrorMessage } from '@/lib/api';
import { usePackageLexicon, useTransitionWorkOrder, useWorkOrder, useWorkOrderStages, type WorkOrderState } from './work-order-hooks';
import { nextWorkOrderState } from './work-order-domain';
import { PresupuestosPanel } from './PresupuestosPanel';

const LABELS: Record<WorkOrderState, string> = { BORRADOR: 'Borrador', COTIZADA: 'Cotizada', APROBADA: 'Aprobada', EN_PRODUCCION: 'En producción', TERMINADA_TECNICA: 'Terminada técnicamente', PENDIENTE_CIERRE: 'Pendiente de cierre', CERRADA: 'Cerrada', CANCELADA: 'Cancelada' };

export function WorkOrderDetailPage() {
  const [activeTab, setActiveTab] = useState<'stages' | 'budget'>('stages');
  const { companyId, orderId } = useParams({ from: '/companies/$companyId/ordenes-trabajo/$orderId' });
  const order = useWorkOrder(orderId);
  const stages = useWorkOrderStages(orderId);
  const packageInfo = usePackageLexicon(companyId);
  const transition = useTransitionWorkOrder(orderId, companyId);
  const orderName = packageInfo.data?.lexicon.OrdenTrabajo;
  const stageName = packageInfo.data?.lexicon.EtapaOrden;
  const additionalName = packageInfo.data?.lexicon.VersionPresupuesto;
  const next = order.data ? nextWorkOrderState(order.data.estado) : undefined;
  const canCancel = order.data && !['CERRADA', 'CANCELADA'].includes(order.data.estado);

  if (order.isLoading || stages.isLoading || packageInfo.isLoading) return <AppShell><p role="status">Cargando detalle…</p></AppShell>;
  if (!orderName || !stageName || !additionalName) return <AppShell><p role="alert" className="text-danger">El paquete no declaró el vocabulario necesario para esta pantalla.</p></AppShell>;
  if (order.isError || stages.isError) return <AppShell><p role="alert" className="text-danger">{apiErrorMessage(order.error ?? stages.error)}</p></AppShell>;

  return (
    <AppShell>
      <Link to="/companies/$companyId/ordenes-trabajo" params={{ companyId }} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-granate"><ArrowLeft className="size-4" /> Volver a {orderName.toLocaleLowerCase('es')}s</Link>
      <header className="mb-7 rounded-2xl border border-line bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold text-action">{orderName} {order.data?.codigo}</p><h1 className="mt-1 text-3xl font-extrabold text-granate-deep">{order.data?.descripcion}</h1><p className="mt-2 text-ink-soft">Cliente: {order.data?.cliente}</p></div><span className="rounded-full bg-granate-tenue px-4 py-2 text-sm font-bold text-granate">{order.data?.etiquetaEstado}</span></div>
        <div className="mt-5 flex flex-wrap gap-3">{next && <Button onClick={() => transition.mutate(next)} loading={transition.isPending}>Pasar a {LABELS[next]}</Button>}{canCancel && <Button variant="secondary" onClick={() => transition.mutate('CANCELADA')} disabled={transition.isPending}>Cancelar {orderName.toLocaleLowerCase('es')}</Button>}</div>
        {transition.isError && <p role="alert" className="mt-4 text-sm font-semibold text-danger">{apiErrorMessage(transition.error)}</p>}
      </header>
      <div role="tablist" aria-label={`Detalle de ${orderName.toLocaleLowerCase('es')}`} className="mb-5 flex gap-2 border-b border-line">
        <button role="tab" aria-selected={activeTab === 'stages'} onClick={() => setActiveTab('stages')} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${activeTab === 'stages' ? 'border-granate text-granate' : 'border-transparent text-ink-soft'}`}><ListChecks className="size-4" /> {stageName}s</button>
        <button role="tab" aria-selected={activeTab === 'budget'} onClick={() => setActiveTab('budget')} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${activeTab === 'budget' ? 'border-granate text-granate' : 'border-transparent text-ink-soft'}`}><FileText className="size-4" /> Presupuesto</button>
      </div>
      {activeTab === 'stages' ? <section><h2 className="mb-4 text-xl font-bold text-granate-deep">{stageName}s</h2><ol className="grid gap-3">{stages.data?.map((stage) => <li key={stage.id} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4"><span className="flex size-9 items-center justify-center rounded-full bg-granate text-sm font-bold text-white">{stage.orden}</span><span className="font-semibold text-ink">{stage.nombre}</span>{stage.esEntrega && <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><PackageCheck className="size-4" /> Entrega</span>}</li>)}</ol></section> : <PresupuestosPanel orderId={orderId} stages={stages.data ?? []} additionalName={additionalName} />}
    </AppShell>
  );
}
