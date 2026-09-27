import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import { ArrowLeft, ClipboardList, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { apiErrorMessage } from '@/lib/api';
import { useCreateWorkOrder, usePackageLexicon, useWorkOrders, useWorkOrderTemplates } from './work-order-hooks';
import { duplicateWorkOrderMessage } from './work-order-domain';

export function WorkOrdersPage() {
  const { companyId } = useParams({ from: '/companies/$companyId/ordenes-trabajo' });
  const navigate = useNavigate();
  const orders = useWorkOrders(companyId);
  const templates = useWorkOrderTemplates(companyId);
  const packageInfo = usePackageLexicon(companyId);
  const create = useCreateWorkOrder(companyId);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const lexicon = packageInfo.data?.lexicon;
  const orderName = lexicon?.OrdenTrabajo;
  const templateName = lexicon?.PlantillaOrden;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const data = new FormData(event.currentTarget);
    try {
      const order = await create.mutateAsync({
        codigo: String(data.get('codigo') ?? ''),
        descripcion: String(data.get('descripcion') ?? ''),
        cliente: String(data.get('cliente') ?? ''),
        ...(data.get('plantillaId') ? { plantillaId: String(data.get('plantillaId')) } : {}),
      });
      await navigate({ to: '/companies/$companyId/ordenes-trabajo/$orderId', params: { companyId, orderId: order.id } });
    } catch (caught) {
      if (isAxiosError(caught) && caught.response?.status === 409) {
        setError(duplicateWorkOrderMessage(orderName));
      } else {
        setError(apiErrorMessage(caught));
      }
    }
  }

  if (packageInfo.isLoading || orders.isLoading || templates.isLoading) {
    return <AppShell><p role="status" className="text-sm text-ink-soft">Cargando operación…</p></AppShell>;
  }
  if (!orderName || !templateName) {
    return <AppShell><p role="alert" className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-danger">El paquete no declaró el vocabulario necesario para esta pantalla.</p></AppShell>;
  }

  return (
    <AppShell>
      <Link to="/companies/$id" params={{ id: companyId }} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-granate"><ArrowLeft className="size-4" /> Volver al negocio</Link>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-action">Operación</p><h1 className="text-3xl font-extrabold text-granate-deep">{orderName}s</h1></div>
        <Button onClick={() => setOpen((value) => !value)}><Plus className="size-4" /> Nueva {orderName}</Button>
      </header>

      {open && (
        <form onSubmit={submit} className="mb-8 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-ink">Código<input name="codigo" required className="h-11 rounded-xl border border-line px-3 font-normal" /></label>
          <label className="grid gap-1 text-sm font-semibold text-ink">Cliente<input name="cliente" required className="h-11 rounded-xl border border-line px-3 font-normal" /></label>
          <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">Descripción<textarea name="descripcion" required className="min-h-24 rounded-xl border border-line p-3 font-normal" /></label>
          <label className="grid gap-1 text-sm font-semibold text-ink sm:col-span-2">{templateName} opcional<select name="plantillaId" className="h-11 rounded-xl border border-line bg-white px-3 font-normal"><option value="">Sin {templateName.toLocaleLowerCase('es')}</option>{templates.data?.map((template) => <option key={template.id} value={template.id}>{template.nombre}</option>)}</select></label>
          {error && <p role="alert" className="sm:col-span-2 rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</p>}
          <div className="sm:col-span-2"><Button type="submit" loading={create.isPending}>Crear {orderName}</Button></div>
        </form>
      )}

      <section className="grid gap-3">
        {orders.data?.length === 0 && <div className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-soft">Todavía no hay {orderName.toLocaleLowerCase('es')}s.</div>}
        {orders.data?.map((order) => <Link key={order.id} to="/companies/$companyId/ordenes-trabajo/$orderId" params={{ companyId, orderId: order.id }} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-granate/30"><div className="flex items-center gap-3"><span className="rounded-xl bg-granate-tenue p-2 text-granate"><ClipboardList className="size-5" /></span><div><p className="font-bold text-ink">{order.codigo} · {order.descripcion}</p><p className="text-sm text-ink-soft">{order.cliente}</p></div></div><span className="rounded-full bg-granate-tenue px-3 py-1 text-xs font-bold text-granate">{order.etiquetaEstado}</span></Link>)}
      </section>
    </AppShell>
  );
}
