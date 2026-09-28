import { BotonWhatsApp } from './BotonWhatsApp';
import { EtiquetaDePrecio } from './EtiquetaDePrecio';

/**
 * Una idea, una imagen, una acción. Lo demás de la página existe para quien
 * sigue bajando, no para competir con esto.
 */
export function HeroSection() {
  return (
    <section className="bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pb-20 pt-10 sm:px-6 md:grid-cols-12 md:pb-28 md:pt-20">
        <div className="md:col-span-7">
          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight text-granate-deep sm:text-6xl lg:text-7xl">
            Remarcá con números, no a ojo.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-soft sm:text-xl">
            CosteAR te dice cuánto subir cada precio cuando se mueven el dólar y la inflación, antes de
            que pierdas margen.
          </p>
          <div className="mt-10">
            <BotonWhatsApp />
            <p className="mt-4 text-sm text-ink-soft">Te responde el equipo de CosteAR, desde Tucumán.</p>
          </div>
        </div>
        <div className="pt-12 md:col-span-5 md:pt-0">
          <EtiquetaDePrecio />
        </div>
      </div>
    </section>
  );
}
