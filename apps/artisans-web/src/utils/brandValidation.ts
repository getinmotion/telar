interface BrandCompleteness {
  isComplete: boolean;
  hasLogo: boolean;
  hasColors: boolean;
  hasClaim: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export const validateBrandCompleteness = (shop: any): BrandCompleteness => {
  const hasLogo = !!shop.logo_url;
  const hasColors = shop.primary_colors?.length > 0;
  const hasClaim = !!shop.brand_claim && shop.brand_claim.trim() !== '';
  
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
