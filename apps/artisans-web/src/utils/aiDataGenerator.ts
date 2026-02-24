export interface AIProductData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  materials?: string[];
}

export const generateDefaultProductData = (
  imageAnalysis?: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
  }
): AIProductData => {
  // Default categories for artisan products
  const defaultCategories = [
    'Cerámica',
    'Textiles',
    'Joyería',
    'Madera',
    'Cuero',
    'Arte',
    'Decoración',
    'Accesorios',
    'Bisutería',
    'Artesanías'
  ];

  // Default materials
  const materialOptions = [
    ['cerámica', 'arcilla', 'esmalte'],
    ['algodón', 'lana', 'seda', 'hilo'],
    ['plata', 'oro', 'cobre', 'bronce'],
    ['madera', 'bambú', 'cedro'],
    ['cuero genuino', 'piel'],
    ['vidrio', 'cristal'],
    ['metal', 'hierro', 'acero'],
    ['piedra natural', 'mármol'],
    ['resina', 'polímero']
  ];

  // Generate intelligent defaults based on analysis
  const category = imageAnalysis?.category || 
    defaultCategories[Math.floor(Math.random() * defaultCategories.length)];

  const name = imageAnalysis?.name || 
    `Hermoso ${category} Artesanal`;

  const description = imageAnalysis?.description || 
    `Exquisito ${category.toLowerCase()} hecho completamente a mano por artesanos expertos. ` +
    `Cada pieza es única y refleja la tradición y calidad de la artesanía colombiana. ` +
    `Perfecto para decorar tu hogar o regalar a alguien especial. ` +
    `Materiales de alta calidad y acabados impecables garantizan durabilidad y belleza.`;

  const baseTags = [
    'artesanal',
    'hecho-a-mano',
    'colombiano',
    'único',
    'tradicional',
    'calidad',
    'auténtico'
  ];

  const categoryTags = {
    'Cerámica': ['cerámica', 'barro', 'alfarería'],
    'Textiles': ['textil', 'tejido', 'bordado'],
    'Joyería': ['joya', 'accesorio', 'elegante'],
    'Madera': ['madera', 'tallado', 'natural'],
    'Cuero': ['cuero', 'piel', 'resistente'],
    'Arte': ['arte', 'pintura', 'decorativo'],
    'Decoración': ['decoración', 'hogar', 'ornamental'],
    'Accesorios': ['accesorio', 'complemento', 'moda'],
    'Bisutería': ['bisutería', 'fashion', 'trendy'],
    'Artesanías': ['artesanía', 'craft', 'handmade']
  };

  const specificTags = categoryTags[category as keyof typeof categoryTags] || [];
  const tags = imageAnalysis?.tags || 
    [...baseTags, ...specificTags].slice(0, 6);

  // Price calculation based on category
  const priceRanges = {
    'Cerámica': [25000, 80000],
    'Textiles': [35000, 120000],
    'Joyería': [45000, 200000],
    'Madera': [30000, 150000],
    'Cuero': [40000, 180000],
    'Arte': [50000, 300000],
    'Decoración': [25000, 100000],
    'Accesorios': [20000, 75000],
    'Bisutería': [15000, 60000],
    'Artesanías': [20000, 90000]
  };

  const [minPrice, maxPrice] = priceRanges[category as keyof typeof priceRanges] || [30000, 80000];
  const price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);

  // Select appropriate materials
  const materialIndex = Math.floor(Math.random() * materialOptions.length);
  const materials = materialOptions[materialIndex];

  return {
    name,
    description,
    category,
    tags,
    price,
    materials
  };
};

export const enhanceProductDescription = (
  baseDescription: string,
  category: string,
  materials?: string[]
): string => {
  const enhancements = {
    benefits: [
      'Pieza única e irrepetible',
      'Hecho por artesanos expertos',
      'Materiales de primera calidad',
      'Tradición artesanal colombiana',
      'Perfecto para regalar',
      'Decoración exclusiva'
    ],
    care: {
      'Cerámica': 'Limpiar con paño suave y agua. Evitar golpes.',
      'Textiles': 'Lavado a mano con agua fría. Secar a la sombra.',
      'Joyería': 'Limpiar con paño suave. Guardar en lugar seco.',
      'Madera': 'Limpiar con paño húmedo. Aplicar cera ocasionalmente.',
      'Cuero': 'Limpiar con paño seco. Aplicar acondicionador.',
      'default': 'Manejar con cuidado. Limpiar suavemente.'
    }
  };

  const careInstructions = enhancements.care[category as keyof typeof enhancements.care] || 
    enhancements.care.default;

  const materialText = materials && materials.length > 0 
    ? `\n\n**Materiales:** ${materials.join(', ')}`
    : '';

  const benefitText = `\n\n**Características destacadas:**\n${enhancements.benefits.slice(0, 3).map(b => `• ${b}`).join('\n')}`;

  const careText = `\n\n**Cuidados:** ${careInstructions}`;

  return baseDescription + materialText + benefitText + careText;
};