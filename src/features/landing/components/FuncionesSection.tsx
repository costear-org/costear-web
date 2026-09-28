import type { ReactNode } from 'react';
import { Camera, Check, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icono, type NombreIcono } from './Icono';
import { PanelRemarcadora } from './PanelRemarcadora';

/**
 * Qué hace, en una grilla de paneles con su propia pantalla. Cada panel
 * corresponde a algo que existe hoy en la app: alertas por email, comprobantes
 * desde el portal del equipo, trazabilidad y punto de equilibrio.
 */
export function FuncionesSection() {
  return (
    <section id="funciones" aria-labelledby="titulo-funciones" className="bg-surface-alt py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="titulo-funciones" className="text-4xl font-medium leading-tight tracking-[-0.03em] text-granate-deep sm:text-5xl">
            Todo lo que necesitás para ponerle precio a lo que fabricás
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Sin planillas que se rompen ni cuentas de cabeza. Lo ves en tu idioma, no en el del contador.
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          <PanelRemarcadora />

          <Panel icono="campana" titulo="Te avisa antes de perder" texto="Elegís el margen mínimo y te llega un email cuando un producto baja de ahí." className="bg-granate-tenue">
            <AlertaDeMargen />
          </Panel>

          <Panel
            icono="celular"
            titulo="Tu equipo manda los comprobantes"
            texto="Una foto de la factura o el remito desde el celular. Vos lo aprobás antes de que entre al costo."
          >
            <div className="rounded-2xl bg-surface p-4">
              <ul className="space-y-2.5">
                <Comprobante nombre="Factura de chapa" elemento="Materia prima" estado="Pendiente" />
                <Comprobante nombre="Remito de tornillería" elemento="Materia prima" estado="Aprobado" />
              </ul>
              <div className="mt-3 flex items-center gap-2 rounded-full border border-line bg-surface-alt py-1.5 pl-4 pr-1.5 text-xs text-ink-soft">
                <span className="flex-1">Escribí una nota o adjuntá…</span>
                <span className="flex size-7 items-center justify-center rounded-full bg-granate text-surface">
                  <Camera className="size-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Panel>

          <Panel icono="capas" titulo="Cada número tiene su origen" texto="Tocás un resultado y ves de qué datos sale y de qué fecha son.">
            <div className="rounded-2xl bg-surface p-4 text-xs">
              <p className="text-ink-soft">Costo de materiales</p>
              <p className="font-mono text-xl font-semibold tabular-nums text-ink">$ 41.800</p>
              <ul className="mt-3 space-y-1.5 border-l-2 border-granate/20 pl-3 text-ink-soft">
                <li className="flex items-center gap-1.5"><Check className="size-3 text-ok" aria-hidden="true" /> Chapa, precio del 12/09</li>
                <li className="flex items-center gap-1.5"><Check className="size-3 text-ok" aria-hidden="true" /> Dólar oficial del día</li>
                <li className="flex items-center gap-1.5"><Check className="size-3 text-ok" aria-hidden="true" /> Consumo cargado por el taller</li>
              </ul>
            </div>
          </Panel>

          <Panel icono="balanza" titulo="Sabés cuánto vender para no perder" texto="El punto de equilibrio del mes y lo que falta para la ganancia que buscás.">
            <div className="rounded-2xl bg-surface p-4">
              <svg viewBox="0 0 220 90" className="h-24 w-full" aria-hidden="true">
                <path d="M10 80 L210 18" stroke="var(--color-granate)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M10 46 L210 34" stroke="var(--color-line-strong)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="4 5" />
                <circle cx="118" cy="39.5" r="6" fill="var(--color-action)" stroke="var(--color-surface)" strokeWidth="3" />
              </svg>
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-granate" /> Ventas</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-line-strong" /> Costos</span>
                <span className="font-semibold text-action">Equilibrio: 58 unidades</span>
              </div>
            </div>
          </Panel>
        </div>
        <p className="mt-6 text-center text-xs text-ink-soft">Pantallas con datos de ejemplo.</p>
      </div>
    </section>
  );
}

function Panel({
  icono,
  titulo,
  texto,
  children,
  className,
}: {
  icono: NombreIcono;
  titulo: string;
  texto: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col rounded-[1.75rem] bg-surface p-7 sombra-suave', className)}>
      <Icono nombre={icono} className="size-11" />
      <h3 className="mt-5 text-xl font-medium tracking-tight text-ink">{titulo}</h3>
      <p className="mt-2 text-base leading-relaxed text-ink-soft">{texto}</p>
      <div className="mt-6 flex-1 content-end">{children}</div>
    </div>
  );
}

/**
 * La alerta de margen de la app, redibujada para que se lea de un vistazo.
 * Replica los datos que muestra la pantalla real (severidad, mensaje, valor
 * contra umbral y fecha) con el producto de ejemplo de la página.
 */
function AlertaDeMargen() {
  const margen = 12.7;
  const umbral = 15;
  const escala = 25;
  return (
    <div className="rounded-2xl bg-surface p-5 sombra-suave">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-granate-tenue px-2.5 py-1 text-xs font-semibold text-warn">
          <span className="size-1.5 rounded-full bg-warn" aria-hidden="true" />
          Advertencia
        </span>
        <span className="text-xs text-ink-soft">Hoy, 9:12</span>
      </div>
      <p className="mt-3 text-base font-medium leading-snug text-ink">El margen de la estantería metálica bajó a 12,7 %</p>

      <div className="mt-4">
        <div className="relative h-2 rounded-full bg-surface-alt">
          <span className="absolute inset-y-0 left-0 rounded-full bg-warn" style={{ width: `${(margen / escala) * 100}%` }} />
          <span
            className="absolute -top-1 h-4 w-0.5 rounded-full bg-ink"
            style={{ left: `${(umbral / escala) * 100}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span className="font-mono font-semibold tabular-nums text-warn">12,7 % ahora</span>
          <span className="text-ink-soft">Tu mínimo: 15 %</span>
        </div>
      </div>

      <p className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-xs text-ink-soft">
        <Mail className="size-3.5" aria-hidden="true" />
        También te llegó por email
      </p>
    </div>
  );
}

/** Un envío del portal del equipo, como lo lista la app: qué es, a qué elemento va y en qué estado está. */
function Comprobante({ nombre, elemento, estado }: { nombre: string; elemento: string; estado: 'Pendiente' | 'Aprobado' }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-granate-tenue">
        <Camera className="size-4 text-granate" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-ink">{nombre}</span>
        <span className="block text-[11px] text-ink-soft">{elemento}</span>
      </span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[11px] font-semibold',
          estado === 'Aprobado' ? 'bg-surface-alt text-ok' : 'bg-granate-tenue text-warn',
        )}
      >
        {estado}
      </span>
    </li>
  );
}
