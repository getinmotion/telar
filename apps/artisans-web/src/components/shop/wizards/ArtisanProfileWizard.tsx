import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useAuth } from '@/context/AuthContext';
import { updateArtisanShop, getStoreByUserId } from '@/services/artisanShops.actions';
import { getArtisanIdentityByUserId } from '@/services/artisan-identity.actions';
import { generateArtisanProfileHistory } from '@/services/ai.actions';
import { ArtisanProfileData, DEFAULT_ARTISAN_PROFILE } from '@/types/artisanProfile';
import { ArtisanStepShell } from './artisan-profile/ArtisanStepShell';
import { Step1Identity }     from './artisan-profile/Step1Identity';
import { Step2Origin }       from './artisan-profile/Step2Origin';
import { Step4Workshop }     from './artisan-profile/Step4Workshop';
import { Step5Craft }        from './artisan-profile/Step5Craft';
import { Step7Preview }      from './artisan-profile/Step7Preview';
import { EventBus } from '@/utils/eventBus';
import { NotificationTemplates } from '@/services/notificationService';
import { useTelarDataStore } from '@/stores/telarDataStore';

const TOTAL_STEPS = 5;

const STEPS = [
  { n: 1, icon: 'person',        title: 'Tu identidad',          subtitle: 'Cada taller tiene una voz única. Empecemos por la tuya.' },
  { n: 2, icon: 'history_edu',   title: 'Tu historia y tradición', subtitle: 'Cuéntanos cómo aprendiste tu oficio y su relación con tu territorio.' },
  { n: 3, icon: 'storefront',    title: 'Tu taller y proceso',   subtitle: 'Muéstranos dónde trabajas y cómo nace una pieza.' },
  { n: 4, icon: 'auto_fix_high', title: 'Tu arte y estilo',      subtitle: 'Define las técnicas, materiales y rasgos que identifican tu trabajo.' },
  { n: 5, icon: 'visibility',    title: 'Vista previa',          subtitle: 'Revisa cómo se presentará tu historia antes de publicar.' },
];

const AI_PANEL: Record<number, { cards: Array<{ label: string; text: string }>; next: string }> = {
  1: {
    cards: [
      { label: 'Lectura de identidad',  text: 'Esperando nombre, foto o descripción para iniciar el análisis.' },
      { label: 'Presentación pública',  text: 'TELAR podrá sugerir una biografía profesional basada en tu historia.' },
      { label: 'Próximo paso IA',       text: 'Con esta información construiremos el núcleo de tu perfil artesanal.' },
    ],
    next: 'Continuaremos con la historia y tradición de tu oficio.',
  },
  2: {
    cards: [
      { label: 'Lectura de aprendizaje', text: 'TELAR analizará cómo comenzó tu aprendizaje y las señales de tradición en tu historia.' },
      { label: 'Señales culturales',     text: 'Al completar el significado del oficio, detectaremos los valores de tu marca personal.' },
      { label: 'Territorio detectado',   text: 'Con país, departamento y municipio organizaremos el origen territorial de tu perfil.' },
    ],
    next: 'Esta información alimentará tu página pública con un relato auténtico.',
  },
  3: {
    cards: [
      { label: 'Lectura visual del taller', text: 'Sube una foto para detectar automáticamente el tipo de entorno artesanal.' },
      { label: 'Señales del proceso',       text: 'Cuando describas tu proceso, TELAR podrá sugerir fases y tiempos de oficio.' },
      { label: 'Herramientas detectadas',   text: 'Las herramientas que cites ayudarán a categorizar tu perfil con mayor precisión.' },
    ],
    next: 'En el siguiente paso definiremos tu estética y las técnicas que identifican tu trabajo.',
  },
  4: {
    cards: [
      { label: 'Técnica detectada',  text: 'Esperando selección de técnica para identificar oficio principal y señales de especialización.' },
      { label: 'Materiales clave',   text: 'Los materiales conectarán tu perfil con productos, procesos y búsquedas del marketplace.' },
      { label: 'Estilo artesanal',   text: 'TELAR sugerirá etiquetas curatoriales cuando describas qué hace especial tu trabajo.' },
    ],
    next: 'En el siguiente paso revisaremos cómo se verá tu perfil antes de publicarlo.',
  },
  5: {
    cards: [
      { label: 'Sistema de calidad', text: 'Vista previa editorial. Todos los datos pueden modificarse antes de la publicación.' },
      { label: 'Observación IA',     text: 'Mientras más completa esté tu historia, mejor construirá TELAR una presentación coherente y verificable.' },
    ],
    next: 'Con los campos obligatorios completos, podrás finalizar y publicar tu perfil artesanal.',
  },
};

function validate(step: number, data: ArtisanProfileData): boolean {
  switch (step) {
    case 1: return !!data.artisanName && !!data.artisticName;
    case 2: return !!data.learnedFrom && data.startAge > 0;
    case 3: return (!!data.workshopPhoto || (data.workshopPhotos ?? []).length > 0) && !!data.workshopDescription;
    case 4: return data.techniques.length > 0 && data.materials.length > 0 && !!data.uniqueness;
    case 5: return true;
    default: return true;
  }
}

function isPublishReady(data: ArtisanProfileData): boolean {
  return !!data.artisanName && !!data.artisticName && !!data.artisanPhoto
    && !!data.learnedFromDetail && data.techniques.length > 0
    && data.materials.length > 0;
}

interface Props {
  onComplete?: () => void;
}

export const ArtisanProfileWizard: React.FC<Props> = ({ onComplete }) => {
  const { shop, forceRefresh } = useArtisanShop();
  const { user }  = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();

  const [step,           setStep]          = useState(1);
  const [data,           setData]          = useState<ArtisanProfileData>(DEFAULT_ARTISAN_PROFILE);
  const [isSaving,       setIsSaving]      = useState(false);
  const [isGenerating,   setIsGenerating]  = useState(false);
  const [generatedStory, setGeneratedStory] = useState<any>(null);

  const telarData          = useTelarDataStore();
  const shopAny            = shop as any;
  const isProfileCompleted = shopAny?.artisanProfileCompleted === true;

  const LEARNING_ORIGIN_MAP: Record<string, string> = {
    family: 'parents', masters: 'master', academic: 'school',
    autodidact: 'self-taught', mixed: 'community',
  };

  useEffect(() => {
    if (shopAny?.artisanProfile) {
      const profile = shopAny.artisanProfile as ArtisanProfileData;
      setData({ ...DEFAULT_ARTISAN_PROFILE, ...profile });
      if (profile.generatedStory) setGeneratedStory(profile.generatedStory);
      if (shopAny.artisanProfileCompleted) setStep(5);

      // Pre-cargar craftId y primaryTechniqueId si el perfil aún no los tiene
      if (user?.id && (!profile.craftId || !profile.primaryTechniqueId)) {
        if (!profile.craftId) {
          getStoreByUserId(user.id)
            .then(store => {
              const craftId = (store as any)?.artisanalProfile?.primaryCraftId;
              if (craftId) setData(prev => ({ ...prev, craftId: prev.craftId ?? craftId }));
            })
            .catch(() => {});
        }
        if (!profile.primaryTechniqueId) {
          getArtisanIdentityByUserId(user.id)
            .then(identity => {
              if (identity?.techniquePrimaryId)
                setData(prev => ({ ...prev, primaryTechniqueId: prev.primaryTechniqueId ?? identity.techniquePrimaryId! }));
            })
            .catch(() => {});
        }
      }
    } else if (telarData.hydrated) {
      const meta = user?.user_metadata as Record<string, string> | undefined;
      const onboardingName = (telarData.name?.value as string) || '';
      const regName = meta?.full_name
        || [meta?.first_name, meta?.last_name].filter(Boolean).join(' ')
        || '';
      const learningOrigin = (telarData.learning_origin?.value as string) || '';

      setData(prev => ({
        ...prev,
        artisanName:       prev.artisanName       || onboardingName || regName,
        learnedFrom:       prev.learnedFrom        || LEARNING_ORIGIN_MAP[learningOrigin] || '',
        learnedFromDetail: prev.learnedFromDetail  || (telarData.story?.value as string) || '',
        department:        prev.department         || (shopAny?.department as string)    || '',
        municipality:      prev.municipality       || (shopAny?.municipality as string)  || '',
        country:           prev.country            || 'Colombia',
      }));
    }
  }, [shopAny?.artisanProfile, telarData.hydrated, shop?.id]);

  const updateData = (updates: Partial<ArtisanProfileData>) =>
    setData((prev) => ({ ...prev, ...updates }));

  const saveDraft = async (quiet = false) => {
    if (!shop?.id) return;
    setIsSaving(true);
    try {
      await updateArtisanShop(shop.id, { artisanProfile: data as any, artisanProfileCompleted: isProfileCompleted });
      if (!quiet) toast({ title: 'Borrador guardado', description: 'Tu progreso ha sido guardado.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const generateStory = async () => {
    if (!shop?.id) return null;
    setIsGenerating(true);
    try {
      const story = await generateArtisanProfileHistory({
        artisanId: user?.id,
        profile: data,
        shopName: shop.shopName,
        craftType: shop.craftType || '',
        region: shop.region || '',
      });
      setGeneratedStory(story);
      return story;
    } catch {
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!shop?.id) return;
    setIsSaving(true);
    try {
      let story = generatedStory;
      if (!story) story = await generateStory();
      const finalProfile: ArtisanProfileData = { ...data, completedAt: new Date().toISOString(), generatedStory: story };
      await updateArtisanShop(shop.id, { artisanProfile: finalProfile as any, artisanProfileCompleted: true });
      EventBus.publish('artisan.profile.completed', { shopId: shop.id });
      if (user) await NotificationTemplates.artisanProfileCompleted(user.id, shop.shopName, shop.shopSlug);
      toast({ title: '¡Perfil publicado!', description: 'Tu historia ahora es visible en tu tienda.' });
      forceRefresh();
      onComplete?.();
    } catch {
      toast({ title: 'Error', description: 'No se pudo publicar el perfil.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validate(step, data)) {
      toast({ title: 'Campos incompletos', description: 'Por favor completa los campos requeridos.', variant: 'destructive' });
      return;
    }
    await saveDraft(true);
    if (step === 4) await generateStory();
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const meta        = STEPS[step - 1];
  const aiPanel     = AI_PANEL[step];
  const canAdvance  = validate(step, data);
  const canPublish  = isPublishReady(data);
  const isLast      = step === TOTAL_STEPS;

  const shellProps = {
    step,
    totalSteps: TOTAL_STEPS,
    icon: meta.icon,
    title: meta.title,
    subtitle: meta.subtitle,
    aiCards: aiPanel.cards,
    aiNext: aiPanel.next,
    onBack: step > 1 ? handleBack : () => navigate(-1),
    onSaveDraft: () => saveDraft(),
    isSavingDraft: isSaving,
  };

  if (isLast) {
    return (
      <ArtisanStepShell
        {...shellProps}
        isFinalStep
        onSubmit={handlePublish}
        isSubmitting={isSaving || isGenerating}
        submitLabel={isProfileCompleted ? 'Guardar cambios' : 'Finalizar y publicar'}
      >
        <Step7Preview data={data} generatedStory={generatedStory} isGenerating={isGenerating} onEditStep={setStep} />
      </ArtisanStepShell>
    );
  }

  return (
    <ArtisanStepShell
      {...shellProps}
      onNext={handleNext}
      nextDisabled={!canAdvance}
      disabledReason={!canAdvance ? 'Completa los campos obligatorios.' : undefined}
    >
      {step === 1 && (
        <Step1Identity
          data={data}
          onChange={updateData}
          shopSlug={(shop as any)?.shopSlug || ''}
          shopName={(shop as any)?.shopName || ''}
          userId={user?.id}
          onShopUpdate={async (updates) => {
            if (shop?.id) {
              await updateArtisanShop(shop.id, updates as any);
              forceRefresh();
            }
          }}
        />
      )}
      {step === 2 && <Step2Origin       data={data} onChange={updateData} />}
      {step === 3 && <Step4Workshop     data={data} onChange={updateData} userId={user?.id} />}
      {step === 4 && <Step5Craft        data={data} onChange={updateData} />}
    </ArtisanStepShell>
  );
};
