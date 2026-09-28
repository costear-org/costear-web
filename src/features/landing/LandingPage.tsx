import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { AccessGateModal } from './AccessGateModal';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DosErroresSection } from './components/DosErroresSection';
import { RemarcadoraSection } from './components/RemarcadoraSection';
import { EcuacionSection } from './components/EcuacionSection';
import { RespaldoSection } from './components/RespaldoSection';
import { PreguntasFrecuentesSection } from './components/PreguntasFrecuentesSection';
import { CierreSection } from './components/CierreSection';
import { FooterSection } from './components/FooterSection';

/**
 * La landing tiene un solo objetivo: que la persona nos escriba. Todo lo
 * demás está ordenado para llevarla ahí: la promesa, el problema, probarlo,
 * cómo funciona, por qué creerle, las dudas que frenan y el cierre. El
 * lenguaje visual es la remarcadora de precios.
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
      <Navbar onAccessClick={handleAccessClick} />
      <main>
        <HeroSection />
        <DosErroresSection />
        <RemarcadoraSection />
        <EcuacionSection />
        <RespaldoSection />
        <PreguntasFrecuentesSection />
        <CierreSection />
      </main>
      <FooterSection onAccessClick={handleAccessClick} />

      {showGate && (
        <AccessGateModal
          onClose={() => setShowGate(false)}
          onSuccess={() => navigate({ to: '/login' })}
        />
      )}
    </div>
  );
}
