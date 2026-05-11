import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { createProductNew, updateProductNew } from '@/services/products-new.actions';
import type { CreateProductsNewDto } from '@/services/products-new.types';
import type { NewWizardState } from './useNewWizardState';

const priceToMinor = (price: number): string => String(Math.round(price * 100));

const isUUID = (v: string | undefined | null): v is string =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

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
    status: publish ? 'pending_moderation' : 'draft',
    media: uploadedImageUrls.map((url, i) => ({
      mediaUrl: url,
      mediaType: 'image' as const,
      isPrimary: i === 0,
      displayOrder: i,
    })),
  };

  if (state.craftId || state.primaryTechniqueId || state.style || state.elaborationTime) {
    dto.artisanalIdentity = {
      ...(isUUID(state.craftId) && { primaryCraftId: state.craftId }),
      ...(isUUID(state.primaryTechniqueId) && { primaryTechniqueId: state.primaryTechniqueId }),
      ...(isUUID(state.secondaryTechniqueId) && { secondaryTechniqueId: state.secondaryTechniqueId }),
      pieceType: state.purpose === 'funcional' ? 'funcional'
        : state.purpose === 'decorativa' ? 'decorativa'
        : undefined,
      style: state.style === 'tradicional' ? 'tradicional'
        : state.style === 'contemporaneo' ? 'contemporaneo'
        : state.style === 'fusion' ? 'fusion'
        : undefined,
      isCollaboration: state.isCollaboration ?? false,
      estimatedElaborationTime: state.elaborationTime || undefined,
    };
  }

  if (state.heightCm || state.widthCm || state.lengthCm || state.weightKg) {
    dto.physicalSpecs = {
      heightCm: state.heightCm,
      widthCm: state.widthCm,
      lengthOrDiameterCm: state.lengthCm,
      realWeightKg: state.weightKg,
    };
  }

  if (state.packagedWeightKg || state.packagedWidthCm || state.shippingRestrictions) {
    dto.logistics = {
      packWeightKg: state.packagedWeightKg,
      packWidthCm: state.packagedWidthCm,
      packHeightCm: state.packagedHeightCm,
      packLengthCm: state.packagedLengthCm,
      specialProtectionNotes: state.shippingRestrictions,
      fragility: state.specialHandling ? 'alto' : 'bajo',
    };
  }

  if (state.availabilityType) {
    dto.production = {
      availabilityType: state.availabilityType,
      monthlyCapacity: state.monthlyCapacity,
    };
  }

  const uuidMaterials = state.materials.filter(isUUID);
  if (uuidMaterials.length > 0) {
    dto.materials = uuidMaterials.map((m, i) => ({
      materialId: m,
      isPrimary: i === 0,
    }));
  }

  if (state.price && state.price > 0) {
    dto.variants = [
      {
        stockQuantity: state.inventory ?? 1,
        basePriceMinor: priceToMinor(state.price),
        currency: 'COP',
        sku: state.sku,
        isActive: true,
      },
    ];
  }

  return dto;
};

export const useWizardDraft = (
  state: NewWizardState,
  update: (u: Partial<NewWizardState>) => void,
  shopId: string,
  silent = false,
) => {
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const saveDraft = useCallback(async () => {
    if (!shopId || !state.name.trim() || !state.shortDescription.trim()) return;
    setIsSavingDraft(true);
    try {
      const dto = mapNewStateToDto(state, shopId, [], false);
      if (state.productId) {
        await updateProductNew(state.productId, dto, { suppressToast: true });
      } else {
        const result = await createProductNew(dto, { suppressToast: true });
        const newId = (result as any)?.id ?? (result as any)?.productId;
        if (newId) update({ productId: newId });
      }
      if (!silent) toast.success('Borrador guardado');
    } catch (err: any) {
      if (!silent) toast.error(`No se pudo guardar: ${extractApiError(err)}`);
    } finally {
      setIsSavingDraft(false);
    }
  }, [state, shopId, update, silent]);

  return { saveDraft, isSavingDraft };
};
