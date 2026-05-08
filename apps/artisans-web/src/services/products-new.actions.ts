/**
 * Products-New Service
 * Servicio para crear y actualizar productos usando la arquitectura multicapa
 */

import { telarApi } from '@/integrations/api/telarApi';
import type { WizardState } from '@/components/shop/ai-upload/hooks/useWizardState';
import type {
  CreateProductsNewDto,
  CreateProductMediaDto,
  ProductResponse,
} from './products-new.types';

// ============= HELPER FUNCTIONS =============

/**
 * Convierte un precio en pesos colombianos a minor units (centavos)
 * @param price Precio en COP (ej: 50000)
 * @returns Precio en centavos como string (ej: "5000000")
 */
export const priceToMinor = (price: number): string => {
  return Math.round(price * 100).toString();
};

/**
 * Extrae la ruta relativa de una URL completa de S3
 * @param fullUrl URL completa (ej: https://bucket.s3.region.amazonaws.com/images/products/file.jpg)
 * @returns Ruta relativa (ej: /images/products/file.jpg)
 */
const extractRelativePath = (fullUrl: string): string => {
  // Buscar la posición de /images/ en la URL
  const imagesIndex = fullUrl.indexOf('/images/');

  if (imagesIndex !== -1) {
    // Retornar desde /images/ en adelante
    return fullUrl.substring(imagesIndex);
  }

  // Si no se encuentra /images/, intentar extraer el pathname de la URL
  try {
    const urlObj = new URL(fullUrl);
    return urlObj.pathname;
  } catch {
    // Si falla el parsing, retornar la URL original
    console.warn('No se pudo extraer ruta relativa de:', fullUrl);
    return fullUrl;
  }
};

/**
 * Mapea un array de URLs de imágenes a CreateProductMediaDto[]
 * @param imageUrls Array de URLs de imágenes subidas al cloud
 * @returns Array de DTOs de media con metadata (solo rutas relativas)
 */
export const mapImagesToMedia = (
  imageUrls: string[]
): CreateProductMediaDto[] => {
  return imageUrls.map((url, index) => ({
    mediaUrl: extractRelativePath(url), // Solo guardar ruta relativa
    mediaType: 'image' as const,
    isPrimary: index === 0, // Primera imagen es la principal
    displayOrder: index,
  }));
};

/**
 * Mapea el estado del wizard a CreateProductsNewDto (estructura multicapa)
 * @param wizardState Estado completo del wizard
 * @param storeId ID de la tienda del artesano
 * @param uploadedImageUrls URLs de las imágenes ya subidas al cloud
 * @returns DTO listo para enviar al backend
 */
export const mapWizardStateToCreateDto = (
  wizardState: WizardState,
  storeId: string,
  uploadedImageUrls: string[]
): CreateProductsNewDto => {
  const dto: CreateProductsNewDto = {
    // ProductCore (campos básicos)
    storeId,
    categoryId: wizardState.category || undefined,
    name: wizardState.name.trim(),
    shortDescription:
      wizardState.shortDescription?.trim() ||
      wizardState.description?.trim().substring(0, 150) ||
      '',
    history: wizardState.history?.trim() || undefined,
    status: 'draft', // Siempre draft para guardado de borrador

    // Capa: Media (imágenes)
    media: mapImagesToMedia(uploadedImageUrls),
  };

  // Construir artisanalIdentity solo si hay datos de taxonomía
  if (
    wizardState.craftId ||
    wizardState.primaryTechniqueId ||
    wizardState.secondaryTechniqueId ||
    wizardState.curatorialCategory ||
    wizardState.pieceType ||
    wizardState.style ||
    wizardState.processType ||
    wizardState.estimatedElaborationTime
  ) {
    dto.artisanalIdentity = {
      primaryCraftId: wizardState.craftId || undefined,
      primaryTechniqueId: wizardState.primaryTechniqueId || undefined,
      secondaryTechniqueId: wizardState.secondaryTechniqueId || undefined,
      curatorialCategoryId: wizardState.curatorialCategory || undefined,
      pieceType: wizardState.pieceType || undefined,
      style: wizardState.style || undefined,
      processType: wizardState.processType || undefined,
      estimatedElaborationTime:
        wizardState.estimatedElaborationTime || undefined,
      isCollaboration: false, // Default
    };
  }

  // Construir physicalSpecs solo si hay dimensiones o peso
  if (
    wizardState.dimensions?.length ||
    wizardState.dimensions?.width ||
    wizardState.dimensions?.height ||
    wizardState.weight
  ) {
    dto.physicalSpecs = {
      lengthOrDiameterCm: wizardState.dimensions?.length
        ? Number(wizardState.dimensions.length)
        : undefined,
      widthCm: wizardState.dimensions?.width
        ? Number(wizardState.dimensions.width)
        : undefined,
      heightCm: wizardState.dimensions?.height
        ? Number(wizardState.dimensions.height)
        : undefined,
      realWeightKg: wizardState.weight ? Number(wizardState.weight) : undefined,
    };
  }

  // Construir production solo si hay availabilityType
  if (wizardState.availabilityType) {
    dto.production = {
      availabilityType: wizardState.availabilityType,
      productionTimeDays: wizardState.leadTimeDays
        ? Number(wizardState.leadTimeDays)
        : undefined,
      monthlyCapacity: undefined, // No está en wizard state
    };
  }

  // Construir materials solo si hay seleccionados
  if (wizardState.materials && wizardState.materials.length > 0) {
    dto.materials = wizardState.materials.map((materialId, index) => ({
      materialId,
      isPrimary: index === 0, // Primer material es primario
    }));
  }

  // Construir variante default con precio e inventario
  if (wizardState.price && wizardState.price > 0) {
    dto.variants = [
      {
        stockQuantity: wizardState.inventory ? Number(wizardState.inventory) : 1,
        basePriceMinor: priceToMinor(wizardState.price),
        currency: 'COP',
        isActive: true,
      },
    ];
  }

  return dto;
};

// ============= API FUNCTIONS =============

/**
 * Crea un nuevo producto en la arquitectura multicapa
 * @param createDto DTO completo del producto
 * @returns Producto creado con todas sus relaciones
 */
export const createProductNew = async (
  createDto: CreateProductsNewDto
): Promise<ProductResponse> => {
  try {
    console.log('📤 Enviando producto a /products-new:', createDto);
    const response = await telarApi.post<ProductResponse>(
      '/products-new',
      createDto
    );
    console.log('✅ Producto creado exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creando producto:', error);
    throw error;
  }
};

/**
 * Actualiza un producto existente
 * @param productId ID del producto a actualizar
 * @param updateDto DTO parcial con los campos a actualizar
 * @returns Producto actualizado
 */
export const updateProductNew = async (
  productId: string,
  updateDto: Partial<CreateProductsNewDto>
): Promise<ProductResponse> => {
  try {
    const dtoWithId = { ...updateDto, productId };
    console.log('📤 Actualizando producto:', dtoWithId);
    const response = await telarApi.post<ProductResponse>(
      '/products-new',
      dtoWithId
    );
    console.log('✅ Producto actualizado exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error actualizando producto:', error);
    throw error;
  }
};

/**
 * Obtiene un producto por ID
 * @param productId ID del producto
 * @returns Producto con todas sus relaciones
 */
export const getProductNewById = async (
  productId: string
): Promise<ProductResponse | null> => {
  try {
    const response = await telarApi.get<ProductResponse>(
      `/products-new/${productId}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

/**
 * Obtiene todos los productos de una tienda
 * @param storeId ID de la tienda
 * @returns Array de productos
 */
export const getProductsNewByStoreId = async (
  storeId: string
): Promise<ProductResponse[]> => {
  try {
    const response = await telarApi.get<ProductResponse[]>(
      `/products-new/store/${storeId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo productos de tienda:', error);
    throw error;
  }
};

/**
 * Elimina un producto (soft delete)
 * Endpoint: DELETE /products-new/:id
 * Marca como eliminado el producto y todas sus entidades relacionadas
 * @param productId ID del producto a eliminar
 */
/**
 * Busca productos paginados (con filtro `search` por nombre).
 * Endpoint: GET /products-new?search=&limit=&page=
 */
export const searchProductsNew = async (params: {
  search?: string;
  limit?: number;
  page?: number;
  status?: string;
}): Promise<{
  data: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const response = await telarApi.get('/products-new', {
    params: {
      search: params.search,
      limit: params.limit ?? 20,
      page: params.page ?? 1,
      status: params.status,
    },
  });
  return response.data;
};

/**
 * Hidrata productos por IDs.
 * Endpoint: POST /products-new/by-ids
 */
export const getProductsNewByIds = async (
  ids: string[],
): Promise<ProductResponse[]> => {
  if (!ids || ids.length === 0) return [];
  const response = await telarApi.post<ProductResponse[]>('/products-new/by-ids', {
    ids,
  });
  return response.data;
};

export const deleteProductNew = async (productId: string): Promise<void> => {
  try {
    await telarApi.delete(`/products-new/${productId}`);
  } catch (error: any) {
    console.error('❌ Error eliminando producto:', error);
    throw error;
  }
};

/**
 * Convierte un precio de minor units (centavos) a pesos
 * @param priceMinor Precio en centavos como string (ej: "5000000")
 * @returns Precio en COP (ej: 50000)
 */
const minorToPrice = (priceMinor: string): number => {
  return Math.round(parseInt(priceMinor) / 100);
};

/**
 * Mapea ProductResponse (products-new) a Product legacy
 * Para compatibilidad con componentes que usan la estructura antigua
 * @param product ProductResponse de products-new
 * @returns Product en formato legacy
 */
export const mapProductResponseToLegacy = (product: ProductResponse): any => {
  const firstVariant = product.variants?.[0];
  const firstImage = product.media
    ?.filter((m) => m.mediaType === 'image')
    .sort((a, b) => a.displayOrder - b.displayOrder)[0];

  return {
    id: product.id,
    shop_id: product.storeId,
    name: product.name,
    description: product.history || product.shortDescription,
    short_description: product.shortDescription,
    price: firstVariant?.basePriceMinor ? minorToPrice(firstVariant.basePriceMinor) : 0,
    category: product.categoryId || '',
    images: product.media
      ?.filter((m) => m.mediaType === 'image')
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((m) => m.mediaUrl) || [],
    inventory: firstVariant?.stockQuantity || 0,
    sku: firstVariant?.sku || '',
    active: product.status === 'approved',
    moderation_status: product.status,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
    // Agregar variantId para facilitar actualizaciones
    _variantId: firstVariant?.id,
  };
};

/**
 * Mapea un ProductResponse a WizardState para modo edición
 * @param product Producto obtenido del backend
 * @returns Estado del wizard con los datos del producto
 */
export const mapProductResponseToWizardState = (
  product: ProductResponse
): any => {
  // Extraer primera variante (default)
  const firstVariant = product.variants?.[0];

  // Extraer imágenes (como URLs string directamente)
  const images = product.media
    ?.filter((m) => m.mediaType === 'image')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => m.mediaUrl) || [];

  return {
    // Step 1: Imágenes y básicos
    images,
    name: product.name,
    shortDescription: product.shortDescription,
    history: product.history || '',
    category: product.categoryId || '',
    status: product.status || 'draft',

    // Step 2: Taxonomía (artisanalIdentity)
    craftId: product.artisanalIdentity?.primaryCraftId || '',
    primaryTechniqueId: product.artisanalIdentity?.primaryTechniqueId || '',
    secondaryTechniqueId: product.artisanalIdentity?.secondaryTechniqueId || '',
    curatorialCategory: product.artisanalIdentity?.curatorialCategoryId || '',
    pieceType: product.artisanalIdentity?.pieceType || '',
    style: product.artisanalIdentity?.style || '',
    processType: product.artisanalIdentity?.processType || '',
    estimatedElaborationTime: product.artisanalIdentity?.estimatedElaborationTime || '',

    // Materiales
    materials: product.materials?.map((m) => m.materialId) || [],

    // Step 3: Precio y detalles (ahora es Step 4)
    price: firstVariant?.basePriceMinor ? minorToPrice(firstVariant.basePriceMinor) : 0,
    inventory: firstVariant?.stockQuantity || 0,
    sku: firstVariant?.sku || '',

    // Dimensiones (physicalSpecs)
    dimensions: {
      length: product.physicalSpecs?.lengthOrDiameterCm || 0,
      width: product.physicalSpecs?.widthCm || 0,
      height: product.physicalSpecs?.heightCm || 0,
    },
    weight: product.physicalSpecs?.realWeightKg || 0,

    // Producción
    availabilityType: product.production?.availabilityType || '',
    leadTimeDays: product.production?.productionTimeDays || 0,

    // Otros campos del wizard
    description: product.shortDescription, // Usar shortDescription como description
    customizable: false, // No está en el schema nuevo
    madeToOrder: product.production?.availabilityType === 'bajo_pedido',
    productionTimeHours: 0, // No está en el schema nuevo
    allowsLocalPickup: false, // No está en el schema nuevo
    hasVariants: false,
    variantOptions: [],
    variants: [],
  };
};
