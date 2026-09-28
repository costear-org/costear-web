import { useEffect, useRef } from 'react';

/**
 * Grilla de puntos que reacciona al mouse.
 *
 * Por defecto ocupa la ventana (login y registro). Con `ajustarAlContenedor`
 * toma el tamaño de su contenedor y mide el mouse relativo al canvas, para
 * usarla dentro de una sección que scrollea, como el hero de la landing.
 */
export function InteractiveDotGrid({ ajustarAlContenedor = false }: { ajustarAlContenedor?: boolean } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const contenedor = canvas.parentElement;
      width = ajustarAlContenedor && contenedor ? contenedor.clientWidth : window.innerWidth;
      height = ajustarAlContenedor && contenedor ? contenedor.clientHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = ajustarAlContenedor ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Grid configuration
    const spacing = 32;
    const baseRadius = 1.2;
    const maxRadius = 4.0;
    const influenceRadius = 160;

    interface Dot {
      x: number;
      y: number;
      curX: number;
      curY: number;
      radius: number;
    }

    let dots: Dot[] = [];

    // Helper to generate the grid of dots
    const generateGrid = () => {
      dots = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * spacing;
          const y = r * spacing;
          dots.push({ x, y, curX: x, curY: y, radius: baseRadius });
        }
      }
    };

    generateGrid();

    // Re-generate grid when window size changes
    // Se difiere al próximo cuadro: redimensionar el canvas dentro del callback
    // puede volver a notificar al observer y WebKit lo reporta como error
    // ("ResizeObserver loop completed with undelivered notifications").
    let cuadroResize = 0;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(cuadroResize);
      cuadroResize = requestAnimationFrame(() => {
        resize();
        generateGrid();
      });
    });
    resizeObserver.observe(canvas.parentElement || document.body);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mActive = mouseRef.current.active;

      for (const dot of dots) {

        let targetX = dot.x;
        let targetY = dot.y;
        let targetRadius = baseRadius;
        let targetAlpha = 0.70;

        if (mActive) {
          const dx = mx - dot.x;
          const dy = my - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < influenceRadius) {
            const factor = 1 - dist / influenceRadius; // 1 at mouse, 0 at boundary
            
            // Push dots slightly away from mouse for 3D distortion wave effect
            const angle = Math.atan2(dy, dx);
            targetX = dot.x - Math.cos(angle) * factor * 14;
            targetY = dot.y - Math.sin(angle) * factor * 14;
            
            // Grow dots
            targetRadius = baseRadius + (maxRadius - baseRadius) * factor;
            
            // Brighten dots close to mouse
            targetAlpha = 0.70 + 0.30 * factor;
          }
        }

        // Smoothly interpolate positions and sizes for organic inertia
        dot.curX += (targetX - dot.curX) * 0.12;
        dot.curY += (targetY - dot.curY) * 0.12;
        dot.radius += (targetRadius - dot.radius) * 0.12;

        ctx.beginPath();
        ctx.arc(dot.curX, dot.curY, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 21, 27, ${targetAlpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
      cancelAnimationFrame(cuadroResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ajustarAlContenedor]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 block pointer-events-none" />;
}
