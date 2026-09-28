import { Plus } from 'lucide-react';
import { EMAIL_CONTACTO, EMAIL_URL } from '../contacto';

/**
 * Las dudas que frenan a alguien antes de escribir. Con una venta por
 * conversación, la duda que no se responde acá es la charla que no pasa.
 */
const PREGUNTAS = [
  {
    pregunta: '¿Cuánto cuesta?',
    respuesta:
      'Depende de cuántos productos tengas y de si hay que adaptar algo para tu rubro. Lo vemos en la charla y te pasamos el precio antes de empezar, sin compromiso.',
  },
  {
    pregunta: '¿Tengo que dejar mi Excel?',
    respuesta:
      'No de un día para el otro. Partimos de la planilla que ya usás, y todo lo que calcula CosteAR se puede descargar en Excel cuando quieras.',
  },
  {
    pregunta: '¿Sirve para mi rubro?',
    respuesta:
      'CosteAR se adapta por rubro: las palabras, los datos que se cargan y los avisos cambian según lo que fabricás. Si al tuyo le falta algo, lo hablamos y lo adaptamos.',
  },
  {
    pregunta: '¿Tengo que saber de costos?',
    respuesta:
      'No. Vos ves cuánto te cuesta cada producto, cuánto te deja y a cuánto venderlo. Las cuentas las hace el sistema, con el método de la facultad.',
  },
  {
    pregunta: '¿Quién ve mis números?',
    respuesta:
      'Solo tu cuenta. Cada negocio está separado de los demás en la base de datos, las contraseñas se guardan cifradas y cada cambio queda registrado.',
  },
];

export function PreguntasSection() {
  return (
    <section id="preguntas" aria-labelledby="titulo-preguntas" className="bg-surface py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 id="titulo-preguntas" className="text-4xl font-medium leading-tight tracking-[-0.03em] text-granate-deep">
            Lo que nos preguntan antes de escribirnos
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            ¿Otra duda? Escribinos a{' '}
            <a href={EMAIL_URL} className="text-granate underline decoration-granate/30 underline-offset-4 hover:decoration-granate">
              {EMAIL_CONTACTO}
            </a>
            .
          </p>
        </div>
        <div className="space-y-3 md:col-span-8">
          {PREGUNTAS.map((p) => (
            <details key={p.pregunta} className="group rounded-2xl border border-line bg-surface-alt px-6 open:bg-surface open:sombra-suave">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium text-ink [&::-webkit-details-marker]:hidden">
                {p.pregunta}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-granate transition-transform group-open:rotate-45 group-open:bg-granate group-open:text-surface">
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-prose pb-6 text-base leading-relaxed text-ink-soft">{p.respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
