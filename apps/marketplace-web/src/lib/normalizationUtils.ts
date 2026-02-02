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
 * Agrupar oficios similares bajo nombres canónicos
 * Mapea variantes comunes a nombres estándar
 */
export const normalizeCraft = (craft: string | null | undefined): string => {
  if (!craft) return 'Sin especificar';
  
  const normalized = normalizeArtisanText(craft);
  
  // Mapeo de variantes a nombres canónicos
  const craftMap: Record<string, string> = {
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
    // Joyería
    'joyeria': 'Joyería',
    'bisuteria': 'Joyería',
    'alhajas': 'Joyería',
    'orfebreria': 'Joyería',
    'jewelry': 'Joyería',
    'jewellery': 'Joyería',
    'accessories': 'Joyería',
    // Cerámica
    'ceramica': 'Cerámica',
    'alfareria': 'Cerámica',
    'barro': 'Cerámica',
    'arcilla': 'Cerámica',
    'ceramics': 'Cerámica',
    'ceramic': 'Cerámica',
    'pottery': 'Cerámica',
    // Carpintería y Ebanistería
    'carpinteria': 'Carpintería y Ebanistería',
    'ebanisteria': 'Carpintería y Ebanistería',
    'madera': 'Carpintería y Ebanistería',
    'muebles': 'Carpintería y Ebanistería',
    'woodwork': 'Carpintería y Ebanistería',
    'woodworking': 'Carpintería y Ebanistería',
    // Textiles No Tejidos
    'textiles': 'Textiles No Tejidos',
    'telas': 'Textiles No Tejidos',
    'bordado': 'Textiles No Tejidos',
    'embroidery': 'Textiles No Tejidos',
    'sewing': 'Textiles No Tejidos',
    // Marroquinería
    'marroquineria': 'Marroquinería',
    'cuero': 'Marroquinería',
    'piel': 'Marroquinería',
    'leatherwork': 'Marroquinería',
    'leather': 'Marroquinería',
    // Talla en Madera
    'talla': 'Talla en Madera',
    'tallado': 'Talla en Madera',
    'escultura': 'Talla en Madera',
    'carving': 'Talla en Madera',
    // Pintura Artesanal
    'pintura': 'Pintura Artesanal',
    'arte': 'Pintura Artesanal',
    'painting': 'Pintura Artesanal',
    // Arte Floral
    'flores': 'Arte Floral',
    'floral': 'Arte Floral',
    // Encuadernación
    'encuadernacion': 'Encuadernación',
    'libros': 'Encuadernación',
    'bookbinding': 'Encuadernación',
    // Otros oficios específicos
    'metalwork': 'Metalistería',
    'metal': 'Metalistería',
    'glasswork': 'Vidriería',
    'glass': 'Vidriería',
    'vidrio': 'Vidriería',
    'papercraft': 'Trabajo en Papel',
    'papel': 'Trabajo en Papel',
    // Términos genéricos -> Sin especificar
    'other': 'Sin especificar',
    'others': 'Sin especificar',
    'otro': 'Sin especificar',
    'otros': 'Sin especificar',
    'n/a': 'Sin especificar',
    'none': 'Sin especificar',
    'unknown': 'Sin especificar',
    'desconocido': 'Sin especificar',
  };
  
  // Buscar coincidencias parciales (para variantes)
  for (const [key, canonical] of Object.entries(craftMap)) {
    if (normalized.includes(key)) {
      return canonical;
    }
  }
  
  // Si no hay match, devolver formateado (Title Case)
  return formatArtisanText(craft);
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
