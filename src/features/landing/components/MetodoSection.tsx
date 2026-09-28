import { Icono } from './Icono';

/**
 * Los números grandes de la página son resultados del ejercicio de la
 * cátedra que el motor del backend reproduce y verifica en cada cambio
 * (CosteAR-backend: tests/domain/cost-statement, direct-labor). No hay aval
 * ni certificación formal, y no se dice que la haya.
 */
const RESULTADOS = [
  { valor: '$ 943.250', que: 'Materia prima consumida' },
  { valor: '79,99 %', que: 'Cargas sociales sobre el sueldo' },
  { valor: '221', que: 'Días que trabaja cada operario en el año' },
];

const SEGURIDAD = [
  'Cada cuenta separada de las demás en la propia base de datos',
  'Contraseñas protegidas y verificación en dos pasos',
  'Las acciones importantes quedan registradas con quién y cuándo',
];

export function MetodoSection() {
  return (
    <section id="metodo" aria-labelledby="titulo-metodo" className="bg-surface-alt py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 md:items-end">
          <h2 id="titulo-metodo" className="text-4xl font-medium leading-tight tracking-[-0.03em] text-granate-deep sm:text-5xl">
            Las cuentas son las de la facultad
          </h2>
          <p className="text-lg leading-relaxed text-ink-soft">
            El cálculo sigue lo que se enseña en Costos I y Costos II de la Universidad Nacional de Tucumán.
            Resolvimos el ejercicio completo de la cátedra y Costear llega a los mismos resultados.
          </p>
        </div>

        <dl className="mt-16 grid gap-10 border-y border-line-strong py-12 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line-strong">
          {RESULTADOS.map((r) => (
            <div key={r.que} className="md:px-10 md:first:pl-0 md:last:pr-0">
              <dd className="font-mono text-5xl font-medium tracking-tight tabular-nums text-granate-deep lg:text-6xl">{r.valor}</dd>
              <dt className="mt-3 text-base text-ink-soft">
                {r.que}
                <span className="mt-1 block text-sm text-ok">Igual que en el ejercicio de la cátedra</span>
              </dt>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm text-ink-soft">
          La comparación se vuelve a correr sola cada vez que cambiamos el sistema.
        </p>

        <div className="mt-14 flex flex-col gap-6 rounded-[1.75rem] bg-surface p-8 sombra-suave md:flex-row md:items-center">
          <Icono nombre="escudo" className="size-14 shrink-0" />
          <div className="flex-1">
            <h3 className="text-xl font-medium tracking-tight text-ink">Tus costos son información sensible</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft md:flex-row md:flex-wrap md:gap-x-6">
              {SEGURIDAD.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-granate" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
