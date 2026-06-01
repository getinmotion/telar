import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import { useImageUpload } from '@/components/shop/ai-upload/hooks/useImageUpload';
import { createProductNew, updateProductNew } from '@/services/products-new.actions';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';
import { getAllCategories } from '@/services/categories.actions';
import { getAllCrafts, getTechniquesByCraftId } from '@/services/crafts.actions';
import { getAllMaterials } from '@/services/materials.actions';
import type { CreateProductsNewDto } from '@/services/products-new.types';
import type { NewWizardState } from '../hooks/useNewWizardState';
import { mapNewStateToDto, extractApiError } from '../hooks/useWizardDraft';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';

interface Props {
  state: NewWizardState;
  update: (updates: Partial<NewWizardState>) => void;
  onBack: () => void;
  onGoToStep: (n: number) => void;
  onPublished: () => void;
  shopId: string;
  step: number;
  totalSteps: number;
}


const glassCard = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)',
};

const NameChip = ({ label, subtle }: { label: string; subtle?: boolean }) => (
  <span
    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[600]"
    style={
      subtle
        ? { background: 'rgba(84,67,62,0.06)', color: '#54433e' }
        : { background: 'rgba(236,109,19,0.1)', color: '#ec6d13', border: '1px solid rgba(236,109,19,0.2)' }
    }
  >
    {label}
  </span>
);

const StatusBadge = ({ status }: { status: 'ready' | 'pending' }) =>
  status === 'ready' ? (
    <span
      className="inline-block px-3 py-1 rounded-full font-['Manrope'] text-[10px] font-[800] tracking-widest uppercase"
      style={{ background: 'rgba(22,101,52,0.1)', color: '#166534' }}
    >
      Listo para revisión
    </span>
  ) : (
    <span
      className="inline-block px-3 py-1 rounded-full font-['Manrope'] text-[10px] font-[800] tracking-widest uppercase"
      style={{ background: 'rgba(236,109,19,0.1)', color: '#ec6d13' }}
    >
      Incompleto
    </span>
  );

const EditButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="font-['Manrope'] text-[14px] font-[500] text-[#ec6d13] hover:underline inline-flex items-center gap-1"
  >
    Editar{' '}
    <span className="material-symbols-outlined text-[16px]">edit</span>
  </button>
);

export const Step6FinalReview: React.FC<Props> = ({
  state,
  update,
  onBack,
  onGoToStep,
  onPublished,
  shopId,
  step,
  totalSteps,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [craftName, setCraftName] = useState<string | null>(null);
  const [techniqueName, setTechniqueName] = useState<string | null>(null);
  const [materialNames, setMaterialNames] = useState<string[]>([]);
  const { uploadImages } = useImageUpload();
  const { user: authUser } = useAuth();
  const { user: storeUser } = useAuthStore();
  const user = authUser ?? storeUser;

  // Resolve UUIDs → human-readable names
  useEffect(() => {
    if (state.categoryId) {
      getAllCategories()
        .then(cats => setCategoryName(cats.find(c => c.id === state.categoryId)?.name ?? null))
        .catch(() => {});
    }
  }, [state.categoryId]);

  useEffect(() => {
    getAllCrafts()
      .then(crafts => {
        const craft = crafts.find(c => c.id === state.craftId);
        setCraftName(craft?.name ?? null);
        if (craft && state.primaryTechniqueId) {
          getTechniquesByCraftId(craft.id)
            .then(techs => setTechniqueName(techs.find(t => t.id === state.primaryTechniqueId)?.name ?? null))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [state.craftId, state.primaryTechniqueId]);

  useEffect(() => {
    if (state.materials.length > 0) {
      getAllMaterials()
        .then(mats => {
          const names = state.materials
            .map(id => mats.find(m => m.id === id)?.name)
            .filter(Boolean) as string[];
          setMaterialNames(names);
        })
        .catch(() => {});
    } else {
      setMaterialNames([]);
    }
  }, [state.materials]);

  const mainPreview =
    state.images[0]
      ? typeof state.images[0] === 'string'
        ? state.images[0]
        : URL.createObjectURL(state.images[0])
      : null;

  const resolveStoreId = async (): Promise<string | null> => {
    if (shopId) return shopId;
    if (!user) return null;
    try {
      const shop = await getArtisanShopByUserId(user.id);
      return shop?.id ?? null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Sesión expirada. Recarga la página.');
      return;
    }
    setIsSubmitting(true);
    try {
      const storeId = await resolveStoreId();
      if (!storeId) {
        toast.error('No se encontró tu tienda. Recarga la página.');
        return;
      }

      const imageFiles = state.images.filter((img): img is File => img instanceof File);
      const existingUrls = state.images.filter((img): img is string => typeof img === 'string');

      let newUrls: string[] = [];
      if (imageFiles.length > 0) {
        try {
          newUrls = await uploadImages(imageFiles);
        } catch (uploadErr) {
          console.warn('[Step6] Falló subida de imágenes, continuando sin ellas:', uploadErr);
          toast.warning('No se pudieron subir algunas imágenes. La pieza se guardará sin ellas.');
        }
      }

      const allUrls = [...existingUrls, ...newUrls];
      const dto = mapNewStateToDto(state, storeId, allUrls, true);
      console.log('[Step6] Enviando DTO:', JSON.stringify(dto, null, 2));
      if (state.productId) {
        await updateProductNew(state.productId, dto, { suppressToast: true });
      } else {
        await createProductNew(dto, { suppressToast: true });
      }
      onPublished();
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data;
      console.error('[Step6] Error al enviar pieza — status:', status, '— body:', JSON.stringify(detail, null, 2), '— err:', err);
      toast.error(`No se pudo enviar la pieza (${status ?? 'sin respuesta'}): ${extractApiError(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error('Sesión expirada. Recarga la página.');
      return;
    }
    setIsSavingDraft(true);
    try {
      const storeId = await resolveStoreId();
      if (!storeId) {
        toast.error('No se encontró tu tienda. Recarga la página.');
        return;
      }
      const dto = mapNewStateToDto(state, storeId, [], false);
      console.log('[Step6] Guardando borrador DTO:', JSON.stringify(dto, null, 2));
      if (state.productId) {
        await updateProductNew(state.productId, dto, { suppressToast: true });
      } else {
        const result = await createProductNew(dto, { suppressToast: true });
        const newId = (result as any)?.id ?? (result as any)?.productId;
        if (newId) update({ productId: newId });
      }
      toast.success('Borrador guardado');
    } catch (err: any) {
      console.error('[Step6] Error al guardar borrador:', err);
      toast.error(`No se pudo guardar: ${extractApiError(err)}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const originText = [state.municipality, state.department, state.country]
    .filter(Boolean)
    .join(', ') || '—';

  const dimensionsText =
    state.heightCm && state.widthCm && state.lengthCm
      ? `${state.heightCm} × ${state.widthCm} × ${state.lengthCm} cm | ${state.weightKg ?? '?'} kg`
      : '—';

  const packText =
    state.packagedWidthCm && state.packagedHeightCm && state.packagedLengthCm
      ? `${state.packagedWidthCm} × ${state.packagedHeightCm} × ${state.packagedLengthCm} cm | ${state.packagedWeightKg ?? '?'} kg`
      : '—';

  return (
    <div className="min-h-screen pb-32" style={{ background: 'transparent' }}>
      <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        <WizardHeader
          step={step}
          totalSteps={totalSteps}
          onBack={onBack}
          icon="fact_check"
          title="Revisión final"
          subtitle="Verifica la información antes de enviar a curaduría"
        />

        {/* Info block */}
        <div
          className="rounded-lg p-6 mb-8 flex items-start gap-4"
          style={glassCard}
        >
          <span className="material-symbols-outlined text-[#166534] mt-1">info</span>
          <p className="font-['Manrope'] text-[14px] font-[500] text-[#54433e]">
            El pasaporte digital permanecerá en estado preparado hasta la aprobación del producto para marketplace.
          </p>
        </div>

        {/* Review grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Card 1: La pieza */}
          <div className="rounded-lg p-6 flex flex-col justify-between" style={glassCard}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#151b2d]">La pieza</h3>
                <StatusBadge status={state.name && state.shortDescription ? 'ready' : 'pending'} />
              </div>
              <div className="flex gap-4">
                {mainPreview && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: 'rgba(255,255,255,0.65)' }}>
                    <img alt={state.name} className="w-full h-full object-cover" src={mainPreview} />
                  </div>
                )}
                <div>
                  <p className="font-['Manrope'] text-[18px] font-bold mb-1">{state.name || '—'}</p>
                  <p className="font-['Manrope'] text-[14px] font-[500] text-[#54433e] line-clamp-2">
                    {state.shortDescription || '—'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-right">
              <EditButton onClick={() => onGoToStep(1)} />
            </div>
          </div>

          {/* Card 2: Identidad y origen */}
          <div className="rounded-lg p-6 flex flex-col justify-between" style={glassCard}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#151b2d]">Identidad y origen</h3>
                <StatusBadge status={state.categoryId ? 'ready' : 'pending'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Categoría', value: categoryName ?? (state.categoryId ? '…' : '—') },
                  { label: 'Estilo', value: state.style ?? '—' },
                  { label: 'Origen', value: originText },
                  { label: 'Taller', value: state.workshopName ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="font-['Manrope'] text-[10px] font-[800] text-[#54433e] mb-1 uppercase tracking-widest">{label}</p>
                    <p className="font-['Manrope'] text-[14px] font-[500]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 text-right">
              <EditButton onClick={() => onGoToStep(2)} />
            </div>
          </div>

          {/* Card 3: Técnica y proceso */}
          <div className="rounded-lg p-6 flex flex-col justify-between" style={glassCard}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#151b2d]">Técnica y proceso</h3>
                <StatusBadge status={state.craftId ? 'ready' : 'pending'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-['Manrope'] text-[10px] font-[800] text-[#54433e] mb-2 uppercase tracking-widest">Oficio</p>
                  {craftName ? (
                    <NameChip label={craftName} />
                  ) : (
                    <p className="font-['Manrope'] text-[14px] font-[500] text-[#54433e]/40">{state.craftId ? '…' : '—'}</p>
                  )}
                  {techniqueName && (
                    <div className="mt-1">
                      <NameChip label={techniqueName} subtle />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-['Manrope'] text-[10px] font-[800] text-[#54433e] mb-2 uppercase tracking-widest">Materiales</p>
                  {materialNames.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {materialNames.map(name => (
                        <NameChip key={name} label={name} subtle />
                      ))}
                    </div>
                  ) : (
                    <p className="font-['Manrope'] text-[14px] font-[500] text-[#54433e]/40">—</p>
                  )}
                </div>
                <div>
                  <p className="font-['Manrope'] text-[10px] font-[800] text-[#54433e] mb-1 uppercase tracking-widest">Elaboración</p>
                  <p className="font-['Manrope'] text-[14px] font-[500]">{state.elaborationTime ?? '—'}</p>
                </div>
                <div>
                  <p className="font-['Manrope'] text-[10px] font-[800] text-[#54433e] mb-1 uppercase tracking-widest">Descripción</p>
                  <p className="font-['Manrope'] text-[14px] font-[500] line-clamp-2">{state.processDescription ?? '—'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-right">
              <EditButton onClick={() => onGoToStep(3)} />
            </div>
          </div>

          {/* Card 4: Evidencia */}
          <div className="rounded-lg p-6 flex flex-col justify-between" style={glassCard}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#151b2d]">Evidencia y trazabilidad</h3>
                <StatusBadge status={state.images.length > 0 ? 'ready' : 'pending'} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#54433e]">photo_library</span>
                  <p className="font-['Manrope'] text-[14px] font-[500]">
                    {state.images.length} fotografía{state.images.length !== 1 ? 's' : ''} adjunta{state.images.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {(state.processEvidenceUrls?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#54433e]">description</span>
                    <p className="font-['Manrope'] text-[14px] font-[500]">Registro de proceso adjunto</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 text-right">
              <EditButton onClick={() => onGoToStep(1)} />
            </div>
          </div>

          {/* Card 5: Precio y logística (full width) */}
          <div className="rounded-lg p-6 flex flex-col justify-between md:col-span-2" style={glassCard}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#151b2d]">Precio y logística</h3>
              <StatusBadge status={state.price && state.inventory && state.availabilityType ? 'ready' : 'pending'} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="font-['Manrope'] text-[10px] font-[800] text-[#54433e] mb-1 uppercase tracking-widest">Precio publicado</p>
                  <p className="font-['Manrope'] text-[18px] font-bold">
                    {state.price ? `$${Math.round(state.price * 1.05).toLocaleString('es-CO')} COP` : '—'}
                  </p>
                  {state.price && (
                    <p className="text-[10px] text-[#54433e]/50 mt-0.5">
                      Base ${state.price.toLocaleString('es-CO')} + 5% TELAR
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-['Manrope'] text-[10px] font-[800] text-[#54433e] mb-1 uppercase tracking-widest">Disponibilidad</p>
                  <p className="font-['Manrope'] text-[14px] font-[500]">
                    {state.availabilityType === 'en_stock' ? `Disponible ahora (${state.inventory ?? 0} un.)`
                      : state.availabilityType === 'bajo_pedido' ? 'Bajo pedido'
                      : state.availabilityType === 'edicion_limitada' ? `Edición limitada (${state.inventory ?? 0} un.)`
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-['Manrope'] text-[10px] font-[800] text-[#54433e] mb-1 uppercase tracking-widest">Dimensiones y peso</p>
                  <p className="font-['Manrope'] text-[14px] font-[500]">{dimensionsText}</p>
                </div>
                <div>
                  <p className="font-['Manrope'] text-[10px] font-[800] text-[#54433e] mb-1 uppercase tracking-widest">Origen despacho</p>
                  <p className="font-['Manrope'] text-[14px] font-[500]">{state.shippingOrigin ?? '—'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-['Manrope'] text-[10px] font-[800] text-[#54433e] mb-1 uppercase tracking-widest">Paquete de envío</p>
                  <p className="font-['Manrope'] text-[14px] font-[500]">{packText}</p>
                  <p className="font-['Manrope'] text-[8px] mt-1 text-[#54433e] italic uppercase tracking-[0.1em]">Para cálculo de envío</p>
                </div>
                <div className="text-right pt-4">
                  <EditButton onClick={() => onGoToStep(4)} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Pasaporte (full width) */}
          <div
            className="rounded-lg p-6 flex flex-col justify-between md:col-span-2"
            style={{
              ...glassCard,
              background: 'linear-gradient(to bottom right, rgba(253,250,246,0.8), rgba(255,255,255,0.68))',
            }}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ec6d13]">verified</span>
                  <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#151b2d]">Pasaporte digital</h3>
                </div>
                <span
                  className="inline-block px-3 py-1 rounded-full font-['Manrope'] text-[10px] font-[800] tracking-widest uppercase"
                  style={{ background: 'rgba(236,109,19,0.1)', color: '#ec6d13' }}
                >
                  Pasaporte preparado
                </span>
              </div>
              <p className="font-['Manrope'] text-[14px] font-[500] text-[#54433e] max-w-3xl">
                TELAR consolidó la información registrada sobre origen, autoría, técnica, materiales y evidencia documental de la pieza. El pasaporte digital se activará únicamente si la pieza es aprobada para marketplace.
              </p>
            </div>
            <div className="mt-4 text-right">
              <EditButton onClick={() => onGoToStep(5)} />
            </div>
          </div>
        </div>
      </main>

      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        isFinalStep
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onSaveDraft={handleSaveDraft}
        isSavingDraft={isSavingDraft}
        leftOffset={80}
      />
    </div>
  );
};
