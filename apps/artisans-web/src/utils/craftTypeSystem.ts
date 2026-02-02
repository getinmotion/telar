/**
 * Sistema Unificado de Tipos de Artesanía
 * 
 * Este archivo centraliza todos los craft types, categorías y mapeos
 * para garantizar consistencia en toda la aplicación.
 */

// Lista canónica de categorías de marketplace
export const VALID_MARKETPLACE_CATEGORIES = [
  "Joyería y Accesorios",
  "Decoración del Hogar", 
  "Textiles y Moda",
  "Bolsos y Carteras",
  "Vajillas y Cocina",
  "Muebles",
  "Arte y Esculturas",
  "Iluminación",
  "Cuidado Personal"
] as const;

export type MarketplaceCategory = typeof VALID_MARKETPLACE_CATEGORIES[number];

// Lista canónica de oficios artesanales colombianos
export const CANONICAL_CRAFT_TYPES = [
  // Madera
  "Carpintería y Ebanistería",
  "Trabajos en Guadua/Bambú",
  "Trabajos en Frutos Secos",
  "Tallado en Madera",
  
  // Fibras
  "Cestería",
  "Tejeduría",
  "Textiles No Tejidos",
  "Trabajos en Tela",
  "Textilería",
  
  // Arcilla
  "Cerámica",
  "Alfarería",
  
  // Cuero
  "Marroquinería",
  "Talabartería",
  "Guarnielería",
  "Tafilería",
  
  // Vidrio y Piedra
  "Trabajos en Vidrio",
  "Trabajos en Piedra",
  
  // Metales
  "Orfebrería/Platería",
  "Joyería",
  "Bisutería",
  "Forja",
  "Metalistería",
  "Cuchillería",
  "Alambrismo",
  
  // Papel y Decoración
  "Trabajo en Papel",
  "Enchapado en Tamo",
  "Barniz de Pasto",
  "Enchapado",
  "Trabajo en Cacho/Hueso",
  
  // Arte
  "Arte Pictórico",
  "Escultura",
  
  // Cuidado Personal
  "Cosmética Artesanal",
  "Jabonería Artesanal",
  "Herbología/Aromaterapia"
] as const;

export type CanonicalCraftType = typeof CANONICAL_CRAFT_TYPES[number];

// Normalización de términos variantes a craft type canónico
export const CRAFT_TYPE_NORMALIZATION: Record<string, CanonicalCraftType> = {
  // Español variantes
  "tejeduria": "Tejeduría",
  "tejeduría": "Tejeduría",
  "tejido": "Tejeduría",
  "tejidos": "Tejeduría",
  "textileria": "Textilería",
  "textilería": "Textilería",
  "textil": "Textilería",
  "textiles": "Textilería",
  "carpinteria": "Carpintería y Ebanistería",
  "carpintería": "Carpintería y Ebanistería",
  "carpinteria artesanal": "Carpintería y Ebanistería",
  "carpintería artesanal": "Carpintería y Ebanistería",
  "tallado en madera": "Tallado en Madera",
  "tallado": "Tallado en Madera",
  "madera": "Carpintería y Ebanistería",
  "ceramica": "Cerámica",
  "cerámica": "Cerámica",
  "barro": "Cerámica",
  "arcilla": "Cerámica",
  "alfareria": "Alfarería",
  "alfarería": "Alfarería",
  "joyeria": "Joyería",
  "joyería": "Joyería",
  "joyas": "Joyería",
  "orfebreria": "Orfebrería/Platería",
  "orfebrería": "Orfebrería/Platería",
  "plateria": "Orfebrería/Platería",
  "platería": "Orfebrería/Platería",
  "bisuteria": "Bisutería",
  "bisutería": "Bisutería",
  "marroquineria": "Marroquinería",
  "marroquinería": "Marroquinería",
  "cuero": "Marroquinería",
  "talabarteria": "Talabartería",
  "talabartería": "Talabartería",
  "cesteria": "Cestería",
  "cestería": "Cestería",
  "canastas": "Cestería",
  "cuchilleria": "Cuchillería",
  "cuchillería": "Cuchillería",
  "cuchillos": "Cuchillería",
  "navajas": "Cuchillería",
  "forja": "Forja",
  "herreria": "Forja",
  "herrería": "Forja",
  "vidrio": "Trabajos en Vidrio",
  "cristal": "Trabajos en Vidrio",
  "piedra": "Trabajos en Piedra",
  "guadua": "Trabajos en Guadua/Bambú",
  "bambú": "Trabajos en Guadua/Bambú",
  "bambu": "Trabajos en Guadua/Bambú",
  "papel": "Trabajo en Papel",
  "encuadernacion": "Trabajo en Papel",
  "encuadernación": "Trabajo en Papel",
  "pintura": "Arte Pictórico",
  "arte pictórico": "Arte Pictórico",
  "arte pictorico": "Arte Pictórico",
  "escultura": "Escultura",
  "cosmetica": "Cosmética Artesanal",
  "cosmética": "Cosmética Artesanal",
  "cosmetica artesanal": "Cosmética Artesanal",
  "cosmética artesanal": "Cosmética Artesanal",
  "jaboneria": "Jabonería Artesanal",
  "jabonería": "Jabonería Artesanal",
  "jabonería artesanal": "Jabonería Artesanal",
  "jaboneria artesanal": "Jabonería Artesanal",
  "jabones": "Jabonería Artesanal",
  "cremas": "Cosmética Artesanal",
  "cuidado personal": "Cosmética Artesanal",
  
  // Inglés
  "woodwork": "Carpintería y Ebanistería",
  "woodworking": "Carpintería y Ebanistería",
  "wood carving": "Tallado en Madera",
  "ceramics": "Cerámica",
  "pottery": "Alfarería",
  "textile arts": "Textilería",
  "textile": "Textilería",
  "weaving": "Tejeduría",
  "jewelry": "Joyería",
  "jewellery": "Joyería",
  "silversmith": "Orfebrería/Platería",
  "goldsmith": "Orfebrería/Platería",
  "leatherwork": "Marroquinería",
  "leather": "Marroquinería",
  "basketry": "Cestería",
  "basket weaving": "Cestería",
  "metalwork": "Metalistería",
  "blacksmith": "Forja",
  "forging": "Forja",
  "glasswork": "Trabajos en Vidrio",
  "glass": "Trabajos en Vidrio",
  "stonework": "Trabajos en Piedra",
  "sculpture": "Escultura",
  "painting": "Arte Pictórico",
  "paper": "Trabajo en Papel",
  "bookbinding": "Trabajo en Papel",
  "cosmetics": "Cosmética Artesanal",
  "soap making": "Jabonería Artesanal",
  "knifemaking": "Cuchillería",
  "knife making": "Cuchillería",
  "bladesmith": "Cuchillería"
};

// Mapeo de oficio artesanal a categoría de marketplace
export const OFICIO_TO_CATEGORY: Record<string, MarketplaceCategory> = {
  // Joyería y Accesorios
  "Joyería": "Joyería y Accesorios",
  "Bisutería": "Joyería y Accesorios",
  "Orfebrería/Platería": "Joyería y Accesorios",
  "Alambrismo": "Joyería y Accesorios",
  "Trabajo en Cacho/Hueso": "Joyería y Accesorios",
  
  // Bolsos y Carteras
  "Marroquinería": "Bolsos y Carteras",
  "Talabartería": "Bolsos y Carteras",
  "Guarnielería": "Bolsos y Carteras",
  "Tafilería": "Bolsos y Carteras",
  "Cestería": "Bolsos y Carteras",
  
  // Vajillas y Cocina
  "Cerámica": "Vajillas y Cocina",
  "Alfarería": "Vajillas y Cocina",
  "Trabajos en Vidrio": "Vajillas y Cocina",
  
  // Textiles y Moda
  "Tejeduría": "Textiles y Moda",
  "Textilería": "Textiles y Moda",
  "Trabajos en Tela": "Textiles y Moda",
  "Textiles No Tejidos": "Textiles y Moda",
  
  // Muebles
  "Carpintería y Ebanistería": "Muebles",
  "Trabajos en Guadua/Bambú": "Muebles",
  
  // Decoración del Hogar
  "Metalistería": "Decoración del Hogar",
  "Forja": "Decoración del Hogar",
  "Trabajo en Papel": "Decoración del Hogar",
  "Enchapado en Tamo": "Decoración del Hogar",
  "Barniz de Pasto": "Decoración del Hogar",
  "Enchapado": "Decoración del Hogar",
  "Tallado en Madera": "Decoración del Hogar",
  "Trabajos en Frutos Secos": "Decoración del Hogar",
  "Cuchillería": "Decoración del Hogar",
  
  // Arte y Esculturas
  "Trabajos en Piedra": "Arte y Esculturas",
  "Arte Pictórico": "Arte y Esculturas",
  "Escultura": "Arte y Esculturas",
  
  // Cuidado Personal
  "Cosmética Artesanal": "Cuidado Personal",
  "Jabonería Artesanal": "Cuidado Personal",
  "Herbología/Aromaterapia": "Cuidado Personal"
};

// Mapeo de palabras clave de producto a categoría
export const PRODUCT_KEYWORDS_TO_CATEGORY: Record<string, MarketplaceCategory> = {
  // Joyería y Accesorios
  "arete": "Joyería y Accesorios",
  "aretes": "Joyería y Accesorios",
  "collar": "Joyería y Accesorios",
  "collares": "Joyería y Accesorios",
  "pulsera": "Joyería y Accesorios",
  "pulseras": "Joyería y Accesorios",
  "anillo": "Joyería y Accesorios",
  "anillos": "Joyería y Accesorios",
  "manilla": "Joyería y Accesorios",
  "manillas": "Joyería y Accesorios",
  "brazalete": "Joyería y Accesorios",
  "diadema": "Joyería y Accesorios",
  "tocado": "Joyería y Accesorios",
  "pendiente": "Joyería y Accesorios",
  "pendientes": "Joyería y Accesorios",
  
  // Bolsos y Carteras
  "bolso": "Bolsos y Carteras",
  "bolsos": "Bolsos y Carteras",
  "mochila": "Bolsos y Carteras",
  "mochilas": "Bolsos y Carteras",
  "cartera": "Bolsos y Carteras",
  "carteras": "Bolsos y Carteras",
  "morral": "Bolsos y Carteras",
  "canasta": "Bolsos y Carteras",
  "canasto": "Bolsos y Carteras",
  "cesto": "Bolsos y Carteras",
  "cesta": "Bolsos y Carteras",
  "estuche": "Bolsos y Carteras",
  "monedero": "Bolsos y Carteras",
  
  // Vajillas y Cocina
  "plato": "Vajillas y Cocina",
  "platos": "Vajillas y Cocina",
  "taza": "Vajillas y Cocina",
  "tazas": "Vajillas y Cocina",
  "bowl": "Vajillas y Cocina",
  "bowls": "Vajillas y Cocina",
  "bandeja": "Vajillas y Cocina",
  "bandejas": "Vajillas y Cocina",
  "vajilla": "Vajillas y Cocina",
  "olla": "Vajillas y Cocina",
  "vasija": "Vajillas y Cocina",
  "jarra": "Vajillas y Cocina",
  "vaso": "Vajillas y Cocina",
  "cubiertos": "Vajillas y Cocina",
  "utensilio": "Vajillas y Cocina",
  
  // Textiles y Moda
  "ruana": "Textiles y Moda",
  "poncho": "Textiles y Moda",
  "bufanda": "Textiles y Moda",
  "chal": "Textiles y Moda",
  "tapete": "Textiles y Moda",
  "tapiz": "Textiles y Moda",
  "hamaca": "Textiles y Moda",
  "mantel": "Textiles y Moda",
  "cojín": "Textiles y Moda",
  "cojin": "Textiles y Moda",
  "camino de mesa": "Textiles y Moda",
  "tela": "Textiles y Moda",
  "tejido": "Textiles y Moda",
  "bordado": "Textiles y Moda",
  "sombrero": "Textiles y Moda",
  "gorro": "Textiles y Moda",
  
  // Muebles
  "mesa": "Muebles",
  "silla": "Muebles",
  "banco": "Muebles",
  "estante": "Muebles",
  "estantería": "Muebles",
  "baúl": "Muebles",
  "baul": "Muebles",
  "mueble": "Muebles",
  "butaca": "Muebles",
  "mecedora": "Muebles",
  
  // Decoración del Hogar
  "figura": "Decoración del Hogar",
  "figurita": "Decoración del Hogar",
  "adorno": "Decoración del Hogar",
  "decoración": "Decoración del Hogar",
  "decorativo": "Decoración del Hogar",
  "jarrón": "Decoración del Hogar",
  "jarron": "Decoración del Hogar",
  "florero": "Decoración del Hogar",
  "portavela": "Decoración del Hogar",
  "espejo": "Decoración del Hogar",
  "cuadro": "Arte y Esculturas",
  "reloj": "Decoración del Hogar",
  "cuchillo": "Decoración del Hogar",
  "navaja": "Decoración del Hogar",
  
  // Arte y Esculturas
  "escultura": "Arte y Esculturas",
  "talla": "Arte y Esculturas",
  "pintura": "Arte y Esculturas",
  "arte": "Arte y Esculturas",
  "retrato": "Arte y Esculturas",
  "mural": "Arte y Esculturas",
  
  // Iluminación
  "lámpara": "Iluminación",
  "lampara": "Iluminación",
  "vela": "Iluminación",
  "veladora": "Iluminación",
  "candelabro": "Iluminación",
  "farol": "Iluminación",
  "luz": "Iluminación",
  
  // Cuidado Personal
  "jabón": "Cuidado Personal",
  "jabon": "Cuidado Personal",
  "crema": "Cuidado Personal",
  "bálsamo": "Cuidado Personal",
  "balsamo": "Cuidado Personal",
  "aceite corporal": "Cuidado Personal",
  "aceite facial": "Cuidado Personal",
  "loción": "Cuidado Personal",
  "locion": "Cuidado Personal",
  "sérum": "Cuidado Personal",
  "serum": "Cuidado Personal",
  "exfoliante": "Cuidado Personal",
  "mascarilla": "Cuidado Personal",
  "hidratante": "Cuidado Personal",
  "cosmético": "Cuidado Personal",
  "cosmetico": "Cuidado Personal",
  "skincare": "Cuidado Personal"
};

/**
 * Normaliza un craft type a su forma canónica
 */
export function normalizeCraftType(craftType: string | null | undefined): CanonicalCraftType | null {
  if (!craftType) return null;
  
  const normalized = craftType.toLowerCase().trim();
  
  // Primero buscar coincidencia exacta
  if (CRAFT_TYPE_NORMALIZATION[normalized]) {
    return CRAFT_TYPE_NORMALIZATION[normalized];
  }
  
  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(CRAFT_TYPE_NORMALIZATION)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Si ya es un craft type canónico, retornarlo
  if (CANONICAL_CRAFT_TYPES.includes(craftType as CanonicalCraftType)) {
    return craftType as CanonicalCraftType;
  }
  
  return null;
}

/**
 * Obtiene la categoría de marketplace para un oficio artesanal
 */
export function getCategoryForCraft(craftType: string | null | undefined): MarketplaceCategory {
  if (!craftType) return "Decoración del Hogar";
  
  // Normalizar primero
  const normalized = normalizeCraftType(craftType);
  if (normalized && OFICIO_TO_CATEGORY[normalized]) {
    return OFICIO_TO_CATEGORY[normalized];
  }
  
  // Buscar directamente
  if (OFICIO_TO_CATEGORY[craftType]) {
    return OFICIO_TO_CATEGORY[craftType];
  }
  
  return "Decoración del Hogar";
}

/**
 * Detecta la categoría de un producto basándose en su nombre y descripción
 */
export function detectCategoryFromProduct(
  productName: string,
  productDescription: string = ""
): MarketplaceCategory | null {
  const text = `${productName} ${productDescription}`.toLowerCase();
  
  // Buscar palabras clave en orden de prioridad
  for (const [keyword, category] of Object.entries(PRODUCT_KEYWORDS_TO_CATEGORY)) {
    if (text.includes(keyword.toLowerCase())) {
      return category;
    }
  }
  
  return null;
}

/**
 * Valida si una categoría es válida
 */
export function isValidCategory(category: string | null | undefined): boolean {
  if (!category) return false;
  return VALID_MARKETPLACE_CATEGORIES.includes(category as MarketplaceCategory);
}

/**
 * Normaliza una categoría a su forma válida
 */
export function normalizeCategory(category: string | null | undefined): MarketplaceCategory {
  if (!category) return "Decoración del Hogar";
  
  const normalized = category.trim();
  
  // Coincidencia exacta
  if (VALID_MARKETPLACE_CATEGORIES.includes(normalized as MarketplaceCategory)) {
    return normalized as MarketplaceCategory;
  }
  
  // Mapeos de categorías mal escritas o variantes
  const categoryNormalization: Record<string, MarketplaceCategory> = {
    "joyería": "Joyería y Accesorios",
    "joyeria": "Joyería y Accesorios",
    "joyas": "Joyería y Accesorios",
    "accesorios": "Joyería y Accesorios",
    "decoración": "Decoración del Hogar",
    "decoracion": "Decoración del Hogar",
    "hogar": "Decoración del Hogar",
    "textiles": "Textiles y Moda",
    "moda": "Textiles y Moda",
    "ropa": "Textiles y Moda",
    "bolsos": "Bolsos y Carteras",
    "carteras": "Bolsos y Carteras",
    "vajillas": "Vajillas y Cocina",
    "cocina": "Vajillas y Cocina",
    "cerámica": "Vajillas y Cocina",
    "ceramica": "Vajillas y Cocina",
    "muebles": "Muebles",
    "arte": "Arte y Esculturas",
    "esculturas": "Arte y Esculturas",
    "iluminación": "Iluminación",
    "iluminacion": "Iluminación",
    "lámparas": "Iluminación",
    "lamparas": "Iluminación",
    "cuidado personal": "Cuidado Personal",
    "cosmética": "Cuidado Personal",
    "cosmetica": "Cuidado Personal"
  };
  
  const normalizedLower = normalized.toLowerCase();
  if (categoryNormalization[normalizedLower]) {
    return categoryNormalization[normalizedLower];
  }
  
  return "Decoración del Hogar";
}

/**
 * Verifica coherencia entre craft type de tienda y categoría de producto
 */
export function validateCraftCategoryCoherence(
  shopCraftType: string | null | undefined,
  productCategory: MarketplaceCategory
): { isCoherent: boolean; suggestedCategory?: MarketplaceCategory; warning?: string } {
  if (!shopCraftType) {
    return { isCoherent: true };
  }
  
  const expectedCategory = getCategoryForCraft(shopCraftType);
  
  // Algunas combinaciones son válidas aunque no sean exactas
  const validCrossSells: Record<string, MarketplaceCategory[]> = {
    "Tejeduría": ["Textiles y Moda", "Bolsos y Carteras", "Joyería y Accesorios"], // manillas, mochilas
    "Textilería": ["Textiles y Moda", "Bolsos y Carteras", "Joyería y Accesorios"],
    "Cestería": ["Bolsos y Carteras", "Decoración del Hogar"],
    "Cerámica": ["Vajillas y Cocina", "Decoración del Hogar", "Arte y Esculturas"],
    "Alfarería": ["Vajillas y Cocina", "Decoración del Hogar", "Arte y Esculturas"],
    "Carpintería y Ebanistería": ["Muebles", "Decoración del Hogar", "Arte y Esculturas"],
    "Tallado en Madera": ["Decoración del Hogar", "Arte y Esculturas", "Muebles"],
    "Joyería": ["Joyería y Accesorios", "Decoración del Hogar"],
    "Bisutería": ["Joyería y Accesorios", "Decoración del Hogar"]
  };
  
  const normalized = normalizeCraftType(shopCraftType);
  const validCategories = normalized ? validCrossSells[normalized] : null;
  
  if (validCategories && validCategories.includes(productCategory)) {
    return { isCoherent: true };
  }
  
  if (productCategory === expectedCategory) {
    return { isCoherent: true };
  }
  
  return {
    isCoherent: false,
    suggestedCategory: expectedCategory,
    warning: `El producto está en "${productCategory}" pero la tienda es de "${shopCraftType}". Categoría sugerida: "${expectedCategory}"`
  };
}
