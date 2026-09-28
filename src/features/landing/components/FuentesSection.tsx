import { Icono, type NombreIcono } from './Icono';

/**
 * Donde otras landings ponen logos de clientes, acá van las fuentes reales
 * con las que trabaja CosteAR. No son socios: son de dónde salen los datos y
 * el método, y así se dice.
 */
const FUENTES: { icono: NombreIcono; titulo: string; detalle: string }[] = [
  { icono: 'flecha', titulo: 'Dólar oficial', detalle: 'Banco Central (BCRA)' },
  { icono: 'balanza', titulo: 'Inflación', detalle: 'INDEC' },
  { icono: 'capas', titulo: 'Costos I y Costos II', detalle: 'Universidad Nacional de Tucumán' },
  { icono: 'planilla', titulo: 'Tus planillas', detalle: 'Entran y salen en Excel' },
];

export function FuentesSection() {
  return (
    <section aria-label="De dónde salen los datos" className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-center text-sm text-ink-soft">Trabaja con datos oficiales y con el método que se enseña en la facultad</p>
        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {FUENTES.map((f) => (
            <li key={f.titulo} className="flex items-center gap-3">
              <Icono nombre={f.icono} className="size-9 shrink-0" />
              <span>
                <span className="block text-sm font-semibold text-ink">{f.titulo}</span>
                <span className="block text-xs text-ink-soft">{f.detalle}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
