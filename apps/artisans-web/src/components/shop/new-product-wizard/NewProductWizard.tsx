import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getArtisanShopByUserId, getStoreByUserId } from '@/services/artisanShops.actions';
import { getArtisanIdentityByUserId } from '@/services/artisan-identity.actions';
import { getProductNewById } from '@/services/products-new.actions';
import { useNewWizardState } from './hooks/useNewWizardState';
import { useWizardDraft } from './hooks/useWizardDraft';
import { Step1NewPiece } from './steps/Step1NewPiece';
import { Step2ArtisanalIdentity } from './steps/Step2ArtisanalIdentity';
import { Step3ProcessTime } from './steps/Step3ProcessTime';
import { Step4PriceLogistics } from './steps/Step4PriceLogistics';
import { Step5DigitalPassport } from './steps/Step5DigitalPassport';
import { Step6FinalReview } from './steps/Step6FinalReview';
import { toast } from 'sonner';

const TOTAL_STEPS = 6;

export const NewProductWizard: React.FC = () => {
  const urlParamsInit = new URLSearchParams(window.location.search);
  const [currentStep, setCurrentStep] = useState(urlParamsInit.get('edit') === 'true' ? TOTAL_STEPS : 1);
  const [hasShop, setHasShop] = useState<boolean | null>(null);
  const [isCheckingShop, setIsCheckingShop] = useState(true);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [shopId, setShopId] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successProductName, setSuccessProductName] = useState('');
  const navigate = useNavigate();

  const { user } = useAuth();

  const isEditMode = urlParamsInit.get('edit') === 'true';
  const productIdToEdit = urlParamsInit.get('productId') ?? undefined;
  const shouldContinue = urlParamsInit.get('continue') === 'true';

  const { state, update, reset } = useNewWizardState(shouldContinue);
  const { saveDraft, isSavingDraft } = useWizardDraft(state, update, shopId, false);
  const { saveDraft: autoSave } = useWizardDraft(state, update, shopId, true);

  useEffect(() => {
    if (!user) return;

    const legacyPromise = getArtisanShopByUserId(user.id)
      .then(shop => {
        setHasShop(!!shop?.id);
        if (shop?.id) {
          setShopId(shop.id);
          const dept = shop.department || shop.region || null;
          if (dept && !state.department) update({ department: dept });
          if (shop.municipality && !state.municipality) update({ municipality: shop.municipality });

          // Pre-fill process and tools from artisan profile when not already set
          const profile = (shop as any).artisanProfile as Record<string, any> | undefined;
          if (profile?.creationProcess && !state.processDescription) {
            update({ processDescription: profile.creationProcess });
          }
          if (profile?.workshopTools?.length && !state.tools?.length) {
            update({ tools: profile.workshopTools });
          }
        }
      })
      .catch(() => setHasShop(false))
      .finally(() => setIsCheckingShop(false));

    // Pre-cargar oficio primario desde StoreArtisanalProfile
    getStoreByUserId(user.id)
      .then(store => {
        const craftId = (store as any)?.artisanalProfile?.primaryCraftId;
        if (craftId && !state.craftId) update({ craftId });
      })
      .catch(() => {});

    // Pre-cargar técnica primaria desde ArtisanIdentity
    getArtisanIdentityByUserId(user.id)
      .then(identity => {
        if (!identity) return;
        const updates: Record<string, string> = {};
        if (identity.techniquePrimaryId && !state.primaryTechniqueId)
          updates.primaryTechniqueId = identity.techniquePrimaryId;
        if (identity.techniqueSecondaryId && !state.secondaryTechniqueId)
          updates.secondaryTechniqueId = identity.techniqueSecondaryId;
        if (Object.keys(updates).length) update(updates as any);
      })
      .catch(() => {});

    void legacyPromise;
  }, [user]);

  useEffect(() => {
    if (!isEditMode || !productIdToEdit) return;
    setIsLoadingEdit(true);
    getProductNewById(productIdToEdit)
      .then(product => {
        if (!product) {
          toast.error('No se encontró el producto para editar');
          return;
        }
        const primaryVariant = product.variants?.find(v => v.isActive) || product.variants?.[0];
        const images = product.media
          ?.filter(m => m.mediaType === 'image')
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(m => m.mediaUrl) || [];

        update({
          productId: product.id,
          status: product.status as any,
          name: product.name,
          shortDescription: product.shortDescription,
          artisanalHistory: product.history || undefined,
          images,
          categoryId: product.categoryId || undefined,
          materials: product.materials?.map(m => m.materialId) || [],
          // artisanal identity
          craftId: product.artisanalIdentity?.primaryCraftId || undefined,
          primaryTechniqueId: product.artisanalIdentity?.primaryTechniqueId || undefined,
          secondaryTechniqueId: product.artisanalIdentity?.secondaryTechniqueId || undefined,
          elaborationTime: product.artisanalIdentity?.estimatedElaborationTime || undefined,
          isCollaboration: product.artisanalIdentity?.isCollaboration ?? false,
          purpose: product.artisanalIdentity?.pieceType as any,
          styles: product.artisanalIdentity?.style ? [product.artisanalIdentity.style as any] : undefined,
          // physical specs
          heightCm: product.physicalSpecs?.heightCm || undefined,
          widthCm: product.physicalSpecs?.widthCm || undefined,
          lengthCm: product.physicalSpecs?.lengthOrDiameterCm || undefined,
          weightKg: product.physicalSpecs?.realWeightKg || undefined,
          // logistics
          packagedWeightKg: product.logistics?.packWeightKg || undefined,
          packagedWidthCm: product.logistics?.packWidthCm || undefined,
          packagedHeightCm: product.logistics?.packHeightCm || undefined,
          packagedLengthCm: product.logistics?.packLengthCm || undefined,
          shippingRestrictions: product.logistics?.specialProtectionNotes || undefined,
          specialHandling: product.logistics?.fragility === 'alto',
          // production
          availabilityType: product.production?.availabilityType as any,
          monthlyCapacity: product.production?.monthlyCapacity || undefined,
          // pricing
          price: primaryVariant?.basePriceMinor
            ? Math.round(parseInt(primaryVariant.basePriceMinor) / 100 / 1.05)
            : undefined,
          sku: primaryVariant?.sku || undefined,
          inventory: primaryVariant?.stockQuantity || undefined,
        });
      })
      .catch(err => {
        console.error('[EditMode] Error cargando producto:', err);
        toast.error('No se pudo cargar el producto para editar');
      })
      .finally(() => setIsLoadingEdit(false));
  }, [isEditMode, productIdToEdit]);

  const goNext = () => {
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS));
    // Auto-save silently on every step advance (fire-and-forget)
    void autoSave();
  };

  const goBack = () => {
    if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep(s => s - 1);
    }
  };
  const goToStep = (n: number) => setCurrentStep(n);

  const handlePublished = () => {
    setSuccessProductName(state.name);
    setShowSuccess(true);
    reset();
  };

  const handleUploadAnother = () => {
    setShowSuccess(false);
    setCurrentStep(1);
  };

  if (showSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div
          className="max-w-lg w-full rounded-2xl p-10 text-center"
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.65)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)',
          }}
        >
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(22,101,52,0.1)' }}
          >
            <span className="material-symbols-outlined text-[40px]" style={{ color: '#166534' }}>
              check_circle
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-['Noto_Serif'] text-3xl font-bold text-[#151b2d] mb-3">
            ¡Pieza enviada!
          </h1>

          {/* Product name */}
          {successProductName && (
            <p
              className="inline-block px-4 py-1.5 rounded-full font-['Manrope'] text-[13px] font-[700] mb-5"
              style={{ background: 'rgba(236,109,19,0.1)', color: '#ec6d13' }}
            >
              {successProductName}
            </p>
          )}

          {/* Explanation */}
          <p className="font-['Manrope'] text-[15px] font-[500] text-[#54433e]/80 leading-relaxed mb-8">
            Tu pieza está en revisión por el equipo de TELAR. Te avisaremos cuando sea aprobada para el marketplace. Mientras tanto la puedes ver en tu dashboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/mi-tienda')}
              className="flex-1 py-3.5 rounded-full font-['Manrope'] text-[14px] font-[700] text-white transition-opacity hover:opacity-90"
              style={{ background: '#ec6d13' }}
            >
              Ir al dashboard
            </button>
            <button
              onClick={handleUploadAnother}
              className="flex-1 py-3.5 rounded-full font-['Manrope'] text-[14px] font-[700] transition-colors"
              style={{
                background: 'transparent',
                border: '1.5px solid rgba(84,67,62,0.2)',
                color: '#54433e',
              }}
            >
              Registrar otra pieza
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCheckingShop || isLoadingEdit) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#ec6d13]/20 border-t-[#ec6d13] rounded-full animate-spin mx-auto" />
          <p className="font-['Manrope'] text-[#54433e]/60 text-sm font-[500]">
            {isLoadingEdit ? 'Cargando producto…' : 'Verificando tu tienda…'}
          </p>
        </div>
      </div>
    );
  }

  if (hasShop === false) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="max-w-md w-full p-10 text-center rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.65)',
          }}
        >
          <span className="material-symbols-outlined block text-[56px] text-[#ec6d13] mb-6">store</span>
          <h2 className="font-['Noto_Serif'] text-2xl font-bold text-[#151b2d] mb-3">
            Primero crea tu tienda
          </h2>
          <p className="font-['Manrope'] text-[#54433e]/70 text-sm leading-relaxed mb-8">
            Para registrar una pieza, necesitas tener una tienda activa en TELAR.
          </p>
          <button
            onClick={() => (window.location.href = '/crear-tienda')}
            className="bg-[#ec6d13] text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Crear mi tienda
          </button>
        </div>
      </div>
    );
  }

  const stepProps = {
    state,
    update,
    onNext: goNext,
    onBack: goBack,
    onSaveDraft: saveDraft,
    isSavingDraft,
    step: currentStep,
    totalSteps: TOTAL_STEPS,
    isEditMode,
    artisanId: user?.id ?? '',
    userId: user?.id ?? '',
  };

  return (
    <div
      className="flex-1 overflow-y-auto"
    >
      {currentStep === 1 && <Step1NewPiece {...stepProps} />}
      {currentStep === 2 && <Step2ArtisanalIdentity {...stepProps} />}
      {currentStep === 3 && <Step3ProcessTime {...stepProps} />}
      {currentStep === 4 && <Step4PriceLogistics {...stepProps} />}
      {currentStep === 5 && <Step5DigitalPassport {...stepProps} onGoToStep={goToStep} />}
      {currentStep === 6 && (
        <Step6FinalReview
          {...stepProps}
          shopId={shopId}
          onGoToStep={goToStep}
          onPublished={handlePublished}
        />
      )}
    </div>
  );
};
