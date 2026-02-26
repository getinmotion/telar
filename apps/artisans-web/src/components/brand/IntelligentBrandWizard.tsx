import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client'; // solo para Storage
import { useToast } from '@/hooks/use-toast';
import { extractColors, generateColorPalette, generateClaim, diagnoseBrandIdentity } from '@/services/brandAiAssistant.actions';
import { createAgentTasksBulk } from '@/services/agentTasks.actions';
import { getUserMasterContextByUserId } from '@/services/userMasterContext.actions';
import { telarApi } from '@/integrations/api/telarApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Palette, Sparkles, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EventBus } from '@/utils/eventBus';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { useUnifiedUserData } from '@/hooks/user';
import { useGamificationRewards } from '@/hooks/useGamificationRewards';
import { markTaskAsCompleted } from '@/hooks/utils/taskCompletionHelpers';
import { XP_REWARDS } from '@/constants/gamification';
import confetti from 'canvas-confetti';
import { useTaskRoutingAnalytics } from '@/hooks/analytics/useTaskRoutingAnalytics';
import { BrandPerceptionStep } from '@/components/brand/BrandPerceptionStep';
import { BrandDiagnosisResults } from '@/components/brand/BrandDiagnosisResults';
import { BrandDashboardView } from '@/components/brand/BrandDashboardView';
import { BrandHub } from '@/components/brand/BrandHub';
import { generateBrandMissions } from '@/lib/brand/missionGenerator';
import { AIDisclaimer } from '@/components/ui/AIDisclaimer';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

type WizardStep = 'loading' | 'brand-hub' | 'dashboard' | 'upload-logo' | 'extracting-colors' | 'generating-palette' | 'perception-1' | 'perception-2' | 'perception-3' | 'diagnosing' | 'diagnosis-results' | 'ask-claim' | 'input-claim' | 'generate-claim' | 'generating-claims' | 'select-claim' | 'complete';

interface ClaimOption {
  text: string;
  reasoning: string;
}

interface BrandColorSystem {
  primary_colors: string[];
  secondary_colors: string[];
  palette_reasoning?: string;
}

export const IntelligentBrandWizard: React.FC = () => {
  const [step, setStep] = useState<WizardStep>('loading');
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [colorSystem, setColorSystem] = useState<BrandColorSystem>({
    primary_colors: [],
    secondary_colors: []
  });
  const [claimOptions, setClaimOptions] = useState<ClaimOption[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<string>('');
  const [existingClaim, setExistingClaim] = useState<string>('');
  const [brandContext, setBrandContext] = useState<{
    brandName: string;
    businessDescription: string;
  }>({ brandName: '', businessDescription: '' });

  // Perception data for diagnosis
  const [perceptionData, setPerceptionData] = useState<{
    years_with_brand: string;
    description_in_3_words: string;
    customer_feedback: string;
    logo_feeling: string;
    target_audience: string;
    desired_emotion: string;
  }>({
    years_with_brand: '',
    description_in_3_words: '',
    customer_feedback: '',
    logo_feeling: '',
    target_audience: '',
    desired_emotion: ''
  });

  // Diagnosis results
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [generatedMissions, setGeneratedMissions] = useState<any[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshModule } = useMasterAgent();
  const { context, updateProfile, updateContext, refreshData } = useUnifiedUserData();
  const { awardXP, celebrateSuccess } = useGamificationRewards();
  const { updateRoutingCompletion } = useTaskRoutingAnalytics();

  // Cargar contexto existente desde unified data (cached)
  useEffect(() => {
    const loadContext = async () => {
      if (!user) return;

      try {
        // Use unified context (already cached, no database query)
        const businessProfile = (context?.businessProfile as any) || {};
        const businessContext = (context?.conversationInsights as any) || {};

        // Usar cualquier información disponible del maturity test
        const effectiveBrandName = businessProfile.brand_name ||
          businessProfile.business_name ||
          businessProfile.business_description?.substring(0, 50) ||
          'Tu Negocio';

        const effectiveDescription = businessProfile.business_description ||
          businessProfile.unique_value ||
          '';

        // Solo redirigir si NO hay descripción NI nombre de marca (usuario completamente nuevo)
        if (!effectiveDescription && !effectiveBrandName) {
          toast({
            title: 'Completa tu Evaluación',
            description: 'Necesitamos al menos el nombre de tu negocio para continuar.',
            variant: 'destructive'
          });
          navigate('/maturity-calculator');
          return;
        }

        // Usar placeholder si no hay descripción
        const safeDescription = effectiveDescription || 'Negocio artesanal';

        setBrandContext({
          brandName: effectiveBrandName,
          businessDescription: safeDescription
        });

        // Si ya tiene marca completa (logo + colores + claim), determinar siguiente paso
        const brandEval = businessContext?.brand_evaluation;
        const diagnosis = businessContext?.brand_diagnosis;

        if (brandEval?.logo_url && brandEval?.claim && brandEval?.primary_colors) {
          setLogoUrl(brandEval.logo_url);
          setColorSystem({
            primary_colors: brandEval.primary_colors || brandEval.colors || [],
            secondary_colors: brandEval.secondary_colors || []
          });
          setSelectedClaim(brandEval.claim);

          if (diagnosis && diagnosis.average_score) {
            setDiagnosis(diagnosis);
            setGeneratedMissions(diagnosis.generated_missions || []);
            setStep('dashboard');
          } else {
            setStep('brand-hub');
          }
        } else if (brandEval?.logo_url) {
          // Tiene logo pero no claim - continuar desde ahí
          setLogoUrl(brandEval.logo_url);
          setColorSystem({
            primary_colors: brandEval.primary_colors || brandEval.colors || [],
            secondary_colors: brandEval.secondary_colors || []
          });
          setStep('ask-claim');
        } else {
          // Empezar desde el inicio
          setStep('upload-logo');
        }
      } catch {
        setStep('upload-logo');
      }
    };

    loadContext();
  }, [user, navigate, toast, context]);

  const handleLogoUpload = async () => {
    if (!logoFile || !user) return;

    setStep('extracting-colors');

    try {
      // Optimize logo before upload
      const optimizedFile = await optimizeImage(logoFile, ImageOptimizePresets.logo);

      // 1. Subir a Supabase Storage
      const fileName = `${user.id}/logo_${Date.now()}.${optimizedFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, optimizedFile, { upsert: true });

      if (uploadError) {
        toast({
          title: 'Error',
          description: 'No se pudo subir el logo. Intenta de nuevo.',
          variant: 'destructive'
        });
        setStep('upload-logo');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);

      // 2. Extraer colores con IA
      let extractedColors: string[] = ['#000000', '#FFFFFF'];
      try {
        const { colors } = await extractColors(publicUrl);
        extractedColors = colors;
        setColorSystem(prev => ({ ...prev, primary_colors: colors }));
        toast({
          title: '¡Colores Primarios Extraídos!',
          description: `Se identificaron ${colors.length} colores de tu logo.`,
        });
        setStep('generating-palette');
        await generateSecondaryPalette(colors);
      } catch {
        toast({
          title: 'Advertencia',
          description: 'No se pudieron extraer colores automáticamente. Puedes continuar.',
          variant: 'default'
        });
        setColorSystem({ primary_colors: extractedColors, secondary_colors: [] });
        setStep('ask-claim');
      }

      // GUARDAR EN user_profiles usando unified data
      await updateProfile({
        avatarUrl: publicUrl,
        brandName: brandContext.brandName
      });

      // TAMBIÉN guardar en context
      const existingContext = context?.conversationInsights || {};
      const currentBrandEval = (existingContext as any)?.brand_evaluation || {};

      await updateContext({
        conversationInsights: {
          ...existingContext,
          brand_evaluation: {
            ...currentBrandEval,
            has_logo: true,
            logo_url: publicUrl,
            has_colors: true,
            primary_colors: extractedColors,
            secondary_colors: currentBrandEval.secondary_colors || [],
            evaluation_date: new Date().toISOString()
          }
        }
      });

      EventBus.publish('brand.logo.uploaded', { logoUrl: publicUrl, colors: extractedColors });

    } catch {
      toast({
        title: 'Error',
        description: 'Algo salió mal. Intenta de nuevo.',
        variant: 'destructive'
      });
      setStep('upload-logo');
    }
  };

  const generateSecondaryPalette = async (primaryColors: string[]) => {
    if (!user) return;

    const fallbackColors = ['#F5F5F5', '#E0E0E0', '#333333'];

    try {
      const { secondary_colors, reasoning } = await generateColorPalette(primaryColors);

      if (!secondary_colors?.length) throw new Error('No secondary colors returned');

      setColorSystem(prev => ({ ...prev, secondary_colors, palette_reasoning: reasoning }));
      toast({
        title: '¡Paleta Completa Generada! 🎨',
        description: 'Se creó un sistema de colores completo para tu marca.',
      });

      const existingContext = context?.conversationInsights || {};
      const currentBrandEval = (existingContext as any)?.brand_evaluation || {};

      await updateContext({
        conversationInsights: {
          ...existingContext,
          brand_evaluation: {
            ...currentBrandEval,
            primary_colors: primaryColors,
            secondary_colors,
            palette_reasoning: reasoning || ''
          }
        }
      });

      setStep('perception-1');

    } catch {
      toast({
        title: 'Advertencia',
        description: 'Se usaron colores predeterminados para la paleta secundaria.',
        variant: 'default'
      });
      setColorSystem(prev => ({ ...prev, secondary_colors: fallbackColors }));
      setStep('ask-claim');
    }
  };

  const handleGenerateClaims = async () => {
    if (!user) return;

    setStep('generating-claims');

    try {
      const { claims } = await generateClaim({
        brandName: brandContext.brandName,
        businessDescription: brandContext.businessDescription,
        userId: user.id,
      });

      if (claims?.length > 0) {
        setClaimOptions(claims);
        setStep('select-claim');
        toast({
          title: '¡Claims Generados!',
          description: 'La IA creó 3 opciones para tu marca.',
        });
      } else {
        toast({
          title: 'Sin resultados',
          description: 'No se generaron claims. Intenta de nuevo.',
          variant: 'destructive'
        });
        setStep('generate-claim');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Error al generar claims.',
        variant: 'destructive'
      });
      setStep('generate-claim');
    }
  };

  // ✅ FASE 1: Handler para completar preguntas de percepción
  const handlePerceptionComplete = (data: typeof perceptionData) => {
    setPerceptionData(prev => ({ ...prev, ...data }));

    // Avanzar al siguiente paso de percepción
    if (step === 'perception-1') {
      setStep('perception-2');
    } else if (step === 'perception-2') {
      setStep('perception-3');
    } else if (step === 'perception-3') {
      // Completado - iniciar diagnóstico
      runBrandDiagnosis(data);
    }
  };

  // ✅ FASE 2: Ejecutar diagnóstico de marca con IA
  const runBrandDiagnosis = async (finalPerceptionData: typeof perceptionData) => {
    if (!user) return;

    setStep('diagnosing');

    try {
      const { diagnosis: diagnosisResult } = await diagnoseBrandIdentity({
        logoUrl,
        colors: {
          primary: colorSystem.primary_colors,
          secondary: colorSystem.secondary_colors,
        },
        brandName: brandContext.brandName,
        businessDescription: brandContext.businessDescription,
        perception: {
          yearsWithBrand: finalPerceptionData.years_with_brand,
          descriptionIn3Words: finalPerceptionData.description_in_3_words,
          customerFeedback: finalPerceptionData.customer_feedback,
          logoFeeling: finalPerceptionData.logo_feeling,
          targetAudience: finalPerceptionData.target_audience,
          desiredEmotion: finalPerceptionData.desired_emotion,
        },
      });

      setDiagnosis(diagnosisResult);

      const missions = generateBrandMissions(diagnosisResult, brandContext.brandName);
      setGeneratedMissions(missions);

      if (missions.length > 0) {
        await createAgentTasksBulk(
          missions.map((mission: any) => ({
            userId: user.id,
            agentId: mission.agent_id,
            milestoneCategory: 'brand' as const,
            title: mission.title,
            description: mission.description,
            priority: mission.priority === 'high' ? 5 : mission.priority === 'medium' ? 3 : 1,
            relevance: mission.relevance as 'low' | 'medium' | 'high',
            status: 'pending' as const,
            progressPercentage: 0,
            environment: 'production' as const,
          }))
        );
        EventBus.publish('milestone.tasks.generated', {
          milestoneId: 'brand',
          milestoneName: 'Identidad de Marca',
          count: missions.length
        });
      }

      const existingContext = context?.conversationInsights || {};
      await updateContext({
        conversationInsights: {
          ...existingContext,
          brand_perception: finalPerceptionData,
          brand_diagnosis: {
            ...diagnosisResult,
            evaluated_at: new Date().toISOString(),
            generated_missions: missions.map((m: any) => m.diagnosis_issue)
          }
        }
      });

      setStep('diagnosis-results');
      toast({
        title: '✅ Diagnóstico Completo',
        description: `Se generaron ${missions.length} misiones de mejora.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Hubo un problema con el diagnóstico. Continuando...',
        variant: 'destructive'
      });
      setStep('ask-claim');
    }
  };

  const handleSaveBrand = async () => {
    if (!user || !selectedClaim) return;

    try {
      // Obtener contexto actual desde unified data (ya en cache)
      const existingContext = context?.conversationInsights || {};
      const currentBrandEval = (existingContext as any)?.brand_evaluation || {};

      const updatedBrandEval = {
        ...currentBrandEval,
        has_logo: true,
        logo_url: logoUrl,
        has_colors: true,
        primary_colors: colorSystem.primary_colors,
        secondary_colors: colorSystem.secondary_colors,
        palette_reasoning: colorSystem.palette_reasoning,
        has_claim: true,
        claim: selectedClaim,
        score: 90,
        evaluation_date: new Date().toISOString()
      };

      // GUARDAR EN context
      await updateContext({
        conversationInsights: {
          ...existingContext,
          brand_evaluation: updatedBrandEval
        }
      });

      // TAMBIÉN guardar en profile
      await updateProfile({
        avatarUrl: logoUrl,
        brandName: brandContext.brandName,
        businessDescription: selectedClaim
      });

      // SINCRONIZAR CON TIENDA ARTESANAL usando función mejorada
      try {
        const { syncBrandToShop } = await import('@/utils/syncBrandToShop');
        const result = await syncBrandToShop(user.id, true);

        toast({
          title: result.success ? '✅ Sincronización completa' : 'Advertencia',
          description: result.message,
          variant: result.success ? 'default' : 'default'
        });
      } catch {
        toast({
          title: 'Advertencia',
          description: 'La marca se guardó pero hubo un problema al sincronizar con la tienda.',
          variant: 'default'
        });
      }

      EventBus.publish('brand.colors.updated', {
        primary_colors: colorSystem.primary_colors,
        secondary_colors: colorSystem.secondary_colors,
        claim: selectedClaim
      });

      // Sincronizar módulos
      await refreshModule('marca');
      await refreshModule('tienda');

      // 🎯 GAMIFICACIÓN: Otorgar XP por completar el wizard de marca
      await awardXP(
        XP_REWARDS.BRAND_WIZARD_COMPLETE,
        'Identidad de Marca Completada',
        true, // missionCompleted
        5 // timeSpent in minutes (approximate)
      );

      // Celebrar con confetti
      celebrateSuccess();

      toast({
        title: '¡Marca Guardada! ✨',
        description: 'Tu identidad visual está completa y aplicada a tu tienda.',
      });

      if (taskId) {
        try {
          await markTaskAsCompleted(taskId, user.id);
        } catch {
          // non-critical
        }
      }

      // Publicar evento de milestone completado
      EventBus.publish('brand.wizard.completed', {
        userId: user.id,
        taskId: taskId || 'brand-visual-identity',
        actions: ['logo', 'colors', 'claim', 'brand_wizard']
      });

      // Trigger progress recalculation
      EventBus.publish('master.full.sync', { source: 'brand_wizard' });

      if (taskId) {
        await updateRoutingCompletion({
          taskId,
          wasSuccessful: true,
          completionMethod: 'wizard'
        });
      }

      setStep('complete');

      // Redirigir al dashboard si vino desde una tarea
      if (taskId) {
        setTimeout(() => {
          navigate(`/dashboard?task_completed=${taskId}`);
        }, 2000);
      }

    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo completar el guardado.',
        variant: 'destructive'
      });
    }
  };

  // Renderizado de pasos
  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  if (step === 'upload-logo') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Sube tu Logo
          </CardTitle>
          <CardDescription>
            Tu logo es la cara de tu marca. La IA extraerá automáticamente los colores dominantes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setLogoFile(file);
                  // Preview
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setLogoUrl(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
              id="logo-upload"
            />
            <Label htmlFor="logo-upload" className="cursor-pointer">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo preview" className="max-h-48 mx-auto mb-4 rounded" />
              ) : (
                <div className="py-12">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Click para seleccionar tu logo</p>
                </div>
              )}
            </Label>
          </div>

          <AIDisclaimer variant="banner" context="generate" className="mb-4" />

          <Button
            onClick={handleLogoUpload}
            disabled={!logoFile}
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analizar con IA
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'extracting-colors') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold mb-2">Extrayendo colores de tu logo...</p>
          <p className="text-muted-foreground">La IA está analizando tu imagen</p>
        </div>
      </div>
    );
  }

  if (step === 'generating-palette') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold mb-2">Generando paleta de colores secundaria...</p>
          <p className="text-muted-foreground">La IA está creando colores complementarios para tu marca</p>
        </div>
      </div>
    );
  }

  // ✅ FASE 1: Render de preguntas de percepción
  if (step === 'perception-1' || step === 'perception-2' || step === 'perception-3') {
    const questionNumber = step === 'perception-1' ? 1 : step === 'perception-2' ? 2 : 3;
    return (
      <BrandPerceptionStep
        currentQuestion={questionNumber}
        onComplete={handlePerceptionComplete}
        initialData={perceptionData}
      />
    );
  }

  // ✅ FASE 2: Render de diagnóstico en proceso
  if (step === 'diagnosing') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold mb-2">Analizando tu Identidad de Marca...</p>
          <p className="text-muted-foreground">La IA está evaluando logo, colores, mensaje y coherencia</p>
        </div>
      </div>
    );
  }

  // ✅ NUEVO: Render del BrandHub (punto de decisión cuando tiene marca pero no diagnóstico)
  if (step === 'brand-hub') {
    return (
      <BrandHub
        brandName={brandContext.brandName}
        logoUrl={logoUrl}
        colorSystem={colorSystem}
        claim={selectedClaim}
        onStartDiagnosis={() => {
          // Iniciar el flujo de percepción para crear diagnóstico
          setStep('perception-1');
        }}
        onElementUpdated={async () => {
          await refreshData();

          const contextData = await getUserMasterContextByUserId(user!.id);
          const brandEval = (contextData?.conversationInsights as any)?.brand_evaluation;

          if (brandEval) {
            if (brandEval.logo_url) setLogoUrl(brandEval.logo_url);
            if (brandEval.claim) setSelectedClaim(brandEval.claim);
            if (brandEval.primary_colors || brandEval.secondary_colors) {
              setColorSystem({
                primary_colors: brandEval.primary_colors || [],
                secondary_colors: brandEval.secondary_colors || []
              });
            }
          }

          toast({
            title: '✅ Marca Actualizada',
            description: 'Los cambios se guardaron correctamente.',
          });
        }}
      />
    );
  }

  // ✅ Render del dashboard editable (modo principal cuando ya tienes diagnóstico)
  if (step === 'dashboard') {
    return (
      <div className="max-w-5xl mx-auto">
        <BrandDashboardView
          diagnosis={diagnosis}
          generatedMissions={generatedMissions}
          brandName={brandContext.brandName}
          logoUrl={logoUrl}
          colorSystem={colorSystem}
          claim={selectedClaim}
          onRedoDiagnosis={() => {
            // Volver al inicio del wizard completo
            setStep('upload-logo');
          }}
          onElementUpdated={async (element, newDiagnosis) => {
            setDiagnosis(newDiagnosis);

            if (newDiagnosis.average_score < (diagnosis?.average_score || 0)) {
              const newMissions = generateBrandMissions(newDiagnosis, brandContext.brandName);
              setGeneratedMissions(newMissions);

              if (user) {
                try {
                  await telarApi.post('/ai/master-coordinator', {
                    action: 'evaluate_brand_identity',
                    userId: user.id,
                    wizardData: { diagnosis: newDiagnosis, generatedMissions: newMissions },
                  });
                } catch {
                  // non-critical background call
                }
              }
            }

            const freshContext = await getUserMasterContextByUserId(user!.id);
            const brandEval = (freshContext?.conversationInsights as any)?.brand_evaluation;

            if (element === 'logo' && brandEval?.logo_url) {
              setLogoUrl(brandEval.logo_url);
            } else if (element === 'colors' && brandEval) {
              setColorSystem({
                primary_colors: brandEval.primary_colors || [],
                secondary_colors: brandEval.secondary_colors || []
              });
            } else if (element === 'claim' && brandEval?.claim) {
              setSelectedClaim(brandEval.claim);
            }

            await refreshData();
          }}
        />
      </div>
    );
  }

  // ✅ FASE 5: Render de resultados del diagnóstico (solo se usa al completar por primera vez)
  if (step === 'diagnosis-results') {
    return (
      <div className="max-w-4xl mx-auto">
        <BrandDiagnosisResults
          diagnosis={diagnosis}
          generatedMissions={generatedMissions}
          onViewMissions={() => setStep('ask-claim')}
        />
      </div>
    );
  }

  if (step === 'ask-claim') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-6 h-6" />
            Tu Sistema de Colores
          </CardTitle>
          <CardDescription>
            Paleta completa generada a partir de tu logo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {logoUrl && (
            <div className="flex justify-center">
              <img src={logoUrl} alt="Logo" className="max-h-32 rounded" />
            </div>
          )}

          <div>
            <Label className="mb-2 block font-semibold">Colores Primarios (de tu logo):</Label>
            <div className="flex gap-2 flex-wrap">
              {colorSystem.primary_colors.map((color, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-border shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {colorSystem.secondary_colors.length > 0 && (
            <div>
              <Label className="mb-2 block font-semibold">Colores Secundarios (complementarios):</Label>
              <div className="flex gap-2 flex-wrap">
                {colorSystem.secondary_colors.map((color, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-border shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-muted-foreground mt-1 block">{color}</span>
                  </div>
                ))}
              </div>
              {colorSystem.palette_reasoning && (
                <p className="text-xs text-muted-foreground mt-2 italic">{colorSystem.palette_reasoning}</p>
              )}
            </div>
          )}

          <div className="pt-4 border-t space-y-4">
            <Label className="font-semibold">¿Ya tienes un claim para tu marca?</Label>
            <p className="text-sm text-muted-foreground">
              Un claim es una frase corta que define la esencia de tu marca (ej: "Nike - Just Do It")
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setStep('input-claim')}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Sí, ya tengo uno
              </Button>
              <Button
                onClick={handleGenerateClaims}
                className="flex-1"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                No, generar con IA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'input-claim') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Ingresa tu Claim</CardTitle>
          <CardDescription>
            Escribe el claim existente de tu marca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="existing-claim">Claim de tu marca</Label>
            <Input
              id="existing-claim"
              placeholder="Ej: Artesanía que cuenta historias"
              value={existingClaim}
              onChange={(e) => setExistingClaim(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('ask-claim')}
              className="flex-1"
            >
              Volver
            </Button>
            <Button
              onClick={() => {
                if (existingClaim.trim()) {
                  setSelectedClaim(existingClaim);
                  handleSaveBrand();
                } else {
                  toast({
                    title: 'Campo vacío',
                    description: 'Por favor ingresa tu claim',
                    variant: 'destructive'
                  });
                }
              }}
              disabled={!existingClaim.trim()}
              className="flex-1"
            >
              Guardar Marca
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'generating-claims') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold mb-2">Generando claims...</p>
          <p className="text-muted-foreground">La IA está creando opciones para tu marca</p>
        </div>
      </div>
    );
  }

  if (step === 'select-claim') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Elige tu Claim
          </CardTitle>
          <CardDescription>
            La IA generó 3 opciones. Selecciona la que mejor representa tu marca.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={selectedClaim} onValueChange={setSelectedClaim}>
            {claimOptions.map((option, idx) => (
              <div key={idx} className="border rounded-lg p-4 cursor-pointer hover:border-primary transition">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={option.text} id={`claim-${idx}`} />
                  <Label htmlFor={`claim-${idx}`} className="flex-1 cursor-pointer">
                    <p className="font-semibold text-lg mb-1">{option.text}</p>
                    <p className="text-sm text-muted-foreground">{option.reasoning}</p>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>

          <Button
            onClick={handleSaveBrand}
            disabled={!selectedClaim}
            className="w-full"
            size="lg"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Guardar mi Marca
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle2 className="w-6 h-6" />
            ¡Marca Completa!
          </CardTitle>
          <CardDescription>
            Tu identidad visual está lista y aplicada a tu tienda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {logoUrl && (
            <div className="flex justify-center">
              <img src={logoUrl} alt="Logo" className="max-h-32 rounded" />
            </div>
          )}

          <div>
            <Label className="mb-2 block font-semibold">Colores Primarios:</Label>
            <div className="flex gap-2 flex-wrap mb-4">
              {colorSystem.primary_colors.map((color, idx) => (
                <div key={idx} className="w-12 h-12 rounded border shadow-sm" style={{ backgroundColor: color }} />
              ))}
            </div>
            {colorSystem.secondary_colors.length > 0 && (
              <>
                <Label className="mb-2 block font-semibold">Colores Secundarios:</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorSystem.secondary_colors.map((color, idx) => (
                    <div key={idx} className="w-12 h-12 rounded border shadow-sm" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </>
            )}
          </div>

          {selectedClaim && (
            <div>
              <Label>Claim:</Label>
              <p className="text-lg font-semibold mt-1">{selectedClaim}</p>
            </div>
          )}

          {/* Siguiente paso: Aplicar marca a tienda */}
          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Siguiente paso: Aplica tu marca a tu tienda
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Ahora que has definido tu identidad de marca, configura el Hero Slider de tu tienda
              para que refleje tu nueva imagen visual.
            </p>
            <Button
              onClick={() => navigate('/dashboard/shop-hero-wizard')}
              className="w-full"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Configurar Hero Slider con mi Marca
            </Button>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1">
              Ir al Taller Digital
            </Button>
            <Button onClick={() => navigate('/mi-tienda')} className="flex-1">
              Ver mi Tienda
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
