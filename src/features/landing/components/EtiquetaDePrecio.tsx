import { Sticker } from './Sticker';
import { calcularEjemplo, enPesos } from '../demo-margen';

/**
 * La etiqueta colgante del hero. Los precios viejos quedan debajo, como
 * quedan en cualquier góndola argentina; el de arriba es el que CosteAR
 * calcula. Es decorativa: los precios son de ejemplo y el lector de pantalla
 * recibe solo la idea.
 */
export function EtiquetaDePrecio() {
  return (
    <div className="etiqueta-colgante relative mx-auto w-80 sm:w-96" role="img" aria-label="Una etiqueta de precio con varios stickers viejos encimados y, arriba de todo, el precio calculado por CosteAR">
      <svg aria-hidden="true" viewBox="0 0 120 80" className="absolute -top-16 left-1/2 h-20 w-28 -translate-x-1/2 text-line-strong">
        <path d="M60 78 C 58 50, 40 30, 20 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <div className="relative rounded-lg border border-line-strong bg-surface px-7 pb-8 pt-9 shadow-[0_24px_48px_-24px_color-mix(in_srgb,var(--color-granate-deep)_45%,transparent)]">
        <span aria-hidden="true" className="absolute left-1/2 top-3 size-3 -translate-x-1/2 rounded-full border border-line-strong bg-surface-alt" />
        <p className="text-sm text-ink-soft">Estantería metálica, 5 estantes</p>

        <div className="relative mt-6 h-52">
          <Sticker tono="viejo" giro={-6} className="absolute left-1 top-0 text-3xl">
            $ 72.500
          </Sticker>
          <Sticker tono="viejo" giro={3} className="absolute left-6 top-10 text-3xl">
            $ 79.900
          </Sticker>
          <Sticker tono="viejo" giro={-2} className="absolute left-2 top-20 text-3xl">
            {enPesos(calcularEjemplo(0).precioDeVenta)}
          </Sticker>
          <Sticker tono="nuevo" giro={2} estampar className="absolute left-4 top-[7.5rem] text-4xl sm:text-5xl">
            {enPesos(calcularEjemplo(0.1).precioSugerido)}
          </Sticker>
        </div>

        <p className="mt-4 text-xs text-ink-soft">
          El último lo calculó CosteAR. Precios de ejemplo.
        </p>
      </div>
    </div>
  );
}
