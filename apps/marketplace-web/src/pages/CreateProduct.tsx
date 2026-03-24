import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { WizardStepper } from '@/components/create-product/WizardStepper';
import { StepLaPieza } from '@/components/create-product/StepLaPieza';
import { StepArtesania } from '@/components/create-product/StepArtesania';
import { StepPrecio } from '@/components/create-product/StepPrecio';
import { StepPublicar } from '@/components/create-product/StepPublicar';
import { createProductV2 } from '@/services/products.actions';
import { useAuth } from '@/contexts/AuthContext';
import type { CreateProductV2Data, WizardStep } from '@/components/create-product/types';

const INITIAL_DATA: CreateProductV2Data = {
  name: '',
  shortDescription: '',
  history: '',
  careNotes: '',
  categoryId: '',
  images: [],
  artisanalIdentity: undefined,
  materials: [],
  price: undefined,
  variants: [],
  production: { availabilityType: 'en_stock' },
  physicalSpecs: undefined,
  shopId: '',
  tags: [],
};

export default function CreateProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<CreateProductV2Data>(() => {
    // Try to restore from localStorage
    const saved = localStorage.getItem('telar_product_draft');
    if (saved) {
      try {
        return { ...INITIAL_DATA, ...JSON.parse(saved) };
      } catch {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  const updateData = useCallback((updates: Partial<CreateProductV2Data>) => {
    setData((prev) => {
      const next = { ...prev, ...updates };
      // Auto-save draft
      localStorage.setItem('telar_product_draft', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleImageUpload = useCallback(
    (files: FileList) => {
      // Provisional: create object URLs for preview
      // In production, these would upload to S3 first
      const newUrls = Array.from(files).map((f) => URL.createObjectURL(f));
      updateData({ images: [...data.images, ...newUrls] });
    },
    [data.images, updateData],
  );

  const goNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // --- MOCK MODE: no llama al API, solo simula ---
      const useMock = !import.meta.env.VITE_BACKEND_URL;
      if (useMock) {
        await new Promise((r) => setTimeout(r, 1200)); // Simular latencia
        const mockId = crypto.randomUUID();
        console.log('[MOCK] Producto creado:', { id: mockId, ...data });
        localStorage.removeItem('telar_product_draft');
        toast({
          title: 'Pieza creada (mock)',
          description: `"${data.name}" se guardó localmente. ID: ${mockId.slice(0, 8)}...`,
        });
        return;
      }
      // --- REAL MODE ---
      const shopId = (user as any)?.shopId ?? data.shopId ?? 'provisional-shop-id';
      const payload = { ...data, shopId };
      const result = await createProductV2(payload);
      localStorage.removeItem('telar_product_draft');
      toast({
        title: 'Pieza creada',
        description: `"${data.name}" se ha creado exitosamente como borrador.`,
      });
      navigate(`/product/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error al crear la pieza',
        description: 'Intenta de nuevo o guarda como borrador.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('telar_product_draft', JSON.stringify(data));
    toast({
      title: 'Borrador guardado',
      description: 'Puedes continuar editando más tarde.',
    });
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return data.name.trim().length > 0 && data.shortDescription.trim().length > 0;
      case 1:
        return true; // Optional step
      case 2:
        return (data.price ?? 0) > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg">
      {/* Header */}
      <div className="border-b border-charcoal/10 bg-editorial-bg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-charcoal/50 hover:text-charcoal transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-[11px] uppercase tracking-widest font-bold">Volver</span>
          </button>
          <div className="text-center">
            <span className="font-serif text-lg text-charcoal">Nueva pieza</span>
          </div>
          <button
            onClick={handleSaveDraft}
            className="text-[11px] uppercase tracking-widest font-bold text-charcoal/40 hover:text-primary transition-colors"
          >
            Guardar borrador
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Stepper */}
        <WizardStepper
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          completedSteps={completedSteps}
        />

        {/* Step content */}
        <div className="mb-16">
          {currentStep === 0 && (
            <StepLaPieza data={data} onChange={updateData} onImageUpload={handleImageUpload} />
          )}
          {currentStep === 1 && <StepArtesania data={data} onChange={updateData} />}
          {currentStep === 2 && <StepPrecio data={data} onChange={updateData} />}
          {currentStep === 3 && (
            <StepPublicar
              data={data}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
            />
          )}
        </div>

        {/* Navigation */}
        {currentStep < 3 && (
          <div className="flex justify-between items-center max-w-3xl mx-auto pt-8 border-t border-charcoal/10">
            <button
              onClick={goPrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-bold transition-all ${
                currentStep === 0
                  ? 'text-charcoal/15 cursor-default'
                  : 'text-charcoal/50 hover:text-charcoal'
              }`}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Anterior
            </button>

            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    s === currentStep ? 'bg-charcoal' : s < currentStep ? 'bg-primary/40' : 'bg-charcoal/15'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={!canGoNext()}
              className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-bold transition-all ${
                canGoNext()
                  ? 'text-charcoal hover:text-primary'
                  : 'text-charcoal/15 cursor-default'
              }`}
            >
              Siguiente
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom quote */}
      <div className="border-t border-charcoal/5 py-8">
        <p className="text-center text-[10px] text-charcoal/25 italic max-w-md mx-auto">
          "Cada pieza artesanal cuenta una historia. Ayúdanos a preservarla para quien la reciba."
        </p>
      </div>
    </div>
  );
}
