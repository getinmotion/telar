/**
 * Normalización universal de texto artesanal
 * Maneja mayúsculas, acentos, espacios múltiples
 */
export const normalizeArtisanText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/\s+/g, ' ')                    // Espacios múltiples -> uno
    .normalize('NFD')                        // Descomponer acentos
    .replace(/[\u0300-\u036f]/g, '')        // Quitar marcas de acento
    .toLowerCase();                          // Minúsculas para comparación
};

/**
 * Formatear para display (Title Case)
 */
export const formatArtisanText = (text: string | null | undefined): string => {
  if (!text) return 'Sin especificar';
  
  return text
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Lista de oficios válidos reconocidos
 */
export const VALID_OFICIOS = [
  "Alfarería",
  "Bordado",
  "Carpintería",
  "Cestería",
  "Cerámica",
  "Cosmética Artesanal",
  "Ebanistería",
  "Encuadernación",
  "Escultura",
  "Filigrana",
  "Jabonería Artesanal",
  "Joyería",
  "Marroquinería",
  "Orfebrería",
  "Serigrafía",
  "Soplado de Vidrio",
  "Talla",
  "Talabartería",
  "Tejeduría",
  "Trabajo en Papel",
  "Trabajo en Piedra",
  "Vidriería",
];

/**
 * Términos que NO son oficios y deben ser filtrados
 * Incluye categorías de marketplace, términos genéricos, etc.
 */
const INVALID_CRAFT_TERMS = [
  // Categorías de marketplace (NO son oficios)
  'decoracion del hogar',
  'decoración del hogar',
  'vajillas y cocina',
  'vajilla y cocina',
  'textiles y moda',
  'bolsos y carteras',
  'joyeria y accesorios',
  'joyería y accesorios',
  'muebles',
  'arte y esculturas',
  'cuidado personal',
  // Términos genéricos (NO son oficios)
  'hecho a mano',
  'artesania',
  'artesanía',
  'artesanal',
  'hogar',
  'vestuario',
  'otros',
  'other',
  'n/a',
  'none',
  'unknown',
  'desconocido',
  'sin especificar',
  // Términos en inglés genéricos
  'handmade',
  'crafts',
  'craft',
  'home',
  'decor',
  'decoration',
];

/**
 * Mapeo de variantes a nombres canónicos de oficios
 */
const CRAFT_VARIANTS_MAP: Record<string, string> = {
  // Tejeduría
  'tejeduria': 'Tejeduría',
  'tejido': 'Tejeduría',
  'tejidos': 'Tejeduría',
  'weaving': 'Tejeduría',
  'knitting': 'Tejeduría',
  'crochet': 'Tejeduría',
  'macrame': 'Tejeduría',
  // Cestería
  'cesteria': 'Cestería',
  'cestas': 'Cestería',
  'canastos': 'Cestería',
  'basket': 'Cestería',
  'basketry': 'Cestería',
  'werregue': 'Cestería',
  // Joyería
  'joyeria': 'Joyería',
  'bisuteria': 'Joyería',
  'alhajas': 'Joyería',
  'jewelry': 'Joyería',
  'jewellery': 'Joyería',
  // Orfebrería (separado de joyería genérica)
  'orfebreria': 'Orfebrería',
  'plateria': 'Orfebrería',
  // Filigrana
  'filigrana': 'Filigrana',
  // Cerámica / Alfarería
  'ceramica': 'Cerámica',
  'alfareria': 'Alfarería',
  'barro': 'Alfarería',
  'arcilla': 'Alfarería',
  'ceramics': 'Cerámica',
  'ceramic': 'Cerámica',
  'pottery': 'Alfarería',
  // Carpintería y Ebanistería
  'carpinteria': 'Carpintería',
  'ebanisteria': 'Ebanistería',
  'woodwork': 'Carpintería',
  'woodworking': 'Carpintería',
  // Talla en Madera / Escultura
  'talla': 'Talla',
  'tallado': 'Talla',
  'escultura': 'Escultura',
  'carving': 'Talla',
  // Marroquinería / Talabartería
  'marroquineria': 'Marroquinería',
  'cuero': 'Marroquinería',
  'piel': 'Marroquinería',
  'leatherwork': 'Marroquinería',
  'leather': 'Marroquinería',
  'talabarteria': 'Talabartería',
  // Bordado
  'bordado': 'Bordado',
  'embroidery': 'Bordado',
  // Textilería (mapear a Tejeduría)
  'textil': 'Tejeduría',
  'textiles': 'Tejeduría',
  'textile': 'Tejeduría',
  'telas': 'Tejeduría',
  'sewing': 'Tejeduría',
  // Vidriería
  'vidrio': 'Vidriería',
  'glasswork': 'Vidriería',
  'glass': 'Vidriería',
  'soplado de vidrio': 'Soplado de Vidrio',
  // Metalistería
  'metalwork': 'Orfebrería',
  'metal': 'Orfebrería',
  // Cosmética artesanal
  'cosmetica artesanal': 'Cosmética Artesanal',
  'cosmetica': 'Cosmética Artesanal',
  'jaboneria': 'Jabonería Artesanal',
  'jaboneria artesanal': 'Jabonería Artesanal',
  // Serigrafía
  'serigrafia': 'Serigrafía',
  // Trabajo en piedra
  'piedra': 'Trabajo en Piedra',
  'stone': 'Trabajo en Piedra',
  // Encuadernación
  'encuadernacion': 'Encuadernación',
  'libros': 'Encuadernación',
  'bookbinding': 'Encuadernación',
  // Trabajo en Papel
  'papercraft': 'Trabajo en Papel',
  'papel': 'Trabajo en Papel',
};

/**
 * Patrones para inferir oficios desde nombres de productos
 * Usado como fallback cuando el craft field es inválido
 */
const PRODUCT_NAME_PATTERNS: { pattern: RegExp; craft: string }[] = [
  // Tejeduría / Textiles
  { pattern: /ruana|poncho|bufanda|chal|hamaca|mochila wayuu|tapiz|telar/i, craft: 'Tejeduría' },
  { pattern: /tejido|hilado|punto/i, craft: 'Tejeduría' },
  // Cestería
  { pattern: /canast[ao]|cesta|werregue|bolso.*fibra|caña flecha/i, craft: 'Cestería' },
  // Joyería / Orfebrería
  { pattern: /aretes|collar|pulsera|anillo|pendientes|brazalete/i, craft: 'Joyería' },
  { pattern: /filigrana/i, craft: 'Filigrana' },
  { pattern: /plata.*martill|oro.*artesanal/i, craft: 'Orfebrería' },
  // Cerámica / Alfarería
  { pattern: /jarr[oó]n|olla|plato.*barro|taza.*ceramica|bowl/i, craft: 'Cerámica' },
  { pattern: /barro.*pintado|arcilla/i, craft: 'Alfarería' },
  // Madera
  { pattern: /mesa.*madera|silla.*artesanal|estanter[ií]a|ba[uú]l/i, craft: 'Carpintería' },
  { pattern: /talla.*madera|escultura.*madera|figura.*tallada/i, craft: 'Talla' },
  // Cuero
  { pattern: /bolso.*cuero|cartera.*cuero|cintur[oó]n|billetera|monedero.*cuero/i, craft: 'Marroquinería' },
  // Bordado
  { pattern: /bordado|mantel.*bordado|cojin.*bordado|camino.*mesa/i, craft: 'Bordado' },
  // Cosmética
  { pattern: /jab[oó]n|crema|balsamo|aceite.*esencial|exfoliante|hidratante/i, craft: 'Cosmética Artesanal' },
  // Vidrio
  { pattern: /vidrio.*soplado|lampara.*vidrio|florero.*vidrio/i, craft: 'Soplado de Vidrio' },
];

/**
 * Inferir oficio desde el nombre del producto
 */
const inferCraftFromProductName = (productName: string): string | null => {
  if (!productName) return null;
  
  for (const { pattern, craft } of PRODUCT_NAME_PATTERNS) {
    if (pattern.test(productName)) {
      return craft;
    }
  }
  
  return null;
};

/**
 * Buscar un oficio válido dentro de un array de tags
 */
export const findCraftInTags = (tags: string[] | null | undefined): string | null => {
  if (!tags || tags.length === 0) return null;
  
  for (const tag of tags) {
    const normalized = normalizeArtisanText(tag);
    
    // Check direct match in variants map
    if (CRAFT_VARIANTS_MAP[normalized]) {
      return CRAFT_VARIANTS_MAP[normalized];
    }
    
    // Check if formatted version is a valid oficio
    const formatted = formatArtisanText(tag);
    if (VALID_OFICIOS.includes(formatted)) {
      return formatted;
    }
    
    // Check partial matches in variants map
    for (const [key, canonical] of Object.entries(CRAFT_VARIANTS_MAP)) {
      if (normalized.includes(key)) {
        return canonical;
      }
    }
  }
  
  return null;
};

/**
 * Normalizar oficio con fallback inteligente
 * 
 * Prioridad:
 * 1. Mapeo directo desde craftMap
 * 2. Match parcial en craftMap
 * 3. Verificar si ya es un oficio válido
 * 4. Buscar en tags del producto (si se proporciona context)
 * 5. Inferir desde nombre del producto (si se proporciona context)
 * 6. Devolver "Sin especificar"
 */
export const normalizeCraft = (
  craft: string | null | undefined, 
  context?: { tags?: string[] | null; productName?: string | null }
): string => {
  if (!craft) {
    // Si no hay craft pero hay contexto, intentar inferir
    if (context) {
      // Primero buscar en tags
      const craftFromTags = findCraftInTags(context.tags);
      if (craftFromTags) return craftFromTags;
      
      // Luego inferir del nombre
      if (context.productName) {
        const inferred = inferCraftFromProductName(context.productName);
        if (inferred) return inferred;
      }
    }
    return 'Sin especificar';
  }
  
  const normalized = normalizeArtisanText(craft);
  
  // Primero verificar si es un término inválido
  if (INVALID_CRAFT_TERMS.some(term => normalized === term || normalized.includes(term))) {
    // Es una categoría o término genérico, intentar fallback
    if (context) {
      const craftFromTags = findCraftInTags(context.tags);
      if (craftFromTags) return craftFromTags;
      
      if (context.productName) {
        const inferred = inferCraftFromProductName(context.productName);
        if (inferred) return inferred;
      }
    }
    return 'Sin especificar';
  }
  
  // Buscar coincidencia exacta primero
  if (CRAFT_VARIANTS_MAP[normalized]) {
    return CRAFT_VARIANTS_MAP[normalized];
  }
  
  // Buscar coincidencias parciales
  for (const [key, canonical] of Object.entries(CRAFT_VARIANTS_MAP)) {
    if (normalized.includes(key)) {
      return canonical;
    }
  }
  
  // Verificar si el texto formateado está en la lista de oficios válidos
  const formatted = formatArtisanText(craft);
  if (VALID_OFICIOS.includes(formatted)) {
    return formatted;
  }
  
  // Último intento: buscar en tags o inferir del nombre
  if (context) {
    const craftFromTags = findCraftInTags(context.tags);
    if (craftFromTags) return craftFromTags;
    
    if (context.productName) {
      const inferred = inferCraftFromProductName(context.productName);
      if (inferred) return inferred;
    }
  }
  
  // Si no hay match y no está en la lista válida, es "Sin especificar"
  return 'Sin especificar';
};

/**
 * Normalizar un material individual
 * Traduce términos en inglés y variantes al español canónico
 */
export const normalizeMaterial = (material: string | null | undefined): string => {
  if (!material) return 'Sin especificar';
  
  const normalized = normalizeArtisanText(material);
  
  const materialMap: Record<string, string> = {
    // Inglés a español
    'ceramics': 'Cerámica',
    'ceramic': 'Cerámica',
    'wood': 'Madera',
    'leather': 'Cuero',
    'cotton': 'Algodón',
    'wool': 'Lana',
    'silver': 'Plata',
    'gold': 'Oro',
    'clay': 'Arcilla',
    'glass': 'Vidrio',
    'metal': 'Metal',
    'bamboo': 'Bambú',
    'fiber': 'Fibra',
    'fibers': 'Fibra',
    'stone': 'Piedra',
    'brass': 'Latón',
    'copper': 'Cobre',
    'silk': 'Seda',
    'rattan': 'Ratán',
    'straw': 'Paja',
    'palm': 'Palma',
    'thread': 'Hilo',
    'yarn': 'Hilaza',
    // Plurales y variantes en español
    'cueros': 'Cuero',
    'maderas': 'Madera',
    'lanas': 'Lana',
    'arcillas': 'Arcilla',
    'fibras': 'Fibra',
  };
  
  for (const [key, canonical] of Object.entries(materialMap)) {
    if (normalized === key || normalized.includes(key)) {
      return canonical;
    }
  }
  
  return formatArtisanText(material);
};

/**
 * Normalizar array de materiales
 * Traduce, formatea, deduplica y ordena
 */
export const normalizeMaterials = (materials: string[] | null | undefined): string[] => {
  if (!materials || materials.length === 0) return [];
  
  const normalized = materials
    .map(m => normalizeMaterial(m))
    .filter(m => m && m !== 'Sin especificar');
  
  // Deduplicar manteniendo solo variantes canónicas
  return Array.from(new Set(normalized)).sort();
};

/**
 * Normalizar array de técnicas
 * Formatea, deduplica y ordena
 */
export const normalizeTechniques = (techniques: string[] | null | undefined): string[] => {
  if (!techniques || techniques.length === 0) return [];
  
  const normalized = techniques
    .map(t => formatArtisanText(t))
    .filter(t => t && t !== 'Sin especificar');
  
  return Array.from(new Set(normalized)).sort();
};
