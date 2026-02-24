import { ArtisanShop } from "@/types/artisanShop.types";

interface BrandCompleteness {
  isComplete: boolean;
  hasLogo: boolean;
  hasColors: boolean;
  hasClaim: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export const validateBrandCompleteness = (shop: ArtisanShop): BrandCompleteness => {
  const hasLogo = !!shop.logoUrl;
  const hasColors = shop.primaryColors?.length > 0;
  const hasClaim = !!shop.brandClaim && shop.brandClaim.trim() !== '';

  const missingFields: string[] = [];
  if (!hasLogo) missingFields.push('Logo de marca');
  if (!hasColors) missingFields.push('Colores de marca');
  if (!hasClaim) missingFields.push('Claim o eslogan');

  const completionPercentage = Math.round(
    ((hasLogo ? 1 : 0) + (hasColors ? 1 : 0) + (hasClaim ? 1 : 0)) / 3 * 100
  );

  return {
    isComplete: hasLogo && hasColors && hasClaim,
    hasLogo,
    hasColors,
    hasClaim,
    missingFields,
    completionPercentage
  };
};
