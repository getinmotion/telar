import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createProductNew, updateProductNew } from '@/services/products-new.actions';
import type { CreateProductsNewDto } from '@/services/products-new.types';
import type { NewWizardState } from './useNewWizardState';
import { composeVariantName } from '@telar/shared-types/products';

const priceToMinor = (price: number): string => String(Math.round(price * 100));

const isUUID = (v: string | undefined | null): v is string =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** Convierte un valor (puede venir como string del form/localStorage) a number o undefined */
const toNum = (v: string | number | undefined | null): number | undefined => {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

export const extractApiError = (err: any): string => {
  const nested = err?.response?.data?.message?.response?.message;
  if (Array.isArray(nested) && nested.length > 0) return nested.join(', ');
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg) && msg.length > 0) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return err?.message || 'Error desconocido';
};

export const mapNewStateToDto = (
  state: NewWizardState,
  storeId: string,
  uploadedImageUrls: string[],
  publish: boolean,
): CreateProductsNewDto => {
  const dto: CreateProductsNewDto = {
    storeId,
    productId: state.productId,
    ...(isUUID(state.categoryId) && { categoryId: state.categoryId }),
    name: state.name.trim(),
    shortDescription: state.shortDescription.trim(),
    history: state.artisanalHistory?.trim() || undefined,
    careNotes: state.careNotes?.trim() || undefined,
    status: publish ? 'pending_moderation' : 'draft',
    media: uploadedImageUrls.map((url, i) => ({
      mediaUrl: url,
      mediaType: 'image' as const,
      isPrimary: i === 0,
      displayOrder: i,
    })),
  };

  const firstStyle = (state.styles ?? [])[0] ?? state.style;
  if (state.craftId || state.primaryTechniqueId || firstStyle || state.elaborationTime) {
    dto.artisanalIdentity = {
      ...(isUUID(state.craftId) && { primaryCraftId: state.craftId }),
      ...(isUUID(state.primaryTechniqueId) && { primaryTechniqueId: state.primaryTechniqueId }),
      ...(isUUID(state.secondaryTechniqueId) && { secondaryTechniqueId: state.secondaryTechniqueId }),
      pieceType: state.purpose === 'funcional' ? 'funcional'
        : state.purpose === 'decorativa' ? 'decorativa'
        : undefined,
      style: firstStyle === 'tradicional' ? 'tradicional'
        : firstStyle === 'contemporaneo' ? 'contemporaneo'
        : firstStyle === 'fusion' ? 'fusion'
        : undefined,
      isCollaboration: state.isCollaboration ?? false,
      collaborationName: state.collaboration?.name?.trim() || undefined,
      estimatedElaborationTime: state.elaborationTime || undefined,
    };
  }

  if (state.heightCm || state.widthCm || state.lengthCm || state.weightKg) {
    dto.physicalSpecs = {
      heightCm: toNum(state.heightCm),
      widthCm: toNum(state.widthCm),
      lengthOrDiameterCm: toNum(state.lengthCm),
      realWeightKg: toNum(state.weightKg),
    };
  }

  if (state.packagedWeightKg || state.packagedWidthCm || state.shippingRestrictions) {
    dto.logistics = {
      packWeightKg: toNum(state.packagedWeightKg),
      packWidthCm: toNum(state.packagedWidthCm),
      packHeightCm: toNum(state.packagedHeightCm),
      packLengthCm: toNum(state.packagedLengthCm),
      specialProtectionNotes: state.shippingRestrictions,
      fragility: state.specialHandling ? 'alto' : 'bajo',
    };
  }

  if (state.availabilityType) {
    dto.production = {
      availabilityType: state.availabilityType,
      monthlyCapacity: state.monthlyCapacity,
      processDescription: state.processDescription?.trim() || undefined,
      processEvidenceUrls: (state.processEvidenceUrls ?? []).filter(u => u && !u.startsWith('blob:')).length > 0
        ? (state.processEvidenceUrls ?? []).filter(u => u && !u.startsWith('blob:'))
        : undefined,
    };
  }

  const uuidMaterials = state.materials.filter(isUUID);
  if (uuidMaterials.length > 0) {
    dto.materials = uuidMaterials.map((m, i) => ({
      materialId: m,
      isPrimary: i === 0,
    }));
  }

  // Precio del comprador = precio del vendedor + cargo de servicio (5%)
  const toBuyerPriceMinor = (sellerPrice: number) =>
    priceToMinor(Math.round(sellerPrice * 1.05));

  if (state.hasVariants && (state.variants?.length ?? 0) > 0) {
    dto.variants = state.variants!
      .filter(v => (v.price ?? state.price ?? 0) > 0)
      .map(v => ({
        ...(v.id && { id: v.id }),
        variantName: composeVariantName(v.optionValues) || undefined,
        optionValues: v.optionValues,
        stockQuantity: v.stock ?? 0,
        minStock: v.minStock ?? 0,
        basePriceMinor: toBuyerPriceMinor(v.price ?? state.price!),
        currency: 'COP',
        sku: v.sku,
        isActive: v.isActive,
      }));
  } else if (state.price && state.price > 0) {
    dto.variants = [
      {
        ...(isUUID(state.primaryVariantId) && { id: state.primaryVariantId }),
        stockQuantity: state.inventory ?? 1,
        minStock: state.minimumStockAlert ?? 0,
        basePriceMinor: toBuyerPriceMinor(state.price),
        currency: 'COP',
        sku: state.sku,
        isActive: true,
      },
    ];
  }

  // Add content metadata if available (for analytics)
  if (state.fieldMetadata) {
    dto.contentMetadata = {
      shortDescriptionSource: state.fieldMetadata.shortDescription?.source,
      historySource: state.fieldMetadata.artisanalHistory?.source,
    };
  }

  return dto;
};

export const useWizardDraft = (
  state: NewWizardState,
  update: (u: Partial<NewWizardState>) => void,
  shopId: string,
) => {
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Ref para rastrear el productId de forma inmediata (evita race conditions entre renders)
  const productIdRef = useRef<string | undefined>(state.productId);
  // Mutex: evita que dos llamadas concurrentes creen productos duplicados
  const creatingRef = useRef(false);

  // Mantener el ref sincronizado cuando el state cambia (ej. modo edición)
  if (state.productId && state.productId !== productIdRef.current) {
    productIdRef.current = state.productId;
  }

  const saveDraft = useCallback(async (silent = false) => {
    if (!shopId || !state.name.trim() || !state.shortDescription.trim()) return;
    setIsSavingDraft(true);
    try {
      // Extraer URLs ya subidas desde state.images (las que son string, no File)
      const uploadedUrls = (state.images ?? []).filter((img): img is string => typeof img === 'string');
      const dto = mapNewStateToDto(state, shopId, uploadedUrls, false);
      const existingId = productIdRef.current ?? state.productId;

      if (existingId) {
        await updateProductNew(existingId, dto, { suppressToast: true });
      } else {
        // Evitar creates concurrentes
        if (creatingRef.current) return;
        creatingRef.current = true;
        try {
          // En el primer create (Step 1) solo enviar datos básicos, sin artisanalIdentity
          delete dto.artisanalIdentity;
          const result = await createProductNew(dto, { suppressToast: true });
          const newId = (result as any)?.id ?? (result as any)?.productId;
          if (newId) {
            productIdRef.current = newId;
            update({ productId: newId });
          }
        } finally {
          creatingRef.current = false;
        }
      }
      if (!silent) toast.success('Borrador guardado');
    } catch (err: any) {
      if (!silent) toast.error(`No se pudo guardar: ${extractApiError(err)}`);
    } finally {
      setIsSavingDraft(false);
    }
  }, [state, shopId, update]);

  return { saveDraft, isSavingDraft };
};
