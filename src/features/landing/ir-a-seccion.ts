import type { MouseEvent } from 'react';

/**
 * Lleva a una sección de la landing con scroll suave, sin agregar `#seccion`
 * a la dirección. El link conserva su `href` para que funcione con teclado,
 * lectores de pantalla y "abrir en otra pestaña".
 */
export function irASeccion(evento: MouseEvent<HTMLAnchorElement>, selector: string) {
  const destino = document.querySelector(selector);
  if (!destino) return;
  evento.preventDefault();
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  destino.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
}
