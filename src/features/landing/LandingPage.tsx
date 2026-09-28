import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { AccessGateModal } from './AccessGateModal';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FuentesSection } from './components/FuentesSection';
import { FuncionesSection } from './components/FuncionesSection';
import { PasosSection } from './components/PasosSection';
import { MetodoSection } from './components/MetodoSection';
import { PreguntasSection } from './components/PreguntasSection';
import { CierreSection } from './components/CierreSection';
import { FooterSection } from './components/FooterSection';

/**
 * La landing tiene un objetivo: que la persona nos escriba. El producto se
 * muestra con sus propias pantallas (datos de ejemplo, marcados como tales),
 * el respaldo son resultados verificables y las dudas que frenan una venta
 * por conversación se responden antes del cierre.
 */
export function LandingPage() {
  const { accessToken, user } = useAuthStore();
  const navigate = useNavigate();
  const [showGate, setShowGate] = useState(false);

  const handleAccessClick = () => {
    if (accessToken) {
      navigate({ to: user?.role === 'EMPRESA_OPERATOR' ? '/portal' : '/dashboard' });
    } else {
      setShowGate(true);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-ink antialiased selection:bg-granate selection:text-surface">
      {/* Al body: la app vive dentro de un contenedor animado con transform (main.tsx),
          y un transform en un ancestro hace que position: fixed deje de fijarse a la ventana. */}
      {createPortal(<Navbar onAccessClick={handleAccessClick} />, document.body)}
      <main>
        <HeroSection />
        <FuentesSection />
        <FuncionesSection />
        <PasosSection />
        <MetodoSection />
        <PreguntasSection />
        <CierreSection />
      </main>
      <FooterSection onAccessClick={handleAccessClick} />

      {showGate &&
        createPortal(
          <AccessGateModal onClose={() => setShowGate(false)} onSuccess={() => navigate({ to: '/login' })} />,
          document.body,
        )}
    </div>
  );
}
