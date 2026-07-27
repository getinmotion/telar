import type { NewWizardState, WizardVariant } from "./useNewWizardState";
import type { ProductResponse } from "@/services/products-new.types";
import { deriveProductionType } from "../utils/availability";

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
 *
 * Nota de variantes: se cargan TODAS con su `id`. Es obligatorio, porque al
 * guardar el backend soft-elimina las variantes que no lleguen en el DTO.
 */
export function mapProductResponseToWizardState(
  product: ProductResponse,
): Partial<NewWizardState> {
  // Precio del vendedor = precio guardado ÷ 1.05 (recargo comprador)
  const toSellerPrice = (basePriceMinor: string) =>
    Math.round(parseInt(basePriceMinor) / 100 / 1.05);

  const allVariants = product.variants ?? [];
  const hasRealVariants = allVariants.some(
    (v) => Object.keys(v.optionValues ?? {}).length > 0,
  );
  const primaryVariant = allVariants.find((v) => v.isActive) || allVariants[0];

  let variantUpdates: Partial<NewWizardState> = {};
  if (hasRealVariants) {
    const wizardVariants: WizardVariant[] = allVariants.map((v) => ({
      id: v.id,
      optionValues: v.optionValues ?? {},
      price: v.basePriceMinor ? toSellerPrice(v.basePriceMinor) : undefined,
      stock: v.stockQuantity,
      minStock: v.minStock ?? 0,
      imageUrl: v.imageUrl || undefined,
      isActive: v.isActive,
      sku: v.sku || undefined,
    }));
    // Derivar ejes y valores desde los optionValues existentes
    const axisValues: Record<string, string[]> = {};
    for (const v of wizardVariants) {
      for (const [axis, value] of Object.entries(v.optionValues)) {
        if (!value) continue;
        if (!axisValues[axis]) axisValues[axis] = [];
        if (!axisValues[axis].includes(value)) axisValues[axis].push(value);
      }
    }
    const activePrices = wizardVariants
      .filter((v) => v.isActive && v.price)
      .map((v) => v.price!);
    variantUpdates = {
      hasVariants: true,
      variants: wizardVariants,
      variantAxes: Object.keys(axisValues),
      variantAxisValues: axisValues,
      price: activePrices.length ? Math.min(...activePrices) : undefined,
      inventory: wizardVariants
        .filter((v) => v.isActive)
        .reduce((sum, v) => sum + (v.stock ?? 0), 0),
    };
  } else {
    variantUpdates = {
      hasVariants: false,
      primaryVariantId: primaryVariant?.id,
      price: primaryVariant?.basePriceMinor
        ? toSellerPrice(primaryVariant.basePriceMinor)
        : undefined,
      sku: primaryVariant?.sku || undefined,
      inventory: primaryVariant?.stockQuantity || undefined,
      minimumStockAlert: primaryVariant?.minStock || undefined,
    };
  }

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
    usageSuggestions: product.usageSuggestions || undefined,
    images,
    categoryId: product.categoryId || undefined,
    subcategoryId: product.subcategoryId || undefined,
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
    styles: (product.artisanalIdentity?.styles?.length
      ? product.artisanalIdentity.styles
      : product.artisanalIdentity?.style
        ? [product.artisanalIdentity.style]
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          undefined) as any,
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
    productionType: deriveProductionType(product.production?.availabilityType),
    monthlyCapacity: product.production?.monthlyCapacity || undefined,
    processDescription: product.production?.processDescription || undefined,
    processEvidenceUrls: product.production?.processEvidenceUrls || undefined,
    tools: product.production?.tools || [],
    // pricing + variantes
    ...variantUpdates,
  };
}
