import { ArrowDown } from 'lucide-react';
import { InteractiveDotGrid } from '@/components/layout/InteractiveDotGrid';
import tableroEscritorio from '@/assets/landing/tablero-escritorio.jpg';
import tableroCelular from '@/assets/landing/tablero-celular.jpg';
import { BotonWhatsApp } from './BotonWhatsApp';
import { irASeccion } from '../ir-a-seccion';
import { cn } from '@/lib/utils';
import { Icono, type NombreIcono } from './Icono';
import { TarjetaFlotante, Telefono, VentanaNavegador } from './mockups/Dispositivos';

/**
 * Hero claro, con la grilla de puntos del login reaccionando al mouse y el
 * producto real: el tablero en escritorio y en el celular, capturados de la
 * app con datos de ejemplo. Las anotaciones explican qué es cada parte.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="hero-puntos pointer-events-none absolute inset-x-0 top-0 h-[46rem]" aria-hidden="true">
        <InteractiveDotGrid ajustarAlContenedor />
      </div>
      <div className="hero-halo pointer-events-none absolute left-1/2 top-[-12rem] h-[40rem] w-[70rem] -translate-x-1/2" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 pt-28 text-center sm:px-6 md:pt-32">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-sm text-ink-soft backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-action" aria-hidden="true" />
          Costos y precios para negocios que fabrican
        </p>
        <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-medium leading-[1.02] tracking-[-0.04em] text-granate-deep sm:text-6xl lg:text-[4.75rem]">
          Remarcá con números,{' '}
          <br className="hidden sm:block" />
          no a ojo.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Costear calcula lo que te cuesta cada producto y te dice a cuánto venderlo cuando se mueven el
          dólar y la inflación.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BotonWhatsApp />
          <a
            href="#funciones"
            onClick={(e) => irASeccion(e, '#funciones')}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-6 py-4 text-base font-medium text-ink backdrop-blur-md transition-colors hover:border-granate/40"
          >
            Ver qué hace
            <ArrowDown className="size-4" aria-hidden="true" />
          </a>
        </div>

        <p className="mt-4 text-sm text-ink-soft">Te responde una persona del equipo, sin compromiso.</p>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <VentanaNavegador
            src={tableroEscritorio}
            alt="El tablero de Costear en la computadora: dólar, inflación, costo por unidad, contribución y punto de equilibrio"
            className="relative z-0 hidden w-full sm:block"
          />
          <Telefono
            src={tableroCelular}
            alt="El tablero de Costear en el celular"
            className="relative z-10 mx-auto w-64 sm:absolute sm:-bottom-12 sm:-right-4 sm:w-48 lg:w-52 xl:-right-24"
          />

          {/* Anotaciones: explican partes reales del tablero, no agregan datos. */}
          <Anotacion
            icono="capas"
            titulo="Cada número con su origen"
            texto="Tocás un valor y ves de qué dato sale."
            className="-left-48 top-[10%]"
          />
          <Anotacion
            icono="flecha"
            titulo="Dólar e inflación oficiales"
            texto="Entran solos desde el BCRA y el INDEC."
            className="-left-48 top-[46%]"
          />
          <Anotacion
            icono="balanza"
            titulo="Lo que te deja tu negocio"
            texto="Costo, contribución y punto de equilibrio."
            className="-right-48 top-[8%]"
          />
        </div>
        <p className="relative pb-16 pt-6 text-xs text-ink-soft sm:pt-20">Capturas de Costear con datos de ejemplo.</p>
      </div>
    </section>
  );
}

function Anotacion({ icono, titulo, texto, className }: { icono: NombreIcono; titulo: string; texto: string; className?: string }) {
  return (
    <TarjetaFlotante className={cn('absolute z-20 hidden w-52 items-start gap-3 xl:flex', className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-granate-tenue">
        <Icono nombre={icono} className="size-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{titulo}</span>
        <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{texto}</span>
      </span>
    </TarjetaFlotante>
  );
}
