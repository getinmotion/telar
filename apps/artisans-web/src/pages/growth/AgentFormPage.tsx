import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import {
  getArtisansKnowledgeProfile,
  submitStep1Identity,
  submitStep2Commercial,
  submitStep3ClientMarket,
  submitStep4OperationGrowth,
  checkProfileCompletion,
} from '@/services/artisansKnowledge.actions';
import { createArtisanShop } from '@/services/artisanShops.actions';
import type {
  ArtisansIdentityProfile,
  CreateArtisansIdentityOneDto,
  CreateArtisansCommercialTwoDto,
  CreateArtisansClientMarketThreeDto,
  CreateArtisansOperationGrowthFourDto,
} from '@/types/artisansKnowledge.types';
import { toast } from 'sonner';

/**
 * Formulario de onboarding step by step para nuevos artesanos
 *
 * 4 Bloques:
 * 1. Identidad artesanal (nameShop, historia, experiencia)
 * 2. Información comercial (costos, precios, rentabilidad)
 * 3. Clientes y mercado (quiénes compran, dónde vendes)
 * 4. Operaciones y crecimiento (capacidad, limitaciones, equipo)
 *
 * Features:
 * - Guardado de borrador automático
 * - Navegación entre bloques
 * - NO crea shop hasta completar todos los bloques
 * - NO redirige al dashboard hasta completar todo
 */
export const AgentFormPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // ─── State ────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ArtisansIdentityProfile | null>(null);

  // Step 1: Identidad
  const [step1Data, setStep1Data] = useState<Omit<CreateArtisansIdentityOneDto, 'createdBy'>>({
    nameShop: '',
    artisanHistory: '',
    ageExperience: 0,
    shopHistory: '',
    shopDescription: '',
    shopDefinition: '',
    shopCategoriesId: '',
    shopSpecialDefinitionOne: '',
    shopSpecialDefinitionTwo: null,
    shopSpecialDefinitionThree: null,
    shopBornSpecialDefinitionOne: '',
    shopBornSpecialDefinitionTwo: null,
    shopBornSpecialDefinitionThree: null,
  });

  // Step 2: Comercial
  const [step2Data, setStep2Data] = useState<Omit<CreateArtisansCommercialTwoDto, 'createdBy'>>({
    shopRangePayment: '',
    shopKnowledgeCost: '',
    shopKnowledgeDefineCost: '',
    shopKnowledgeIsProfitable: '',
  });

  // Step 3: Cliente/Mercado
  const [step3Data, setStep3Data] = useState<Omit<CreateArtisansClientMarketThreeDto, 'createdBy'>>({
    shopKnowledgeMainBuyerOne: '',
    shopKnowledgeMainBuyerTwo: null,
    shopKnowledgeMainBuyerThree: null,
    shopKnowledgeDigitalPresence: '',
    shopKnowledgeWhereSaleOne: '',
    shopKnowledgeWhereSaleTwo: null,
    shopKnowledgeWhereSaleThree: null,
    shopKnowledgeSalesActivity: '',
  });

  // Step 4: Operaciones/Crecimiento
  const [step4Data, setStep4Data] = useState<Omit<CreateArtisansOperationGrowthFourDto, 'createdBy'>>({
    shopKnowledgeProductsMakeMonth: '',
    shopKnowledgeLimitTodayOne: '',
    shopKnowledgeLimitTodayTwo: null,
    shopKnowledgeLimitTodayThree: null,
    shopManyWorkers: '',
    shopFirstSolvingTelar: '',
  });

  // ─── Load Profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const existingProfile = await getArtisansKnowledgeProfile(user.id);

        if (existingProfile) {
          setProfile(existingProfile);

          // Hydrate form data from existing profile
          if (existingProfile.identityOne) {
            setStep1Data({
              nameShop: existingProfile.identityOne.nameShop || '',
              artisanHistory: existingProfile.identityOne.artisanHistory || '',
              ageExperience: existingProfile.identityOne.ageExperience || 0,
              shopHistory: existingProfile.identityOne.shopHistory || '',
              shopDescription: existingProfile.identityOne.shopDescription || '',
              shopDefinition: existingProfile.identityOne.shopDefinition || '',
              shopCategoriesId: existingProfile.identityOne.shopCategoriesId || '',
              shopSpecialDefinitionOne: existingProfile.identityOne.shopSpecialDefinitionOne || '',
              shopSpecialDefinitionTwo: existingProfile.identityOne.shopSpecialDefinitionTwo || null,
              shopSpecialDefinitionThree: existingProfile.identityOne.shopSpecialDefinitionThree || null,
              shopBornSpecialDefinitionOne: existingProfile.identityOne.shopBornSpecialDefinitionOne || '',
              shopBornSpecialDefinitionTwo: existingProfile.identityOne.shopBornSpecialDefinitionTwo || null,
              shopBornSpecialDefinitionThree: existingProfile.identityOne.shopBornSpecialDefinitionThree || null,
            });
          }

          if (existingProfile.commercialTwo) {
            setStep2Data({
              shopRangePayment: existingProfile.commercialTwo.shopRangePayment || '',
              shopKnowledgeCost: existingProfile.commercialTwo.shopKnowledgeCost || '',
              shopKnowledgeDefineCost: existingProfile.commercialTwo.shopKnowledgeDefineCost || '',
              shopKnowledgeIsProfitable: existingProfile.commercialTwo.shopKnowledgeIsProfitable || '',
            });
          }

          if (existingProfile.clientMarketThree) {
            setStep3Data({
              shopKnowledgeMainBuyerOne: existingProfile.clientMarketThree.shopKnowledgeMainBuyerOne || '',
              shopKnowledgeMainBuyerTwo: existingProfile.clientMarketThree.shopKnowledgeMainBuyerTwo || null,
              shopKnowledgeMainBuyerThree: existingProfile.clientMarketThree.shopKnowledgeMainBuyerThree || null,
              shopKnowledgeDigitalPresence: existingProfile.clientMarketThree.shopKnowledgeDigitalPresence || '',
              shopKnowledgeWhereSaleOne: existingProfile.clientMarketThree.shopKnowledgeWhereSaleOne || '',
              shopKnowledgeWhereSaleTwo: existingProfile.clientMarketThree.shopKnowledgeWhereSaleTwo || null,
              shopKnowledgeWhereSaleThree: existingProfile.clientMarketThree.shopKnowledgeWhereSaleThree || null,
              shopKnowledgeSalesActivity: existingProfile.clientMarketThree.shopKnowledgeSalesActivity || '',
            });
          }

          if (existingProfile.operationGrowthFour) {
            setStep4Data({
              shopKnowledgeProductsMakeMonth: existingProfile.operationGrowthFour.shopKnowledgeProductsMakeMonth || '',
              shopKnowledgeLimitTodayOne: existingProfile.operationGrowthFour.shopKnowledgeLimitTodayOne || '',
              shopKnowledgeLimitTodayTwo: existingProfile.operationGrowthFour.shopKnowledgeLimitTodayTwo || null,
              shopKnowledgeLimitTodayThree: existingProfile.operationGrowthFour.shopKnowledgeLimitTodayThree || null,
              shopManyWorkers: existingProfile.operationGrowthFour.shopManyWorkers || '',
              shopFirstSolvingTelar: existingProfile.operationGrowthFour.shopFirstSolvingTelar || '',
            });
          }

          // Determine which step to show based on completion
          const completion = checkProfileCompletion(existingProfile);
          if (!completion.step1Complete) {
            setCurrentStep(1);
          } else if (!completion.step2Complete) {
            setCurrentStep(2);
          } else if (!completion.step3Complete) {
            setCurrentStep(3);
          } else if (!completion.step4Complete) {
            setCurrentStep(4);
          } else {
            // All complete - should create shop and redirect
            setCurrentStep(5); // Completion screen
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Error al cargar tu perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  // ─── Submit Handlers ──────────────────────────────────────────────────────

  const handleSubmitStep1 = async () => {
    if (!user?.id) return;

    // Validación básica
    if (!step1Data.nameShop.trim()) {
      toast.error('El nombre de la tienda es requerido');
      return;
    }
    if (!step1Data.artisanHistory.trim()) {
      toast.error('Tu historia artesanal es requerida');
      return;
    }
    if (step1Data.ageExperience <= 0) {
      toast.error('Selecciona tus años de experiencia');
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = await submitStep1Identity(user.id, step1Data);
      setProfile(updatedProfile);
      toast.success('Bloque 1 guardado correctamente');
      setCurrentStep(2);
    } catch (error) {
      console.error('Error saving step 1:', error);
      toast.error('Error al guardar el bloque 1');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitStep2 = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const updatedProfile = await submitStep2Commercial(user.id, step2Data);
      setProfile(updatedProfile);
      toast.success('Bloque 2 guardado correctamente');
      setCurrentStep(3);
    } catch (error) {
      console.error('Error saving step 2:', error);
      toast.error('Error al guardar el bloque 2');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitStep3 = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const updatedProfile = await submitStep3ClientMarket(user.id, step3Data);
      setProfile(updatedProfile);
      toast.success('Bloque 3 guardado correctamente');
      setCurrentStep(4);
    } catch (error) {
      console.error('Error saving step 3:', error);
      toast.error('Error al guardar el bloque 3');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitStep4 = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const updatedProfile = await submitStep4OperationGrowth(user.id, step4Data);
      setProfile(updatedProfile);
      toast.success('Bloque 4 guardado correctamente');

      // All 4 steps complete - now create shop and redirect
      setCurrentStep(5);
    } catch (error) {
      console.error('Error saving step 4:', error);
      toast.error('Error al guardar el bloque 4');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateShopAndFinish = async () => {
    if (!user?.id || !profile) return;

    setIsSaving(true);
    try {
      // Create shop with basic data from step 1
      const shopSlug = step1Data.nameShop
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      await createArtisanShop({
        userId: user.id,
        shopName: step1Data.nameShop,
        shopSlug: shopSlug,
        creationStatus: 'complete',
        creationStep: 0,
        description: step1Data.shopDescription,
        story: step1Data.shopHistory,
      });

      toast.success('¡Tu tienda ha sido creada exitosamente!');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating shop:', error);
      toast.error(error?.message || 'Error al crear la tienda');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bienvenido a TELAR
          </h1>
          <p className="text-muted-foreground">
            Cuéntanos sobre ti y tu tienda artesanal
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Paso {currentStep} de 4
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / 4) * 100)}% completado
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-card border border-border rounded-lg p-6">
          {/* Step 1: Identidad */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Bloque 1: Identidad Artesanal
              </h2>

              {/* Nombre de la tienda */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre de tu tienda *
                </label>
                <input
                  type="text"
                  value={step1Data.nameShop}
                  onChange={(e) => setStep1Data({ ...step1Data, nameShop: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Ej: Artesanías Don Juan"
                />
              </div>

              {/* Cuéntanos quién eres */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cuéntanos quién eres *
                </label>
                <textarea
                  value={step1Data.artisanHistory}
                  onChange={(e) => setStep1Data({ ...step1Data, artisanHistory: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[120px]"
                  placeholder="Cuéntanos sobre ti, tu trayectoria como artesano..."
                />
              </div>

              {/* Años de experiencia */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Años de experiencia *
                </label>
                <select
                  value={step1Data.ageExperience}
                  onChange={(e) => setStep1Data({ ...step1Data, ageExperience: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value={0}>Selecciona un rango</option>
                  <option value={1}>0-2 años</option>
                  <option value={3}>2-4 años</option>
                  <option value={5}>Más de 4 años</option>
                </select>
              </div>

              {/* Historia de tu tienda */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Historia de tu tienda *
                </label>
                <textarea
                  value={step1Data.shopHistory}
                  onChange={(e) => setStep1Data({ ...step1Data, shopHistory: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[120px]"
                  placeholder="¿Cómo nació tu tienda? ¿Qué te inspiró?"
                />
              </div>

              {/* Qué haces */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Qué haces? *
                </label>
                <textarea
                  value={step1Data.shopDescription}
                  onChange={(e) => setStep1Data({ ...step1Data, shopDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px]"
                  placeholder="Describe qué tipo de productos creas..."
                />
              </div>

              {/* Qué significa para ti */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Qué significa para ti lo que haces? *
                </label>
                <textarea
                  value={step1Data.shopDefinition}
                  onChange={(e) => setStep1Data({ ...step1Data, shopDefinition: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px]"
                  placeholder="¿Qué representa tu trabajo para ti?"
                />
              </div>

              {/* Categoría (temporal - usar ID estático por ahora) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categoría de tu tienda *
                </label>
                <input
                  type="text"
                  value={step1Data.shopCategoriesId}
                  onChange={(e) => setStep1Data({ ...step1Data, shopCategoriesId: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="ID de categoría (temporal)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Por ahora ingresa el ID de categoría. Próximamente será un selector.
                </p>
              </div>

              {/* Qué te hace especial */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Qué te hace especial? *
                </label>
                <input
                  type="text"
                  value={step1Data.shopSpecialDefinitionOne}
                  onChange={(e) => setStep1Data({ ...step1Data, shopSpecialDefinitionOne: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                  placeholder="Primera característica especial"
                />
                <input
                  type="text"
                  value={step1Data.shopSpecialDefinitionTwo || ''}
                  onChange={(e) => setStep1Data({ ...step1Data, shopSpecialDefinitionTwo: e.target.value || null })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                  placeholder="Segunda característica (opcional)"
                />
                <input
                  type="text"
                  value={step1Data.shopSpecialDefinitionThree || ''}
                  onChange={(e) => setStep1Data({ ...step1Data, shopSpecialDefinitionThree: e.target.value || null })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Tercera característica (opcional)"
                />
              </div>

              {/* Historia de origen */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Historia de origen de tu trabajo *
                </label>
                <input
                  type="text"
                  value={step1Data.shopBornSpecialDefinitionOne}
                  onChange={(e) => setStep1Data({ ...step1Data, shopBornSpecialDefinitionOne: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                  placeholder="¿Cómo comenzó todo?"
                />
                <input
                  type="text"
                  value={step1Data.shopBornSpecialDefinitionTwo || ''}
                  onChange={(e) => setStep1Data({ ...step1Data, shopBornSpecialDefinitionTwo: e.target.value || null })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                  placeholder="Detalles adicionales (opcional)"
                />
                <input
                  type="text"
                  value={step1Data.shopBornSpecialDefinitionThree || ''}
                  onChange={(e) => setStep1Data({ ...step1Data, shopBornSpecialDefinitionThree: e.target.value || null })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Más detalles (opcional)"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={handleSubmitStep1}
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Continuar'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Comercial */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Bloque 2: Información Comercial
              </h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Cómo defines tus precios? *
                </label>
                <textarea
                  value={step2Data.shopRangePayment}
                  onChange={(e) => setStep2Data({ ...step2Data, shopRangePayment: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px]"
                  placeholder="Describe tu modelo de precios..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Conoces tus costos? *
                </label>
                <textarea
                  value={step2Data.shopKnowledgeCost}
                  onChange={(e) => setStep2Data({ ...step2Data, shopKnowledgeCost: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px]"
                  placeholder="¿Tienes claridad sobre tus costos?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Cómo defines tus costos? *
                </label>
                <textarea
                  value={step2Data.shopKnowledgeDefineCost}
                  onChange={(e) => setStep2Data({ ...step2Data, shopKnowledgeDefineCost: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px]"
                  placeholder="¿Qué incluyes en tus costos?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Tu negocio es rentable? *
                </label>
                <textarea
                  value={step2Data.shopKnowledgeIsProfitable}
                  onChange={(e) => setStep2Data({ ...step2Data, shopKnowledgeIsProfitable: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px]"
                  placeholder="Cuéntanos sobre la rentabilidad de tu negocio..."
                />
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                >
                  Anterior
                </button>
                <button
                  onClick={handleSubmitStep2}
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Continuar'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Cliente/Mercado */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Bloque 3: Clientes y Mercado
              </h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Quiénes son tus principales compradores? *
                </label>
                <input
                  type="text"
                  value={step3Data.shopKnowledgeMainBuyerOne}
                  onChange={(e) => setStep3Data({ ...step3Data, shopKnowledgeMainBuyerOne: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                  placeholder="Principal tipo de cliente"
                />
                <input
                  type="text"
                  value={step3Data.shopKnowledgeMainBuyerTwo || ''}
                  onChange={(e) => setStep3Data({ ...step3Data, shopKnowledgeMainBuyerTwo: e.target.value || null })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                  placeholder="Segundo tipo de cliente (opcional)"
                />
                <input
                  type="text"
                  value={step3Data.shopKnowledgeMainBuyerThree || ''}
                  onChange={(e) => setStep3Data({ ...step3Data, shopKnowledgeMainBuyerThree: e.target.value || null })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Tercer tipo de cliente (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Tienes presencia digital? *
                </label>
                <textarea
                  value={step3Data.shopKnowledgeDigitalPresence}
                  onChange={(e) => setStep3Data({ ...step3Data, shopKnowledgeDigitalPresence: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px]"
                  placeholder="¿Tienes redes sociales, página web?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Dónde vendes? *
                </label>
                <input
                  type="text"
                  value={step3Data.shopKnowledgeWhereSaleOne}
                  onChange={(e) => setStep3Data({ ...step3Data, shopKnowledgeWhereSaleOne: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                  placeholder="Principal canal de venta"
                />
                <input
                  type="text"
                  value={step3Data.shopKnowledgeWhereSaleTwo || ''}
                  onChange={(e) => setStep3Data({ ...step3Data, shopKnowledgeWhereSaleTwo: e.target.value || null })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                  placeholder="Segundo canal (opcional)"
                />
                <input
                  type="text"
                  value={step3Data.shopKnowledgeWhereSaleThree || ''}
                  onChange={(e) => setStep3Data({ ...step3Data, shopKnowledgeWhereSaleThree: e.target.value || null })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Tercer canal (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Cómo es tu actividad de ventas? *
                </label>
                <textarea
                  value={step3Data.shopKnowledgeSalesActivity}
                  onChange={(e) => setStep3Data({ ...step3Data, shopKnowledgeSalesActivity: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px]"
                  placeholder="Describe tu actividad de ventas..."
                />
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                >
                  Anterior
                </button>
                <button
                  onClick={handleSubmitStep3}
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Continuar'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Operaciones/Crecimiento */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Bloque 4: Operaciones y Crecimiento
              </h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Cuántos productos haces al mes? *
                </label>
                <input
                  type="text"
                  value={step4Data.shopKnowledgeProductsMakeMonth}
                  onChange={(e) => setStep4Data({ ...step4Data, shopKnowledgeProductsMakeMonth: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Ej: 50 productos, 20 piezas, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Cuáles son tus limitaciones hoy? *
                </label>
                <input
                  type="text"
                  value={step4Data.shopKnowledgeLimitTodayOne}
                  onChange={(e) => setStep4Data({ ...step4Data, shopKnowledgeLimitTodayOne: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                  placeholder="Principal limitación"
                />
                <input
                  type="text"
                  value={step4Data.shopKnowledgeLimitTodayTwo || ''}
                  onChange={(e) => setStep4Data({ ...step4Data, shopKnowledgeLimitTodayTwo: e.target.value || null })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-2"
                  placeholder="Segunda limitación (opcional)"
                />
                <input
                  type="text"
                  value={step4Data.shopKnowledgeLimitTodayThree || ''}
                  onChange={(e) => setStep4Data({ ...step4Data, shopKnowledgeLimitTodayThree: e.target.value || null })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Tercera limitación (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Cuántas personas trabajan contigo? *
                </label>
                <input
                  type="text"
                  value={step4Data.shopManyWorkers}
                  onChange={(e) => setStep4Data({ ...step4Data, shopManyWorkers: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Ej: Solo yo, 2 personas, 5 personas, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Cómo puede TELAR ayudarte a resolver tu primer problema? *
                </label>
                <textarea
                  value={step4Data.shopFirstSolvingTelar}
                  onChange={(e) => setStep4Data({ ...step4Data, shopFirstSolvingTelar: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px]"
                  placeholder="¿Qué esperas de TELAR?"
                />
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                >
                  Anterior
                </button>
                <button
                  onClick={handleSubmitStep4}
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Finalizar'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Completion - Create Shop */}
          {currentStep === 5 && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-foreground">
                ¡Perfecto! Has completado todos los bloques
              </h2>

              <p className="text-muted-foreground">
                Ahora vamos a crear tu tienda en TELAR con toda la información que compartiste.
              </p>

              <button
                onClick={handleCreateShopAndFinish}
                disabled={isSaving}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-lg font-medium"
              >
                {isSaving ? 'Creando tu tienda...' : 'Crear mi tienda'}
              </button>
            </div>
          )}
        </div>

        {/* Draft Save Info */}
        {currentStep < 5 && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Tu progreso se guarda automáticamente. Puedes continuar más tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentFormPage;
