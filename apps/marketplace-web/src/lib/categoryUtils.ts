/**
 * Normalize a category string for consistent comparison
 * Handles whitespace, case, and accent variations
 */
const normalizeCategoryString = (str: string): string => {
  return str
    .toUpperCase()                    // Convert to uppercase
    .trim()                            // Remove leading/trailing spaces
    .replace(/\s+/g, ' ')              // Replace multiple spaces with single space
    .normalize('NFD')                  // Normalize special characters
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents for comparison
};

/**
 * Normalize a category by extracting the main category before the first "/"
 * Example: "TEJEDURÍA/TEJEDIDOS NO TEJIDOS/TRABAJO EN MADERA" -> "TEJEDURÍA"
 */
export const normalizeCategory = (category: string | null | undefined): string => {
  if (!category) return 'Otros';
  const rawMain = category.split('/')[0].trim();
  const normalized = normalizeCategoryString(rawMain);

  // Agrupación canónica de categorías similares (ej. Cestería, Tejeduría, Joyería, etc.)
  if (normalized.includes('CESTERIA')) return 'Cestería';
  if (normalized.includes('TEJEDURIA')) return 'Tejeduría';
  if (normalized.includes('JOYERIA') || normalized.includes('BISUTERIA')) return 'Joyería';
  if (normalized.includes('PAPEL MACHE')) return 'Papel Maché';
  if (normalized.includes('LUTHERIA')) return 'Luthería';
  if (normalized.includes('TRABAJOS EN MADERA NAUFRAGA') || normalized.includes('TRABAJOS EN MADERA') || normalized.includes('TRABAJO EN MADERA')) {
    return 'Trabajos en madera';
  }
  if (normalized.includes('TRABAJO EN TELA') || normalized.includes('TELA SOBRE TELA')) return 'Trabajo en tela';
  if (normalized.includes('TRABAJO EN CACHO') || normalized.includes('HUESO Y COCO')) return 'Trabajo en cacho, hueso y coco';
  if (normalized.includes('TRABAJO EN NO MADERABLES')) return 'Trabajo en no maderables';

  // Por defecto, usamos la categoría principal tal cual
  return rawMain;
};

/**
 * Format a category name for display (Title Case)
 * Example: "TEJEDURÍA" -> "Tejeduría"
 */
export const formatCategoryName = (category: string): string => {
  if (!category) return 'Otros';
  
  // Convert to title case
  return category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Extract subcategory from full category path
 * Example: "TEJEDURÍA/TEJEDIDOS NO TEJIDOS/TRABAJO EN MADERA" -> "TEJEDIDOS NO TEJIDOS"
 */
export const getSubcategory = (category: string | null | undefined): string | null => {
  if (!category) return null;
  const parts = category.split('/').map(p => p.trim());
  return parts.length > 1 ? parts[1] : null;
};

/**
 * Get full category path for display
 * Example: "TEJEDURÍA/TEJEDIDOS NO TEJIDOS" -> "Tejedidos No Tejidos"
 */
export const getFullCategoryPath = (category: string | null | undefined): string => {
  if (!category) return 'Otros';
  return category.split('/').map(part => formatCategoryName(part.trim())).join(' > ');
};

export interface CategoryHierarchy {
  main: string;
  subcategories: Set<string>;
  count: number;
}

/**
 * Build category hierarchy from products
 * Returns a map of main categories to their subcategories
 * Uses normalization to prevent duplicates from formatting inconsistencies
 */
export const buildCategoryHierarchy = (products: any[]): Map<string, CategoryHierarchy> => {
  const hierarchy = new Map<string, CategoryHierarchy>();
  const categoryMap = new Map<string, string>(); // normalized -> original display name

  products.forEach(product => {
    if (!product.category) return;

    const mainCategory = normalizeCategory(product.category);
    const normalizedMain = normalizeCategoryString(mainCategory);
    
    // Store the first original name found for display
    if (!categoryMap.has(normalizedMain)) {
      categoryMap.set(normalizedMain, mainCategory);
    }
    
    const displayName = categoryMap.get(normalizedMain)!;
    
    // Use normalized key for consistent grouping
    if (!hierarchy.has(normalizedMain)) {
      hierarchy.set(normalizedMain, {
        main: displayName,
        subcategories: new Set(),
        count: 0
      });
    }

    const categoryData = hierarchy.get(normalizedMain)!;
    categoryData.count++;
    
    const subcategory = getSubcategory(product.category);
    if (subcategory) {
      categoryData.subcategories.add(subcategory);
    }
  });

  return hierarchy;
};

/**
 * Get unique normalized categories from products array
 */
export const getUniqueCategoriesFromProducts = (products: any[]): string[] => {
  const normalizedCategories = products
    .map(p => normalizeCategory(p.category))
    .filter(Boolean);
  
  // Get unique categories and sort alphabetically
  const uniqueCategories = Array.from(new Set(normalizedCategories))
    .sort((a, b) => a.localeCompare(b));
  
  return uniqueCategories;
};

/**
 * Check if a product's category matches the filter category
 * Supports matching normalized categories with full category paths
 * Uses normalization to handle formatting inconsistencies
 * Example: filter "TEJEDURÍA" matches product category "TEJEDURÍA/TEJEDIDOS NO TEJIDOS"
 */
export const matchesCategoryFilter = (
  productCategory: string | null | undefined, 
  filterCategory: string
): boolean => {
  if (!productCategory) return false;
  if (!filterCategory) return true;
  
  // Check if filter is a main category or specific subcategory
  const filterParts = filterCategory.split('/').map(p => p.trim());
  const productParts = productCategory.split('/').map(p => p.trim());
  
  // If filter has only main category, match main category with normalization
  if (filterParts.length === 1) {
    // Comparar usando la categoría canónica para agrupar variantes como "Tejeduría y cestería"
    const productMain = normalizeCategory(productCategory);
    const filterMain = normalizeCategory(filterCategory);

    const normalizedProductMain = normalizeCategoryString(productMain);
    const normalizedFilterMain = normalizeCategoryString(filterMain);
    return normalizedProductMain === normalizedFilterMain;
  }
  
  // If filter has subcategory, match both main and subcategory with normalization
  if (filterParts.length === 2) {
    const normalizedProductMain = normalizeCategoryString(productParts[0]);
    const normalizedFilterMain = normalizeCategoryString(filterParts[0]);
    
    if (normalizedProductMain !== normalizedFilterMain) return false;
    
    if (productParts.length < 2) return true;
    
    const normalizedProductSub = normalizeCategoryString(productParts[1]);
    const normalizedFilterSub = normalizeCategoryString(filterParts[1]);
    return normalizedProductSub === normalizedFilterSub;
  }
  
  return false;
};

/**
 * Count products per category (normalized)
 */
export const countProductsByCategory = (products: any[]): Record<string, number> => {
  return products.reduce((acc, product) => {
    const category = normalizeCategory(product.category);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};
