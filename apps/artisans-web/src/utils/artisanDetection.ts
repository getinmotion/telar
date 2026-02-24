import { CraftType } from '@/types/artisan';

// Keywords to detect if a user is an artisan
export const artisanKeywords = [
  'artesanía', 'artesano', 'artesana', 'artesanal',
  'manual', 'hecho a mano', 'handmade',
  'tejido', 'tejer', 'textiles', 'textil',
  'cerámica', 'ceramista', 'alfarería', 'barro',
  'joyería', 'joyero', 'joyera', 'orfebrería',
  'cuero', 'marroquinería', 'talabartería',
  'bordado', 'bordar', 'costura', 'coser',
  'talla', 'tallar', 'madera', 'carpintería',
  'pintura', 'pintar', 'arte', 'artístico',
  'escultura', 'escultor', 'escultora',
  'macramé', 'bisutería', 'cestería',
  'fibra', 'mimbre', 'bambú',
  'vitral', 'vidriero', 'cristal',
  'metal', 'forja', 'herrería',
  'tradicional', 'ancestral', 'cultura',
  'indígena', 'etnico', 'originario'
];

// Product categories that indicate artisan work
export const artisanProductCategories = [
  'artesanías', 'crafts', 'handmade',
  'textiles', 'tejidos', 'ropa tradicional',
  'cerámica', 'pottery', 'alfarería',
  'joyería', 'jewelry', 'accesorios',
  'cuero', 'leather', 'marroquinería',
  'madera', 'wood', 'carpintería',
  'arte', 'art', 'decoración',
  'cestería', 'baskets', 'fibras'
];

// Colombian craft types mapping
export const craftTypeMappings: Record<string, CraftType> = {
  'tejido': 'textiles',
  'textiles': 'textiles',
  'bordado': 'textiles',
  'costura': 'textiles',
  'macramé': 'textiles',
  
  'cerámica': 'ceramics',
  'alfarería': 'ceramics',
  'barro': 'ceramics',
  'pottery': 'ceramics',
  
  'joyería': 'jewelry',
  'orfebrería': 'jewelry',
  'bisutería': 'jewelry',
  'jewelry': 'jewelry',
  
  'cuero': 'leather',
  'marroquinería': 'leather',
  'talabartería': 'leather',
  'leather': 'leather',
  
  'madera': 'woodwork',
  'carpintería': 'woodwork',
  'talla': 'woodwork',
  'wood': 'woodwork',
  
  'cestería': 'basketry',
  'mimbre': 'basketry',
  'fibra': 'basketry',
  'bambú': 'basketry',
  
  'metal': 'metalwork',
  'forja': 'metalwork',
  'herrería': 'metalwork',
  
  'vidrio': 'glasswork',
  'vitral': 'glasswork',
  'cristal': 'glasswork',
  
  'pintura': 'painting',
  
  'escultura': 'sculpture',
  
  // Cosmética y cuidado personal
  'cosmética': 'cosmetics',
  'cosmético': 'cosmetics',
  'cosmetico': 'cosmetics',
  'jabón': 'cosmetics',
  'jabon': 'cosmetics',
  'jabonería': 'cosmetics',
  'crema': 'cosmetics',
  'cremas': 'cosmetics',
  'aceite corporal': 'cosmetics',
  'aceite facial': 'cosmetics',
  'cuidado personal': 'cosmetics',
  'belleza natural': 'cosmetics',
  'skincare': 'cosmetics',
  'bálsamo': 'cosmetics',
  'loción': 'cosmetics',
  'exfoliante': 'cosmetics',
  'mascarilla': 'cosmetics',
  'sérum': 'cosmetics',
  'hidratante': 'cosmetics'
};

/**
 * Detects if a user profile indicates they are an artisan
 */
export const detectArtisanProfile = (responses: Record<string, any>): boolean => {
  const textFields = [
    responses.businessDescription,
    responses.productType,
    responses.industry,
    responses.businessModel,
    responses.specificAnswers?.craft_type,
    responses.specificAnswers?.business_description,
    responses.skillsAndExpertise?.join(' '),
    responses.primaryProducts,
    responses.targetMarket
  ].filter(Boolean).join(' ').toLowerCase();

  // Check for artisan keywords
  const hasArtisanKeywords = artisanKeywords.some(keyword => 
    textFields.includes(keyword.toLowerCase())
  );

  // Check for artisan product categories
  const hasArtisanProducts = artisanProductCategories.some(category => 
    textFields.includes(category.toLowerCase())
  );

  // Check business model
  const isArtisanBusinessModel = responses.businessModel === 'artisan';

  return hasArtisanKeywords || hasArtisanProducts || isArtisanBusinessModel;
};

/**
 * Determines the specific craft type from user responses
 */
export const detectCraftType = (responses: Record<string, any>): CraftType | null => {
  const textFields = [
    responses.businessDescription,
    responses.productType,
    responses.industry,
    responses.specificAnswers?.craft_type,
    responses.specificAnswers?.business_description,
    responses.skillsAndExpertise?.join(' '),
    responses.primaryProducts
  ].filter(Boolean).join(' ').toLowerCase();

  // Find the first matching craft type
  for (const [keyword, craftType] of Object.entries(craftTypeMappings)) {
    if (textFields.includes(keyword.toLowerCase())) {
      return craftType;
    }
  }

  return null;
};

/**
 * Gets artisan-specific suggestions based on detected craft type
 */
export const getArtisanSuggestions = (craftType: CraftType): string[] => {
  const suggestions: Record<CraftType, string[]> = {
    textiles: [
      'Sube fotos de tus tejidos en proceso',
      'Destaca las técnicas tradicionales que usas',
      'Menciona los materiales naturales (algodón, lana, fique)',
      'Incluye medidas y cuidados del producto'
    ],
    ceramics: [
      'Muestra el proceso de modelado y horneado',
      'Destaca si es cerámica utilitaria o decorativa',
      'Menciona el tipo de arcilla y técnicas de esmaltado',
      'Incluye información sobre resistencia y uso'
    ],
    jewelry: [
      'Especifica los materiales (plata, oro, piedras)',
      'Muestra detalles de la técnica de elaboración',
      'Incluye medidas y peso de las piezas',
      'Destaca si son diseños únicos o colecciones'
    ],
    woodwork: [
      'Menciona el tipo de madera utilizada',
      'Destaca las técnicas de tallado o ensamble',
      'Incluye acabados y tratamientos aplicados',
      'Muestra el proceso de creación'
    ],
    leather: [
      'Especifica el tipo y origen del cuero',
      'Destaca las técnicas de curtido y acabado',
      'Incluye medidas y capacidad de los productos',
      'Menciona cuidados y mantenimiento'
    ],
    basketry: [
      'Menciona las fibras naturales utilizadas',
      'Destaca las técnicas de tejido tradicional',
      'Incluye medidas y capacidad',
      'Resalta la sostenibilidad del producto'
    ],
    metalwork: [
      'Especifica el tipo de metal utilizado',
      'Destaca las técnicas de forja o fundición',
      'Incluye peso y dimensiones',
      'Menciona acabados y tratamientos'
    ],
    glasswork: [
      'Describe las técnicas de trabajo en vidrio',
      'Destaca si es vidrio soplado o fundido',
      'Incluye cuidados especiales',
      'Menciona si es funcional o decorativo'
    ],
    painting: [
      'Especifica la técnica pictórica utilizada',
      'Menciona el soporte (lienzo, papel, madera)',
      'Incluye medidas y marco si aplica',
      'Destaca el estilo o temática'
    ],
    sculpture: [
      'Describe el material y técnica utilizada',
      'Incluye peso y dimensiones',
      'Menciona si es para interior o exterior',
      'Destaca el concepto o inspiración'
    ],
    cosmetics: [
      'Especifica los ingredientes naturales utilizados',
      'Destaca el proceso de elaboración artesanal',
      'Menciona los beneficios para la piel',
      'Incluye instrucciones de uso y conservación'
    ],
    paper: [
      'Describe las técnicas de trabajo en papel',
      'Menciona el tipo de papel utilizado',
      'Destaca si es encuadernación, cartonería u otra técnica',
      'Incluye cuidados y usos recomendados'
    ],
    mixed: [
      'Describe las diferentes técnicas que combinas',
      'Menciona los materiales principales de cada técnica',
      'Destaca cómo fusionas tradiciones artesanales',
      'Incluye el proceso de elaboración híbrido'
    ],
    other: [
      'Describe detalladamente tu técnica artesanal',
      'Menciona los materiales que utilizas',
      'Destaca lo que hace únicos tus productos',
      'Incluye el proceso de elaboración'
    ]
  };

  return suggestions[craftType] || suggestions.other;
};