import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { OnboardingAnswers } from '@/types/telarData.types';
import { useTelarDataStore } from '@/stores/telarDataStore';
import { upsertOnboardingAnswers } from '@/services/onboarding.actions';
import { useAuthStore } from '@/stores/authStore';
import { EventBus } from '@/utils/eventBus';
import { ArtisanStepShell } from '@/components/shop/wizards/artisan-profile/ArtisanStepShell';
import { OraculoProvider } from '@/components/oraculo/OraculoContext';
import { Block1Artisan } from './Block1Artisan';
import { Block2Commercial } from './Block2Commercial';
import { Block3Clients } from './Block3Clients';
import { Block4Operations } from './Block4Operations';

const TOTAL = 4;

const STEPS = [
  {
    icon: 'self_improvement',
    title: 'Tu conocimiento artesanal',
    subtitle: 'Cuéntanos quién eres como artesano/a.',
  },
  {
    icon: 'storefront',
    title: 'Tu realidad comercial',
    subtitle: 'Sin juicios. Solo queremos entender dónde estás.',
  },
  {
    icon: 'groups',
    title: 'Clientes y mercado',
    subtitle: '¿A quién le vendes y cómo llegas a ellos?',
  },
  {
    icon: 'precision_manufacturing',
    title: 'Operaciones',
    subtitle: '¿Cómo está organizado tu trabajo hoy?',
  },
];

const AI_PANEL: Record<number, { cards: Array<{ label: string; text: string }>; next: string }> = {
  1: {
    cards: [
      { label: 'Identidad artesanal', text: 'Con tu nombre, historia y oficio construiremos el núcleo de tu perfil en TELAR.' },
      { label: 'Experiencia y diferenciación', text: 'Los años de práctica y lo que te hace único guían qué agentes asignamos a tu taller.' },
      { label: 'Raíz del aprendizaje', text: 'Entender cómo aprendiste nos ayuda a conectar tu historia con compradores que valoran la tradición.' },
    ],
    next: 'Continuaremos con tu realidad comercial: precios y rentabilidad.',
  },
  2: {
    cards: [
      { label: 'Estructura de precios', text: 'Con tu rango de precios detectamos oportunidades de posicionamiento en el marketplace.' },
      { label: 'Costos y método', text: 'Saber cómo defines precios nos permite priorizar agentes de pricing y costos.' },
      { label: 'Rentabilidad percibida', text: 'Esta señal define si priorizamos agentes de ventas o de eficiencia operativa primero.' },
    ],
    next: 'Seguiremos con tus clientes y canales de venta actuales.',
  },
  3: {
    cards: [
      { label: 'Perfil del comprador', text: 'El cliente ideal define la curación del marketplace y las categorías donde aparecerás destacado.' },
      { label: 'Presencia digital', text: 'Tu nivel de actividad online ajusta el plan de contenidos que TELAR preparará para ti.' },
      { label: 'Canales activos', text: 'Los canales que usas hoy son el punto de partida para tu estrategia multicanal.' },
    ],
    next: 'Para terminar, revisaremos cómo está estructurado tu taller.',
  },
  4: {
    cards: [
      { label: 'Capacidad productiva', text: 'El volumen mensual ayuda a TELAR a recomendar herramientas de gestión adecuadas a tu escala.' },
      { label: 'Limitación principal', text: 'Con tu freno principal priorizamos los agentes que mayor impacto pueden tener en tu crecimiento.' },
      { label: 'Objetivo en TELAR', text: 'Tu meta principal define el orden en que activamos los módulos de tu taller digital.' },
    ],
    next: 'Al finalizar, activaremos los agentes personalizados para tu taller.',
  },
};

const BLOCKS = [Block1Artisan, Block2Commercial, Block3Clients, Block4Operations];

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const userId = useAuthStore((s) => s.user?.id);
  const { setFromOnboarding, hydrateFromDB } = useTelarDataStore();

  const { control, handleSubmit } = useForm<OnboardingAnswers>({
    defaultValues: {},
  });

  const isLast = step === TOTAL;
  const meta = STEPS[step - 1];
  const aiPanel = AI_PANEL[step];
  const BlockComponent = BLOCKS[step - 1];

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleNext = () => { handleSubmit(goNext)(); };

  const handleFinalSubmit = () => {
    handleSubmit(async (answers: OnboardingAnswers) => {
      if (!userId) return;
      setSaving(true);
      try {
        setFromOnboarding(answers);
        const response = await upsertOnboardingAnswers(userId, { ...answers, source: 'onboarding' });
        hydrateFromDB(response);
        EventBus.publish('onboarding.completed', { userId });
        toast.success('¡Perfecto! Tu perfil está listo.');
        navigate('/dashboard');
      } catch {
        toast.error('Hubo un error al guardar. Intenta de nuevo.');
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <OraculoProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <ArtisanStepShell
          step={step}
          totalSteps={TOTAL}
          icon={meta.icon}
          title={meta.title}
          subtitle={meta.subtitle}
          aiCards={aiPanel.cards}
          aiNext={aiPanel.next}
          onBack={step > 1 ? goPrev : undefined}
          onNext={isLast ? undefined : handleNext}
          nextDisabled={false}
          isFinalStep={isLast}
          onSubmit={isLast ? handleFinalSubmit : undefined}
          isSubmitting={saving}
          submitLabel="Activar mi taller digital"
        >
          <BlockComponent control={control} />
        </ArtisanStepShell>
      </div>
    </OraculoProvider>
  );
}
