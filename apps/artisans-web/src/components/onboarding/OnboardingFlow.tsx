import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { OnboardingAnswers } from '@/types/telarData.types';
import { useTelarDataStore } from '@/stores/telarDataStore';
import { upsertOnboardingAnswers } from '@/services/onboarding.actions';
import { useAuthStore } from '@/stores/authStore';
import { EventBus } from '@/utils/eventBus';
import { Block1Artisan } from './Block1Artisan';
import { Block2Commercial } from './Block2Commercial';
import { Block3Clients } from './Block3Clients';
import { Block4Operations } from './Block4Operations';

const BLOCKS = [Block1Artisan, Block2Commercial, Block3Clients, Block4Operations];
const TOTAL = BLOCKS.length;

const BLOCK_LABELS = [
  'Conocimiento artesanal',
  'Realidad comercial',
  'Clientes y mercado',
  'Operaciones',
];

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const userId = useAuthStore((s) => s.user?.id);
  const { setFromOnboarding, hydrateFromDB } = useTelarDataStore();

  const { control, handleSubmit, getValues } = useForm<OnboardingAnswers>({
    defaultValues: {},
  });

  const BlockComponent = BLOCKS[step];
  const isLast = step === TOTAL - 1;
  const progress = ((step + 1) / TOTAL) * 100;

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (answers: OnboardingAnswers) => {
    if (!userId) return;

    if (!isLast) {
      goNext();
      return;
    }

    setSaving(true);
    try {
      // Optimistic: update store immediately
      setFromOnboarding(answers);

      // Persist to API — distributes to all entities
      const response = await upsertOnboardingAnswers(userId, {
        ...answers,
        source: 'onboarding',
      });

      // Sync store with authoritative response (with source/lastUpdated metadata)
      hydrateFromDB(response);

      EventBus.publish('onboarding.completed', { userId });

      toast.success('¡Perfecto! Tu perfil está listo.');
      navigate('/dashboard');
    } catch {
      toast.error('Hubo un error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Paso {step + 1} de {TOTAL} — {BLOCK_LABELS[step]}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Block */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <BlockComponent control={control} />
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={goPrev}
              disabled={step === 0}
            >
              Anterior
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : isLast ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
