/**
 * Cómo lo sabe, escrito como una cuenta: lo que cargás una vez, más lo que
 * entra solo, da el precio. El signo es el diagrama.
 */
const TERMINOS = [
  {
    nombre: 'Tus costos',
    detalle: 'Materiales, mano de obra y gastos de fábrica de cada producto. Se cargan una sola vez.',
  },
  {
    nombre: 'El dólar y la inflación',
    detalle: 'El dólar oficial del BCRA y la inflación del INDEC entran solos. Paritarias y tarifas, cuando salen.',
  },
  {
    nombre: 'Tu precio',
    detalle: 'El que mantiene tu margen, y un email cuando un producto baja del margen que elegiste.',
  },
];

const SIGNOS = ['+', '='];

export function EcuacionSection() {
  return (
    <section aria-labelledby="titulo-ecuacion" className="bg-granate-deep py-20 text-surface md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="titulo-ecuacion" className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          La cuenta que CosteAR hace por vos, cada vez que algo cambia.
        </h2>

        <div className="mt-16 flex flex-col gap-6 md:flex-row md:items-start md:gap-4">
          {TERMINOS.map((t, i) => (
            <div key={t.nombre} className="contents">
              <div className="md:flex-1">
                <p className={i === TERMINOS.length - 1 ? 'text-3xl font-extrabold text-surface' : 'text-3xl font-extrabold text-surface/85'}>
                  {t.nombre}
                </p>
                <p className="mt-3 max-w-xs text-base leading-relaxed text-surface/70">{t.detalle}</p>
              </div>
              {i < SIGNOS.length && (
                <span aria-hidden="true" className="font-mono text-5xl font-light leading-none text-surface/40 md:px-4">
                  {SIGNOS[i]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
