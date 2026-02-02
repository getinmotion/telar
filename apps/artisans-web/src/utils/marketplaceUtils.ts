/**
 * Utilities for handling marketplace integrations (Amazon, MercadoLibre, etc.)
 */

/**
 * Extract Amazon ASIN from URL
 * Supports formats:
 * - amazon.com/dp/B08N5WRWNW
 * - amazon.com/gp/product/B08N5WRWNW
 * - amazon.com/B08N5WRWNW
 */
export const extractAmazonASIN = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /amazon\.com\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }
  
  return null;
};

/**
 * Extract MercadoLibre Item ID from URL
 * Supports formats:
 * - mercadolibre.com.co/MCO-123456789
 * - articulo.mercadolibre.com.co/MCO-123456789
 */
export const extractMLItemId = (url: string): string | null => {
  if (!url) return null;
  
  const pattern = /([A-Z]{3}-\d+)/;
  const match = url.match(pattern);
  
  return match ? match[1] : null;
};

/**
 * Validate marketplace URL format
 */
export const validateMarketplaceUrl = (
  platform: 'amazon' | 'mercadolibre',
  url: string
): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    
    if (platform === 'amazon') {
      return (
        (urlObj.hostname.includes('amazon.com') || 
         urlObj.hostname.includes('amazon.co') ||
         urlObj.hostname.includes('amzn.to')) &&
        extractAmazonASIN(url) !== null
      );
    }
    
    if (platform === 'mercadolibre') {
      return (
        urlObj.hostname.includes('mercadolibre') &&
        extractMLItemId(url) !== null
      );
    }
    
    return false;
  } catch {
    return false;
  }
};

/**
 * Format marketplace URL for display (shorten if needed)
 */
export const formatMarketplaceUrl = (url: string, maxLength: number = 50): string => {
  if (!url) return '';
  
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname;
    
    if (path.length > maxLength - domain.length - 5) {
      return `${domain}${path.substring(0, maxLength - domain.length - 8)}...`;
    }
    
    return `${domain}${path}`;
  } catch {
    return url.substring(0, maxLength - 3) + '...';
  }
};

/**
 * Get marketplace icon name based on platform
 */
export const getMarketplaceIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    amazon: '🛒',
    mercadolibre: '🛍️',
    etsy: '🎨',
    shopify: '🏪',
    ebay: '💼',
  };
  
  return icons[platform.toLowerCase()] || '🔗';
};

/**
 * Get marketplace color for badges
 */
export const getMarketplaceColor = (platform: string): { bg: string; text: string; border: string } => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    amazon: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    mercadolibre: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    etsy: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    shopify: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    ebay: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  };
  
  return colors[platform.toLowerCase()] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
};
