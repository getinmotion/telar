/**
 * Products Types
 * Tipos para el módulo de productos del marketplace
 */

/**
 * Categoría de producto
 */
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  slug?: string;
}

/**
 * Tienda/Shop asociada al producto
 */
export interface ProductShop {
  id: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  description?: string;
  department?: string;
  municipality?: string;
  active: boolean;
  featured: boolean;
}

/**
 * Producto individual de Marketplace
 * Response de /products/marketplace (cada item en el array data)
 */
export interface Product {
  // Básicos
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: string;              // Precio como string
  imageUrl: string | null;
  images: string[];

  // Calculados (enriquecidos)
  stock: number;              // Desde variantes o inventory
  inventory?: number;       // Campo original, puede ser null
  rating: number;             // Promedio de reviews
  reviewsCount: number;       // Cantidad de reviews
  isNew: boolean;             // Creado hace menos de 30 días
  freeShipping: boolean;
  canPurchase: boolean;       // Puede comprarse (bank + shipping)

  // Metadatos
  tags: string[];
  materials: string[];
  techniques: string[];
  category: string;
  craft: string | null;       // tags[1]
  material: string | null;    // tags[0]

  // Tienda
  shopId: string;
  storeName: string;
  storeSlug: string;
  logoUrl?: string;
  region?: string;
  city?: string;
  department?: string;
  craftType?: string;
  bankDataStatus?: string;

  // Compatibilidad con estructura anterior
  shop?: ProductShop;         // Para componentes que usan shop.shopName
  allowsLocalPickup?: boolean;
  shippingDataComplete?: boolean;

  // Fechas
  createdAt: Date;
  updatedAt: Date;

  // Otros campos
  compactMode?: boolean; // Para mostrar versión compacta en ProductCard
  
}

/**
 * Filtros para la búsqueda de productos de marketplace
 * Query params para GET /products/marketplace
 */
export interface ProductsFilters {
  // Paginación
  page?: number;
  limit?: number;

  // Búsqueda
  q?: string;

  // Filtros principales de marketplace
  category?: string;
  region?: string;
  craftType?: string;
  featured?: boolean;

  // Filtros adicionales (compatibilidad)
  categories?: string;
  crafts?: string;
  materials?: string;
  techniques?: string;
  shopSlug?: string;

  // Rango de precio
  minPrice?: number;
  maxPrice?: number;

  // Rating
  minRating?: number;

  // Filtros booleanos
  freeShipping?: boolean;
  isNew?: boolean;
  canPurchase?: boolean;

  // Ordenamiento
  sortBy?: 'price' | 'created_at' | 'rating' | 'name';
  order?: 'ASC' | 'DESC';

  // Exclusión
  exclude?: string;
}

/**
 * Response paginado de productos
 * Response de GET /products
 */
export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Request para crear un producto (admin)
 */
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId: string;
  shopId: string;
  imageUrl?: string;
  images?: string[];
  materials?: string[];
  techniques?: string[];
  craft?: string;
  tags?: string[];
  featured?: boolean;
  nftEnabled?: boolean;
}

/**
 * Request para actualizar un producto (admin)
 */
export interface UpdateProductRequest extends Partial<CreateProductRequest> {}
