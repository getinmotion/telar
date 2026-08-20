import type {
  PiecePurpose,
  PieceStyle,
  ProductionType,
} from '@/components/shop/new-product-wizard/hooks/useNewWizardState';

/**
 * Catálogo de datos de prueba para el inyector del Product Studio.
 *
 * Datos puros, sin lógica: una "receta" por categoría de marketplace
 * (VALID_MARKETPLACE_CATEGORIES de utils/craftTypeSystem.ts) + una genérica.
 * Las plantillas de texto aceptan {pieza} {oficio} {taller} {lugar}.
 *
 * REGLA DE REDACCIÓN: los calificativos y las plantillas no concuerdan en género
 * ni número con la pieza (una misma receta sirve para "Chal" y para "Aretes"), así
 * que se usan frases preposicionales ("de tejido a mano", no "tejida a mano") y
 * verbos impersonales ("se elabora", no "elaborada").
 *
 * Los tiempos de elaboración salen del catálogo TIME_OPTIONS del paso 3
 * ("1-3 días" | "1 semana" | "15 días" | "1 mes"): usar otro valor hace que el
 * paso abra el campo libre en vez de marcar el chip.
 */

export interface CategoryRecipe {
  /** Sustantivos de pieza; se combinan con un calificativo para el nombre. */
  pieces: string[];
  qualifiers: string[];
  /** Palabras clave para casar contra los nombres reales de taxonomy.materials. */
  materialKeywords: string[];
  /** Nombres de herramientas (el picker de tools trabaja por nombre, no por UUID). */
  tools: string[];
  purpose: PiecePurpose;
  styles: PieceStyle[];
  productionType: ProductionType;
  elaborationTime: string;
  monthlyCapacity: number;
  inventory: number;
  priceCop: number;
  dims: { heightCm: number; widthCm: number; lengthCm: number; weightKg: number };
  pack: {
    packagedHeightCm: number;
    packagedWidthCm: number;
    packagedLengthCm: number;
    packagedWeightKg: number;
  };
  shortDescription: string;
  history: string;
  processDescription: string;
  /** Motivo gráfico del SVG generado. */
  motif: 'bands' | 'rings' | 'grid' | 'arc';
}

export const GENERIC_RECIPE: CategoryRecipe = {
  pieces: ['Pieza artesanal', 'Creación artesanal', 'Obra de taller'],
  qualifiers: ['de trabajo a mano', 'de edición corta', 'de taller'],
  materialKeywords: ['algodón', 'madera', 'barro'],
  tools: ['Herramienta manual', 'Mesa de trabajo'],
  purpose: 'decorativa',
  styles: ['tradicional'],
  productionType: 'limitada',
  elaborationTime: '1 semana',
  monthlyCapacity: 8,
  inventory: 4,
  priceCop: 120000,
  dims: { heightCm: 25, widthCm: 20, lengthCm: 12, weightKg: 0.8 },
  pack: { packagedHeightCm: 30, packagedWidthCm: 26, packagedLengthCm: 18, packagedWeightKg: 1.2 },
  shortDescription:
    '{pieza} {calificativo}. Se elabora a mano en {taller} con técnicas de {oficio} transmitidas de generación en generación; cada unidad tiene variaciones propias del trabajo manual.',
  history:
    'En {lugar}, el taller {taller} trabaja el oficio de {oficio} desde hace años. La pieza nace de ese aprendizaje: materiales de la región, tiempos largos y acabados revisados uno a uno.',
  processDescription:
    'Selección y alistamiento de materiales, elaboración manual de la pieza, secado y curado, y control final de acabados antes de empacar.',
  motif: 'bands',
};

export const CATEGORY_RECIPES: Record<string, CategoryRecipe> = {
  'Textiles y Moda': {
    pieces: ['Ruana', 'Chal', 'Bufanda', 'Manta de lana', 'Camino de mesa'],
    qualifiers: ['en telar de guanga', 'de tejido a mano', 'en lana virgen', 'de urdimbre fina'],
    materialKeywords: ['lana', 'algodón', 'fique', 'seda', 'hilo'],
    tools: ['Telar horizontal', 'Agujas de tejer', 'Husos', 'Tijeras de sastre'],
    purpose: 'funcional',
    styles: ['tradicional'],
    productionType: 'limitada',
    elaborationTime: '15 días',
    monthlyCapacity: 6,
    inventory: 4,
    priceCop: 280000,
    dims: { heightCm: 4, widthCm: 60, lengthCm: 150, weightKg: 0.9 },
    pack: { packagedHeightCm: 12, packagedWidthCm: 30, packagedLengthCm: 40, packagedWeightKg: 1.2 },
    shortDescription:
      '{pieza} {calificativo}. Se elabora en {taller} con fibras naturales hiladas y teñidas en la región: abriga sin peso y envejece bien con el uso.',
    history:
      'El tejido llegó a {lugar} de la mano de las abuelas y hoy sigue vivo en {taller}. La pieza se teje en telar durante varios días: primero se prepara la urdimbre, luego se pasa la trama hilo por hilo hasta cerrar el paño.',
    processDescription:
      'Hilado y selección de la fibra, montaje de la urdimbre en el telar, tejido de la trama, lavado suave para asentar el tejido y remate manual de flecos y bordes.',
    motif: 'bands',
  },

  'Bolsos y Carteras': {
    pieces: ['Mochila de fique', 'Bolso de mano', 'Cartera cruzada', 'Canasto de fibra', 'Morral'],
    qualifiers: ['en fique natural', 'con herrajes artesanales', 'de tejido apretado', 'de trabajo a mano'],
    materialKeywords: ['fique', 'cuero', 'iraca', 'palma', 'cabuya', 'algodón'],
    tools: ['Aguja capotera', 'Chuzo', 'Martillo de talabartero', 'Prensa manual'],
    purpose: 'funcional',
    styles: ['contemporaneo'],
    productionType: 'limitada',
    elaborationTime: '1 semana',
    monthlyCapacity: 10,
    inventory: 6,
    priceCop: 210000,
    dims: { heightCm: 30, widthCm: 28, lengthCm: 12, weightKg: 0.6 },
    pack: { packagedHeightCm: 35, packagedWidthCm: 32, packagedLengthCm: 16, packagedWeightKg: 0.9 },
    shortDescription:
      '{pieza} {calificativo}. Se teje y se arma a mano en {taller}: resiste el uso diario y lleva acabados revisados pieza por pieza.',
    history:
      'En {lugar} el trabajo en fibras y cuero se aprende observando. {taller} mantiene ese oficio de {oficio}: la pieza se teje en varias jornadas y se remata con costuras hechas a mano.',
    processDescription:
      'Alistamiento y torcido de la fibra, tejido del cuerpo de la pieza, armado de asas y forro, y costura final de refuerzos y remates.',
    motif: 'grid',
  },

  'Joyería y Accesorios': {
    pieces: ['Aretes', 'Collar', 'Pulsera', 'Anillo', 'Dije'],
    qualifiers: ['en filigrana', 'en plata ley 950', 'con chaquiras', 'de trabajo a mano'],
    materialKeywords: ['plata', 'chaquira', 'mostacilla', 'semilla', 'cuero', 'bronce'],
    tools: ['Pinzas de joyería', 'Soplete', 'Limas finas', 'Yunque pequeño'],
    purpose: 'decorativa',
    styles: ['contemporaneo'],
    productionType: 'continua',
    elaborationTime: '1-3 días',
    monthlyCapacity: 30,
    inventory: 12,
    priceCop: 95000,
    dims: { heightCm: 5, widthCm: 4, lengthCm: 1, weightKg: 0.05 },
    pack: { packagedHeightCm: 10, packagedWidthCm: 10, packagedLengthCm: 5, packagedWeightKg: 0.2 },
    shortDescription:
      '{pieza} {calificativo}. Se elabora en {taller} con trabajo de detalle y pulido manual: peso liviano para uso diario y acabado brillante.',
    history:
      'La joyería de {lugar} se reconoce por el detalle. En {taller} el oficio de {oficio} se trabaja con herramienta pequeña y mucha paciencia: la pieza se arma, se suelda y se pule a mano.',
    processDescription:
      'Diseño y trazado de la pieza, corte y conformado del material, ensamble y soldadura de las partes, y pulido y brillo final.',
    motif: 'rings',
  },

  'Decoración del Hogar': {
    pieces: ['Jarrón decorativo', 'Individual tejido', 'Móvil de pared', 'Cesta decorativa', 'Portavelas'],
    // Calificativos neutros: la categoría mezcla barro, madera y fibra.
    qualifiers: ['de trabajo a mano', 'con materiales de la región', 'de edición corta', 'de acabado mate'],
    materialKeywords: ['madera', 'barro', 'iraca', 'werregue', 'guadua', 'fique'],
    tools: ['Gubias', 'Lijas', 'Torno de pedal', 'Brocha de acabado'],
    purpose: 'decorativa',
    styles: ['fusion'],
    productionType: 'limitada',
    elaborationTime: '1 semana',
    monthlyCapacity: 12,
    inventory: 6,
    priceCop: 160000,
    dims: { heightCm: 28, widthCm: 18, lengthCm: 18, weightKg: 1.1 },
    pack: { packagedHeightCm: 34, packagedWidthCm: 24, packagedLengthCm: 24, packagedWeightKg: 1.6 },
    shortDescription:
      '{pieza} {calificativo}. Se hace en {taller} con materiales de la región y acompaña el espacio sin competir con él.',
    history:
      'En {lugar} la decoración se hace con lo que da la tierra. {taller} trabaja {oficio} desde el material en bruto: la pieza pasa por corte, formado y varios días de secado antes del acabado final.',
    processDescription:
      'Selección del material, corte y formado de la pieza, secado controlado, lijado progresivo y aplicación del acabado protector.',
    motif: 'arc',
  },

  Muebles: {
    pieces: ['Banco de madera', 'Mesa auxiliar', 'Silla de guadua', 'Repisa', 'Butaco'],
    qualifiers: ['con ensambles a caja y espiga', 'de acabado natural', 'de trabajo a mano', 'de edición corta'],
    materialKeywords: ['madera', 'guadua', 'bambú', 'cuero'],
    tools: ['Formón', 'Serrucho', 'Cepillo de carpintero', 'Prensas'],
    purpose: 'funcional',
    styles: ['contemporaneo'],
    productionType: 'bajo_pedido',
    elaborationTime: '1 mes',
    monthlyCapacity: 3,
    inventory: 2,
    priceCop: 850000,
    dims: { heightCm: 45, widthCm: 40, lengthCm: 40, weightKg: 7 },
    pack: { packagedHeightCm: 55, packagedWidthCm: 50, packagedLengthCm: 50, packagedWeightKg: 9.5 },
    shortDescription:
      '{pieza} {calificativo}. Se construye en {taller} con ensambles tradicionales y sin herrajes a la vista: estabilidad, líneas sobrias y años de uso.',
    history:
      'La carpintería de {lugar} trabaja maderas locales bien secas. En {taller} el oficio de {oficio} sigue el mismo orden de siempre: se selecciona la madera, se labra el ensamble y se ajusta a mano hasta que la pieza no se mueve.',
    processDescription:
      'Secado y selección de la madera, corte de piezas y labrado de ensambles, armado en seco y ajuste, y sellado con aceite natural.',
    motif: 'grid',
  },

  'Vajillas y Cocina': {
    pieces: ['Vasija de barro', 'Juego de pocillos', 'Fuente de cerámica', 'Plato hondo', 'Olla de barro'],
    qualifiers: ['en barro negro', 'de torneado manual', 'con esmalte artesanal', 'de cocción a leña'],
    materialKeywords: ['barro', 'arcilla', 'cerámica', 'greda', 'vidrio'],
    tools: ['Torno de alfarero', 'Espátulas de modelado', 'Horno de leña', 'Piedra de bruñido'],
    purpose: 'funcional',
    styles: ['tradicional'],
    productionType: 'continua',
    elaborationTime: '15 días',
    monthlyCapacity: 20,
    inventory: 8,
    priceCop: 130000,
    dims: { heightCm: 18, widthCm: 16, lengthCm: 16, weightKg: 1.4 },
    pack: { packagedHeightCm: 26, packagedWidthCm: 24, packagedLengthCm: 24, packagedWeightKg: 2 },
    shortDescription:
      '{pieza} {calificativo}. Se hace en {taller} con arcilla de la zona: sirve para la mesa y trae las variaciones de color propias de la cocción artesanal.',
    history:
      'En {lugar} el barro se amasa como hace siglos. {taller} mantiene el oficio de {oficio}: la pieza se levanta a mano, se bruñe con piedra y se cuece hasta tomar su color definitivo.',
    processDescription:
      'Amasado y purga de la arcilla, levantado o torneado de la pieza, bruñido y secado a la sombra, y cocción controlada en horno.',
    motif: 'rings',
  },

  'Arte y Esculturas': {
    pieces: ['Escultura pequeña', 'Figura en madera', 'Cuadro al óleo', 'Máscara ceremonial', 'Relieve mural'],
    qualifiers: ['en edición única', 'de trabajo a mano', 'con pigmentos naturales', 'de acabado protegido'],
    materialKeywords: ['madera', 'piedra', 'pigmento', 'barro', 'semilla'],
    tools: ['Gubias', 'Mazo de madera', 'Cinceles', 'Pinceles'],
    purpose: 'coleccionable',
    styles: ['tradicional'],
    productionType: 'unica',
    elaborationTime: '1 mes',
    monthlyCapacity: 2,
    inventory: 1,
    priceCop: 620000,
    dims: { heightCm: 35, widthCm: 20, lengthCm: 15, weightKg: 2.5 },
    pack: { packagedHeightCm: 45, packagedWidthCm: 30, packagedLengthCm: 25, packagedWeightKg: 3.5 },
    shortDescription:
      '{pieza} {calificativo}. Se realiza en {taller} como obra única: no existe otra igual y conserva las marcas de la herramienta.',
    history:
      'En {lugar} la talla cuenta historias del territorio. {taller} trabaja el oficio de {oficio} sin moldes: la pieza se saca del bloque a golpe de gubia, sesión tras sesión, hasta que aparece la forma.',
    processDescription:
      'Bocetado y selección del bloque, desbaste inicial de la forma, talla de detalle y texturas, y acabado con lija fina y protección superficial.',
    motif: 'arc',
  },

  'Cuidado Personal': {
    pieces: ['Jabón artesanal', 'Bálsamo de hierbas', 'Aceite corporal', 'Exfoliante natural'],
    qualifiers: ['de fórmula simple', 'con hierbas de la región', 'sin fragancias sintéticas', 'en lote pequeño'],
    materialKeywords: ['aceite', 'hierba', 'cera', 'miel', 'arcilla'],
    tools: ['Moldes de madera', 'Balanza de precisión', 'Batidora manual', 'Termómetro'],
    purpose: 'funcional',
    styles: ['contemporaneo'],
    productionType: 'continua',
    elaborationTime: '1 semana',
    monthlyCapacity: 40,
    inventory: 15,
    priceCop: 45000,
    dims: { heightCm: 6, widthCm: 8, lengthCm: 5, weightKg: 0.15 },
    pack: { packagedHeightCm: 10, packagedWidthCm: 12, packagedLengthCm: 8, packagedWeightKg: 0.3 },
    shortDescription:
      '{pieza} {calificativo}. Se prepara en {taller} en lotes pequeños con insumos de origen local: fórmula simple y aroma suave.',
    history:
      'El conocimiento de las plantas de {lugar} pasó de las abuelas al taller. En {taller} el oficio de {oficio} se trabaja por lotes: se pesa, se mezcla en frío y se deja curar el tiempo que pide la fórmula.',
    processDescription:
      'Pesaje de insumos, mezcla y saponificación en frío, moldeado y desmolde, curado por semanas y empaque en material reciclable.',
    motif: 'bands',
  },

  Iluminación: {
    pieces: ['Lámpara de fibra', 'Farol de mesa', 'Pantalla colgante', 'Aplique de pared'],
    qualifiers: ['en iraca tejida', 'con estructura de guadua', 'de luz cálida', 'de tejido a mano'],
    materialKeywords: ['iraca', 'guadua', 'fique', 'madera', 'palma'],
    tools: ['Aguja capotera', 'Alicates', 'Molde de tejido', 'Tijeras'],
    purpose: 'decorativa',
    styles: ['fusion'],
    productionType: 'limitada',
    elaborationTime: '15 días',
    monthlyCapacity: 8,
    inventory: 4,
    priceCop: 340000,
    dims: { heightCm: 40, widthCm: 30, lengthCm: 30, weightKg: 1.2 },
    pack: { packagedHeightCm: 50, packagedWidthCm: 38, packagedLengthCm: 38, packagedWeightKg: 1.8 },
    shortDescription:
      '{pieza} {calificativo}. Se teje en {taller} sobre estructura liviana y difunde la luz en sombras suaves sobre muros y techos.',
    history:
      'En {lugar} se teje desde niños. {taller} llevó ese oficio de {oficio} a la iluminación: la pieza se teje sobre un molde y se monta con conexión eléctrica certificada.',
    processDescription:
      'Preparación de la fibra, tejido de la pantalla sobre molde, montaje de la estructura y el cableado, y revisión final de encendido.',
    motif: 'rings',
  },
};

/** Copy de la variante "próximamente": la ficha anuncia que la pieza está en camino. */
export const TEMPLATE_COPY = {
  name: 'Pieza en preparación — pronto disponible',
  shortDescription:
    'Este producto se está creando en {taller}. Muy pronto estará disponible en Telar con sus fotos, medidas y precio definitivos.',
  history:
    'La tienda {taller} está terminando esta pieza en su taller de {lugar}. Publicamos su ficha por adelantado para que puedas conocer la tienda; cuando la pieza esté lista, actualizaremos las fotos y los detalles del oficio de {oficio}.',
  processDescription:
    'La pieza está en proceso de elaboración. Al finalizar se documentará aquí el proceso completo: alistamiento de materiales, elaboración manual, acabados y control de calidad.',
  careNotes:
    'Las indicaciones de cuidado se publicarán cuando la pieza esté terminada.',
  usageSuggestions:
    'Los usos sugeridos se publicarán cuando la pieza esté terminada.',
  /** Datos numéricos neutros: suficientes para pasar validaciones sin fingir precisión. */
  priceCop: 100000,
  monthlyCapacity: 4,
  inventory: 1,
  elaborationTime: '1 mes',
  productionType: 'bajo_pedido' as ProductionType,
  purpose: 'funcional' as PiecePurpose,
  styles: ['tradicional'] as PieceStyle[],
  dims: { heightCm: 20, widthCm: 20, lengthCm: 20, weightKg: 1 },
  pack: { packagedHeightCm: 28, packagedWidthCm: 28, packagedLengthCm: 28, packagedWeightKg: 1.5 },
};

export const recipeForCategory = (categoryName?: string | null): CategoryRecipe =>
  (categoryName && CATEGORY_RECIPES[categoryName]) || GENERIC_RECIPE;
