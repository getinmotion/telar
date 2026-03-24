/**
 * Tipos para el wizard de creación de producto v2
 * Alineados con el nuevo schema EAV (products_core + tablas relacionadas)
 */

export type PieceType = 'funcional' | 'decorativa' | 'mixta';
export type StyleType = 'tradicional' | 'contemporaneo' | 'fusion';
export type ProcessType = 'manual' | 'mixto' | 'asistido';
export type AvailabilityType = 'en_stock' | 'bajo_pedido' | 'edicion_limitada';

export interface ArtisanalIdentity {
  craft: string;
  primaryTechnique: string;
  secondaryTechnique?: string;
  pieceType?: PieceType;
  style?: StyleType;
  processType?: ProcessType;
  estimatedElaborationTime?: string;
  isCollaboration?: boolean;
}

export interface MaterialEntry {
  name: string;
  isPrimary?: boolean;
  origin?: string;
  isProposal?: boolean; // Propuesta nueva para aprobación curatorial
}

/** Propuesta de un nuevo valor de catálogo (craft, technique, material) */
export interface TaxonomyProposal {
  type: 'craft' | 'technique' | 'material';
  name: string;
  description?: string;
}

/** Care tag seleccionado o propuesto */
export interface CareTagEntry {
  name: string;
  isFromCatalog: boolean;
}

/** Solicitud de categoría curatorial / badge de certificación */
export interface CuratorialRequest {
  categoryName?: string;
  badgeCodes: string[];
  notes?: string;
}

export interface PhysicalSpecs {
  heightCm?: number;
  widthCm?: number;
  lengthOrDiameterCm?: number;
  realWeightKg?: number;
}

export interface ProductionInfo {
  availabilityType: AvailabilityType;
  productionTimeDays?: number;
  monthlyCapacity?: number;
  requirementsToStart?: string;
}

export interface VariantEntry {
  sku?: string;
  basePriceMinor: number;
  stockQuantity?: number;
  attributes?: Record<string, string>;
}

export interface CreateProductV2Data {
  // Step 1: La Pieza
  name: string;
  shortDescription: string;
  history?: string;
  careNotes?: string;
  categoryId?: string;
  images: string[];

  // Step 2: Identidad Artesanal
  artisanalIdentity?: ArtisanalIdentity;
  materials?: MaterialEntry[];
  careTags?: CareTagEntry[];
  taxonomyProposals?: TaxonomyProposal[];
  curatorialRequest?: CuratorialRequest;

  // Step 3: Precio y Disponibilidad
  price?: number;
  variants?: VariantEntry[];
  production?: ProductionInfo;
  physicalSpecs?: PhysicalSpecs;

  // Meta
  shopId: string;
  tags?: string[];
}

export type WizardStep = 0 | 1 | 2 | 3;

export const WIZARD_STEPS = [
  { id: 0 as const, label: 'La Pieza', sublabel: 'Nombre e historia' },
  { id: 1 as const, label: 'Artesanía', sublabel: 'Oficio y materiales' },
  { id: 2 as const, label: 'Precio', sublabel: 'Valor y disponibilidad' },
  { id: 3 as const, label: 'Publicar', sublabel: 'Revisar y enviar' },
] as const;

/** Catálogos mock - se reemplazarán con datos del API */
export const MOCK_CRAFTS = [
  'Tejido',
  'Cerámica',
  'Cestería',
  'Joyería',
  'Talla en madera',
  'Orfebrería',
  'Bordado',
  'Marroquinería',
  'Sombrerería',
  'Hamacas',
];

export const MOCK_TECHNIQUES = [
  'Telar de pedal',
  'Telar de cintura',
  'Torno alfarero',
  'Modelado a mano',
  'Filigrana',
  'Macramé',
  'Crochet',
  'Tallado',
  'Repujado',
  'Tintura natural',
];

export const MOCK_CATEGORIES = [
  { id: 'textiles', name: 'Textiles y Moda' },
  { id: 'ceramica', name: 'Cerámica y Barro' },
  { id: 'joyeria', name: 'Joyería y Accesorios' },
  { id: 'madera', name: 'Madera y Talla' },
  { id: 'cesteria', name: 'Cestería y Fibras' },
  { id: 'hogar', name: 'Hogar y Decoración' },
  { id: 'cuero', name: 'Cuero y Marroquinería' },
  { id: 'otros', name: 'Otros Oficios' },
];

export const MOCK_CARE_TAGS = [
  { name: 'Lavado a mano', icon: 'water_drop' },
  { name: 'No usar secadora', icon: 'local_laundry_service' },
  { name: 'No planchar', icon: 'iron' },
  { name: 'Secar a la sombra', icon: 'wb_shade' },
  { name: 'Limpiar con paño húmedo', icon: 'cleaning_services' },
  { name: 'No sumergir en agua', icon: 'do_not_disturb' },
  { name: 'Evitar exposición solar directa', icon: 'wb_sunny' },
  { name: 'Almacenar en lugar seco', icon: 'warehouse' },
  { name: 'Manejar con cuidado', icon: 'pan_tool' },
  { name: 'No usar químicos', icon: 'science' },
];

export const MOCK_CURATORIAL_CATEGORIES = [
  { id: 'patrimonio', name: 'Patrimonio Cultural', description: 'Piezas que representan tradiciones ancestrales' },
  { id: 'sostenible', name: 'Producción Sostenible', description: 'Materiales y procesos ecológicos' },
  { id: 'innovacion', name: 'Innovación Artesanal', description: 'Fusión de técnicas tradicionales con diseño contemporáneo' },
  { id: 'comunidad', name: 'Impacto Comunitario', description: 'Producción que beneficia a comunidades locales' },
];

export const MOCK_CERTIFICATION_BADGES = [
  { code: 'hecho_a_mano', name: 'Hecho a Mano en Colombia', icon: 'back_hand', description: 'Pieza 100% elaborada manualmente' },
  { code: 'comercio_justo', name: 'Comercio Justo', icon: 'handshake', description: 'Producida bajo principios de comercio justo' },
  { code: 'materiales_sostenibles', name: 'Materiales Sostenibles', icon: 'eco', description: 'Elaborada con materiales orgánicos o reciclados' },
  { code: 'huella_digital', name: 'Huella Digital Registrada', icon: 'fingerprint', description: 'Trazabilidad digital del origen al comprador' },
  { code: 'pieza_unica', name: 'Pieza Única', icon: 'diamond', description: 'No existen dos piezas iguales' },
];
