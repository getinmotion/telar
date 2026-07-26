import type { NewWizardState } from "./useNewWizardState";
import type { ProductResponse } from "@/services/products-new.types";

/**
 * Mapea un `ProductResponse` (API products-new) al estado del wizard.
 *
 * Es la ÚNICA fuente de verdad para reconstruir el wizard a partir de un
 * producto existente. La usa tanto el flujo de autoría en modo edición
 * (`NewProductWizard`) como el host de revisión de moderación
 * (`ProductReviewWizard`), de modo que el moderador vea EXACTAMENTE los
 * mismos datos que diligenció el artesano — sin pérdida de campos.
 *
 * Nota de precio: el precio base de la variante incluye el markup ×1.05 que se
 * aplica al comercializar; aquí se revierte para mostrar el precio del artesano.
 */
export function mapProductResponseToWizardState(
  product: ProductResponse,
): Partial<NewWizardState> {
  const primaryVariant =
    product.variants?.find((v) => v.isActive) || product.variants?.[0];

  const images =
    product.media
      ?.filter((m) => m.mediaType === "image")
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((m) => m.mediaUrl) || [];

  return {
    productId: product.id,
    status: product.status as NewWizardState["status"],
    name: product.name,
    shortDescription: product.shortDescription,
    artisanalHistory: product.history || undefined,
    careNotes: product.careNotes || undefined,
    images,
    categoryId: product.categoryId || undefined,
    materials: product.materials?.map((m) => m.materialId) || [],
    // artisanal identity
    craftId: product.artisanalIdentity?.primaryCraftId || undefined,
    primaryTechniqueId:
      product.artisanalIdentity?.primaryTechniqueId || undefined,
    secondaryTechniqueId:
      product.artisanalIdentity?.secondaryTechniqueId || undefined,
    elaborationTime:
      product.artisanalIdentity?.estimatedElaborationTime || undefined,
    isCollaboration: product.artisanalIdentity?.isCollaboration ?? false,
    collaboration: product.artisanalIdentity?.collaborationName
      ? { name: product.artisanalIdentity.collaborationName }
      : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    purpose: product.artisanalIdentity?.pieceType as any,
    styles: product.artisanalIdentity?.style
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [product.artisanalIdentity.style as any]
      : undefined,
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
    shippingRestrictions:
      product.logistics?.specialProtectionNotes || undefined,
    specialHandling: product.logistics?.fragility === "alto",
    // production
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    availabilityType: product.production?.availabilityType as any,
    monthlyCapacity: product.production?.monthlyCapacity || undefined,
    processDescription: product.production?.processDescription || undefined,
    processEvidenceUrls: product.production?.processEvidenceUrls || undefined,
    // pricing (revierte el markup ×1.05)
    price: primaryVariant?.basePriceMinor
      ? Math.round(parseInt(primaryVariant.basePriceMinor) / 100 / 1.05)
      : undefined,
    sku: primaryVariant?.sku || undefined,
    inventory: primaryVariant?.stockQuantity || undefined,
  };
}
