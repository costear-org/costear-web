import { Plus } from 'lucide-react';

/**
 * Las dudas que frenan a alguien antes de escribir. Con una venta por
 * conversación, la ansiedad que no se responde acá es la charla que no pasa.
 * Cada respuesta describe algo que existe hoy o dice que se define hablando.
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
      'Solo tu cuenta. Cada negocio está separado de los demás en la base de datos, las contraseñas se guardan cifradas, podés entrar con verificación en dos pasos y cada cambio queda registrado con quién lo hizo y cuándo.',
  },
];

export function PreguntasFrecuentesSection() {
  return (
    <section aria-labelledby="titulo-preguntas" className="border-t border-line bg-surface-alt py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-12 md:gap-16">
        <h2 id="titulo-preguntas" className="text-3xl font-extrabold leading-tight tracking-tight text-granate-deep sm:text-4xl md:col-span-4">
          Lo que nos preguntan antes de escribirnos
        </h2>
        <div className="md:col-span-8">
          {PREGUNTAS.map((p) => (
            <details key={p.pregunta} className="group border-b border-line-strong first:border-t">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-xl font-bold text-ink [&::-webkit-details-marker]:hidden">
                {p.pregunta}
                <Plus aria-hidden="true" className="size-5 shrink-0 text-granate transition-transform group-open:rotate-45" />
              </summary>
              <p className="max-w-prose pb-7 text-lg leading-relaxed text-ink-soft">{p.respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
