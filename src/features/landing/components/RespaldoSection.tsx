/**
 * Una sola prueba, bien contada. El resultado del ejercicio de Costos I que
 * el motor del backend reproduce y verifica en cada cambio
 * (CosteAR-backend, tests/domain/cost-statement.test.ts). No se habla de aval
 * ni de certificación: no existe formalmente.
 */
export function RespaldoSection() {
  return (
    <section aria-labelledby="titulo-respaldo" className="bg-surface py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-6">
          <h2 id="titulo-respaldo" className="text-3xl font-extrabold leading-tight tracking-tight text-granate-deep sm:text-5xl">
            Las cuentas son las de la facultad.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            El cálculo sigue lo que se enseña en Costos I y Costos II de la Universidad Nacional de
            Tucumán. Resolvimos el ejercicio completo de la cátedra y CosteAR llega al mismo resultado,
            peso por peso.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            Esa comparación se vuelve a correr sola cada vez que cambiamos el sistema.
          </p>
        </div>

        <figure className="self-center md:col-span-6">
          <figcaption className="text-base text-ink-soft">Materia prima consumida en el ejercicio</figcaption>
          <dl className="mt-5 border-t-2 border-granate-deep">
            <div className="flex items-baseline justify-between gap-4 border-b border-line py-5">
              <dt className="text-base text-ink-soft sm:text-lg">Resuelto en clase</dt>
              <dd className="font-mono text-2xl font-bold tabular-nums text-ink sm:text-3xl">$ 943.250</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b-2 border-granate-deep py-5">
              <dt className="text-base font-semibold text-granate sm:text-lg">Calculado por CosteAR</dt>
              <dd className="font-mono text-2xl font-bold tabular-nums text-granate sm:text-3xl">$ 943.250</dd>
            </div>
          </dl>
        </figure>
      </div>
    </section>
  );
}
