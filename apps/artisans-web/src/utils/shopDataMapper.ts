/**
 * Helper functions to map user maturity test data to shop creation wizard data
 */

/**
 * Helper function to extract shop name from business description
 */
function extractShopNameFromDescription(description: string): string {
  if (!description) return '';
  
  // Buscar patrones como "mi marca es X" o "mi negocio X"
  const patterns = [
    /mi marca es ([A-ZÁ-Ú][a-zá-ú\s]+)/i,
    /mi negocio ([A-ZÁ-Ú][a-zá-ú\s]+)/i,
    /llamamos? ([A-ZÁ-Ú][a-zá-ú\s]+)/i,
    /nombre es ([A-ZÁ-Ú][a-zá-ú\s]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Fallback: primeras 3 palabras
  const words = description.split(' ').slice(0, 3).join(' ');
  return words || 'Mi Tienda';
}

export interface ShopData {
  shop_name: string;
  description: string;
  craft_type: string;
  region: string;
  story?: string;
  contact_info?: any;
  social_links?: any;
}

/**
 * Maps profile data from maturity test to shop data structure
 * Updated to match fields from useFusedMaturityAgent
 */
export const mapProfileDataToShopData = (profileData: any): Partial<ShopData> => {
  if (!profileData) return {};

  // Log para debugging - mostrar todos los campos disponibles
  console.log('🔍 [SHOP-MAPPER] Mapping profile data:', {
    brandName: profileData.brandName,
    businessDescription: profileData.businessDescription,
    craftType: profileData.craftType,
    businessLocation: profileData.businessLocation,
    availableFields: Object.keys(profileData)
  });

  // ✅ Intentar múltiples nombres de campo como fallback
  const shopName = profileData.brandName || 
                   profileData.brand_name || 
                   profileData.businessName ||
                   profileData.shop_name ||
                   extractShopNameFromDescription(profileData.businessDescription);
  
  const craftType = profileData.craftType || 
                    profileData.craft_type ||
                    profileData.businessType ||
                    profileData.industry ||
                    profileData.tipo_artesania ||
                    'artesanía';
  
  const region = profileData.businessLocation || 
                 profileData.business_location ||
                 profileData.location ||
                 profileData.ubicacion ||
                 profileData.region ||
                 'Colombia';

  console.log('✅ [SHOP-MAPPER] Mapped values:', {
    shop_name: shopName,
    craft_type: craftType,
    region: region
  });

  const mappedData: Partial<ShopData> = {
    shop_name: shopName || '',
    
    description: profileData.businessDescription || 
                 profileData.business_description ||
                 profileData.description ||
                 (Array.isArray(profileData.activities) 
                   ? profileData.activities.join(', ') 
                   : profileData.activities) || 
                 '',
    
    craft_type: craftType,
    region: region,
    
    // Additional fields that might be available
    story: profileData.uniqueValue || 
           profileData.unique_value ||
           profileData.businessDescription ||
           profileData.sixMonthGoal ||
           '',
    
    contact_info: {
      email: profileData.email || '',
      whatsapp: profileData.whatsapp_e164 || '',
    },
  };

  // Validar campos críticos
  const missingCritical = [];
  if (!mappedData.shop_name) missingCritical.push('shop_name');
  if (!mappedData.description) missingCritical.push('description');
  if (!mappedData.region) missingCritical.push('region');

  if (missingCritical.length > 0) {
    console.error('❌ [SHOP-MAPPER] Missing critical fields:', missingCritical);
    console.error('📦 [SHOP-MAPPER] Available profile data:', profileData);
  }

  return mappedData;
};

/**
 * Determines which shop fields are still missing and need to be asked
 */
export const getMissingShopFields = (shopData: Partial<ShopData>): string[] => {
  const requiredFields = [
    { key: 'shop_name', field: 'shop_name' },
    { key: 'description', field: 'description' },
    { key: 'region', field: 'region' }
  ];
  
  return requiredFields
    .filter(({ field }) => !shopData[field] || shopData[field]?.toString().trim() === '')
    .map(({ key }) => key);
};

/**
 * Checks if we have complete shop data (all required fields filled)
 */
export const hasCompleteShopData = (shopData: Partial<ShopData>): boolean => {
  return !!(
    shopData.shop_name?.trim() &&
    shopData.description?.trim() &&
    shopData.region?.trim()
  );
};

/**
 * Generates a user-friendly message about what data was pre-filled
 */
export const getPrefilledDataSummary = (shopData: Partial<ShopData>): string => {
  const filled: string[] = [];
  
  if (shopData.shop_name) filled.push('nombre de tienda');
  if (shopData.description) filled.push('descripción de productos');
  if (shopData.region) filled.push('ubicación');
  
  if (filled.length === 0) return '';
  if (filled.length === 1) return filled[0];
  if (filled.length === 2) return `${filled[0]} y ${filled[1]}`;
  
  const last = filled.pop();
  return `${filled.join(', ')} y ${last}`;
};
