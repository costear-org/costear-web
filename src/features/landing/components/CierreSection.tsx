import type { CSSProperties } from 'react';
import { EMAIL_CONTACTO, EMAIL_URL } from '../contacto';
import { BotonWhatsApp } from './BotonWhatsApp';

export function CierreSection() {
  return (
    <section aria-labelledby="titulo-cierre" className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2
          id="titulo-cierre"
          className="sticker sticker-nuevo mx-auto inline-block px-6 py-5 text-3xl font-extrabold leading-tight tracking-tight sm:px-10 sm:py-7 sm:text-5xl"
          style={{ '--giro': '-1.5deg' } as CSSProperties}
        >
          ¿Cuándo fue la última vez que remarcaste con números?
        </h2>
        <p className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-ink-soft">
          Contanos qué fabricás y cómo calculás tus precios hoy. En una charla vemos si CosteAR te sirve y
          qué habría que adaptar.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <BotonWhatsApp />
          <a href={EMAIL_URL} className="text-base text-granate underline decoration-granate/30 underline-offset-4 hover:decoration-granate">
            o escribinos a {EMAIL_CONTACTO}
          </a>
        </div>
      </div>
    </section>
  );
}
