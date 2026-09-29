import { useState, type FormEvent } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import { ArrowDownToLine, ArrowLeft, ArrowUpFromLine, Boxes, Warehouse } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useCompanies } from '@/features/companies/company-hooks';
import {
  usePackageLexicon,
  useWorkOrders,
} from '@/features/work-orders/work-order-hooks';
import { apiErrorMessage } from '@/lib/api';
import {
  useArticles,
  useRegisterInventoryMovement,
  type InventoryMovementInput,
} from './inventory-hooks';

const number = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });
type MovementMode = InventoryMovementInput['tipo'];

function fieldClass() {
  return 'h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-granate focus:outline-none focus:ring-[3px] focus:ring-granate/15';
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}{children}</label>;
}

export function InventoryWorkspace({ companyId }: { companyId: string }) {
  const articles = useArticles(companyId);
  const orders = useWorkOrders(companyId);
  const packageInfo = usePackageLexicon(companyId);
  const registerMovement = useRegisterInventoryMovement(companyId);
  const [mode, setMode] = useState<MovementMode | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success'; message: string } | null>(null);
  const depositName = packageInfo.data?.lexicon.Deposito;
  const orderName = packageInfo.data?.lexicon.OrdenTrabajo;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mode) return;
    setFeedback(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const articuloId = String(data.get('articuloId') ?? '');
    const cantidad = Number(data.get('cantidad'));
    const fecha = String(data.get('fecha') ?? '');
    const month = String(data.get('periodo') ?? '');
    const ordenId = String(data.get('ordenId') ?? '');

    if (!articuloId || !Number.isFinite(cantidad) || cantidad <= 0 || !fecha || !/^\d{4}-\d{2}$/.test(month)) {
      setFeedback({ kind: 'error', message: 'Completá artículo, cantidad, fecha y mes antes de guardar.' });
      return;
    }
    if (mode === 'SALIDA' && !ordenId) {
      setFeedback({ kind: 'error', message: `Elegí una ${orderName ?? 'orden de trabajo'} para registrar la salida.` });
      return;
    }

    const input: InventoryMovementInput = {
      articuloId,
      tipo: mode,
      cantidad,
      fecha,
      periodoImputado: `${month}-01`,
      ...(ordenId ? { ordenId } : {}),
    };
    const documento = String(data.get('documento') ?? '').trim();
    if (documento) input.documento = documento;
    if (mode === 'INGRESO') {
      const costoUnitario = Number(data.get('costoUnitario'));
      const gastosCompra = Number(data.get('gastosCompra') || 0);
      if (!Number.isFinite(costoUnitario) || costoUnitario < 0 || !Number.isFinite(gastosCompra) || gastosCompra < 0) {
        setFeedback({ kind: 'error', message: 'El costo unitario y los gastos de compra no pueden ser negativos.' });
        return;
      }
      input.costoUnitario = costoUnitario;
      input.gastosCompra = gastosCompra;
    }

    try {
      await registerMovement.mutateAsync(input);
      form.reset();
      setFeedback({
        kind: 'success',
        message: mode === 'INGRESO' ? 'Ingreso registrado.' : `Salida asignada a la ${orderName?.toLocaleLowerCase('es') ?? 'orden de trabajo'}.`,
      });
    } catch (error) {
      setFeedback({ kind: 'error', message: apiErrorMessage(error) });
    }
  }

  if (packageInfo.isLoading || articles.isLoading || orders.isLoading) {
    return <p role="status" className="rounded-2xl border border-line bg-white p-6 text-sm text-ink-soft">Cargando inventario…</p>;
  }
  if (!depositName || !orderName) {
    return <p role="alert" className="rounded-2xl border border-danger/20 bg-danger/5 p-5 font-semibold text-danger">El paquete no declaró los nombres necesarios para esta pantalla.</p>;
  }
  if (articles.isError) {
    const forbidden = isAxiosError(articles.error) && articles.error.response?.status === 403;
    return <p role="alert" className="rounded-2xl border border-danger/20 bg-danger/5 p-5 font-semibold text-danger">{forbidden ? 'No tenés permiso para ver el inventario ni sus valores.' : apiErrorMessage(articles.error)}</p>;
  }
  if (orders.isError) {
    return <p role="alert" className="rounded-2xl border border-danger/20 bg-danger/5 p-5 font-semibold text-danger">No pudimos cargar las {orderName.toLocaleLowerCase('es')}s: {apiErrorMessage(orders.error)}</p>;
  }

  return (
    <div>
      <Link to="/companies/$id" params={{ id: companyId }} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-granate"><ArrowLeft className="size-4" /> Volver al negocio</Link>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-action">Inventario</p>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-granate-deep"><Warehouse className="size-8" /> {depositName}</h1>
          <p className="mt-1 text-sm text-ink-soft">Saldo y costo promedio informado por el sistema, artículo por artículo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={mode === 'INGRESO' ? 'primary' : 'secondary'} onClick={() => { setMode('INGRESO'); setFeedback(null); }}><ArrowDownToLine className="size-4" /> Registrar ingreso</Button>
          <Button type="button" variant={mode === 'SALIDA' ? 'primary' : 'secondary'} onClick={() => { setMode('SALIDA'); setFeedback(null); }}><ArrowUpFromLine className="size-4" /> Registrar salida</Button>
        </div>
      </header>

      {mode && (
        <form key={mode} aria-label={mode === 'INGRESO' ? 'Registrar ingreso' : 'Registrar salida'} onSubmit={submit} className="mb-8 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Artículo">
            <select name="articuloId" aria-label="Artículo" required className={fieldClass()} defaultValue=""><option value="" disabled>Elegí un artículo</option>{articles.data?.map((article) => <option key={article.id} value={article.id}>{article.codigo} · {article.descripcion}</option>)}</select>
          </FormField>
          {mode === 'SALIDA' && (
            <FormField label={orderName}>
              <select name="ordenId" aria-label={orderName} required className={fieldClass()} defaultValue=""><option value="" disabled>Elegí una {orderName.toLocaleLowerCase('es')}</option>{orders.data?.map((order) => <option key={order.id} value={order.id}>{order.codigo} · {order.descripcion}</option>)}</select>
            </FormField>
          )}
          <FormField label="Cantidad"><input name="cantidad" aria-label="Cantidad" required type="number" min="0" step="any" className={fieldClass()} /></FormField>
          {mode === 'INGRESO' && <FormField label="Costo por unidad"><input name="costoUnitario" aria-label="Costo por unidad" required type="number" min="0" step="any" className={fieldClass()} /></FormField>}
          {mode === 'INGRESO' && <FormField label="Gastos de compra"><input name="gastosCompra" aria-label="Gastos de compra" type="number" min="0" step="any" defaultValue="0" className={fieldClass()} /></FormField>}
          <FormField label="Fecha"><input name="fecha" aria-label="Fecha" required type="date" className={fieldClass()} /></FormField>
          <FormField label="Mes al que corresponde"><input name="periodo" aria-label="Mes al que corresponde" required type="month" className={fieldClass()} /></FormField>
          <FormField label="Comprobante o referencia"><input name="documento" aria-label="Comprobante o referencia" maxLength={300} className={fieldClass()} /></FormField>
          {feedback && <p role={feedback.kind === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm font-semibold sm:col-span-2 lg:col-span-3 ${feedback.kind === 'error' ? 'bg-danger/10 text-danger' : 'bg-ok/10 text-ok'}`}>{feedback.message}</p>}
          <div className="sm:col-span-2 lg:col-span-3"><Button type="submit" loading={registerMovement.isPending}>Guardar {mode === 'INGRESO' ? 'ingreso' : 'salida'}</Button></div>
        </form>
      )}

      <section aria-labelledby="articles-title">
        <h2 id="articles-title" className="mb-3 flex items-center gap-2 text-lg font-extrabold text-granate-deep"><Boxes className="size-5" /> Artículos</h2>
        {articles.data?.length === 0 ? <div className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-soft">Todavía no hay artículos en inventario.</div> : (
          <div className="grid gap-3 md:grid-cols-2">
            {articles.data?.map((article) => (
              <article key={article.id} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-action">{article.codigo}</p><h3 className="font-bold text-ink">{article.descripcion}</h3></div><span className="rounded-full bg-granate-tenue px-3 py-1 text-sm font-extrabold text-granate">{number.format(article.saldoCantidad)} {article.unidad.simbolo}</span></div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-surface-alt p-3"><dt className="text-xs text-ink-soft">Costo promedio</dt><dd className="mt-1 font-mono font-bold text-ink">PPP {number.format(article.ppp)}</dd><dd className="text-[10px] text-ink-soft">Moneda no informada</dd></div><div className="rounded-xl bg-surface-alt p-3"><dt className="text-xs text-ink-soft">Valor del saldo</dt><dd className="mt-1 font-mono font-bold text-ink">{number.format(article.saldoValor)}</dd><dd className="text-[10px] text-ink-soft">Moneda no informada</dd></div></dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function InventoryPage() {
  const { companyId } = useSearch({ from: '/inventario' });
  const companies = useCompanies();
  const resolvedCompanyId = companyId || (companies.data?.length === 1 ? companies.data[0]?.id : undefined);

  return (
    <AppShell>
      {resolvedCompanyId ? <InventoryWorkspace companyId={resolvedCompanyId} /> : companies.isLoading ? (
        <p role="status" className="text-sm text-ink-soft">Buscando el negocio…</p>
      ) : companies.data?.length === 0 ? (
        <p role="alert" className="rounded-2xl border border-line bg-white p-6 text-ink">Necesitás crear un negocio antes de usar inventario.</p>
      ) : (
        <section><h1 className="text-2xl font-extrabold text-granate-deep">Elegí un negocio</h1><div className="mt-4 grid gap-3">{companies.data?.map((company) => <Link key={company.id} to="/inventario" search={{ companyId: company.id }} className="rounded-2xl border border-line bg-white p-4 font-bold text-ink hover:border-granate/30 hover:text-granate">{company.name}</Link>)}</div></section>
      )}
    </AppShell>
  );
}
