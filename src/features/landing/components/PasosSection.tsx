import { Icono, type NombreIcono } from './Icono';

/**
 * Cómo arranca un cliente nuevo. Es una secuencia real, por eso lleva orden.
 * El primer paso es una conversación porque así se vende hoy.
 */
const PASOS: { icono: NombreIcono; titulo: string; texto: string }[] = [
  {
    icono: 'charla',
    titulo: 'Nos contás cómo trabajás',
    texto: 'Qué fabricás, cómo calculás tus precios hoy y qué datos ya tenés. Si tu rubro necesita algo distinto, lo adaptamos.',
  },
  {
    icono: 'capas',
    titulo: 'Armamos tu estructura',
    texto: 'Productos, materiales, personal y gastos, cargados una sola vez. Si ya tenés una planilla, partimos de ahí.',
  },
  {
    icono: 'flecha',
    titulo: 'Decidís con números',
    texto: 'El dólar y la inflación entran solos. Vos mirás el tablero, recibís los avisos y ajustás precios a tiempo.',
  },
];

export function PasosSection() {
  return (
    <section id="como-empezamos" aria-labelledby="titulo-pasos" className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 id="titulo-pasos" className="text-4xl font-medium leading-tight tracking-[-0.03em] text-granate-deep sm:text-5xl">
            Empezar es una charla
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            No hay formularios ni planes para elegir. Te escuchamos y adaptamos Costear a tu negocio.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-6 md:grid-cols-3">
          <span aria-hidden="true" className="absolute left-[16%] right-[16%] top-16 hidden border-t-2 border-dashed border-granate/20 md:block" />
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="relative rounded-[1.75rem] border border-line bg-surface p-8">
              <div className="flex items-center justify-between">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-granate-tenue">
                  <Icono nombre={paso.icono} className="size-9" />
                </span>
                <span className="font-mono text-sm text-ink-soft">Paso {i + 1}</span>
              </div>
              <h3 className="mt-8 text-xl font-medium tracking-tight text-ink">{paso.titulo}</h3>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
