import { ApiProperty } from '@nestjs/swagger';

export class MarketplaceProductDto {
  @ApiProperty({ description: 'ID del producto' })
  id!: string;

  @ApiProperty({ description: 'Nombre del producto' })
  name!: string;

  @ApiProperty({ description: 'Descripción del producto' })
  description!: string;

  @ApiProperty({ description: 'Descripción corta' })
  shortDescription!: string;

  @ApiProperty({ description: 'Precio del producto' })
  price!: string;

  @ApiProperty({ description: 'URL de la primera imagen' })
  imageUrl?: string;

  @ApiProperty({ description: 'Array de imágenes' })
  images!: string[];

  @ApiProperty({ description: 'Stock total (calculado)' })
  stock!: number;

  @ApiProperty({ description: 'Rating promedio (calculado)' })
  rating!: number;

  @ApiProperty({ description: 'Cantidad de reviews (calculado)' })
  reviewsCount!: number;

  @ApiProperty({ description: 'Es nuevo (creado en últimos 30 días)' })
  isNew!: boolean;

  @ApiProperty({ description: 'Tiene envío gratis' })
  freeShipping!: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Estado de moderación' })
  moderationStatus!: string;

  @ApiProperty({ description: 'Tags del producto' })
  tags!: string[];

  @ApiProperty({ description: 'Materiales' })
  materials!: string[];

  @ApiProperty({ description: 'Técnicas' })
  techniques!: string[];

  @ApiProperty({ description: 'Categoría' })
  category!: string;

  @ApiProperty({ description: 'Categoría original' })
  originalCategory!: string;

  @ApiProperty({ description: 'Subcategoría' })
  subcategory?: string;

  @ApiProperty({ description: 'SKU' })
  sku?: string;

  @ApiProperty({ description: 'Producto activo' })
  active!: boolean;

  @ApiProperty({ description: 'Producto destacado' })
  featured!: boolean;

  @ApiProperty({ description: 'Es personalizable' })
  customizable!: boolean;

  @ApiProperty({ description: 'Hecho por encargo' })
  madeToOrder!: boolean;

  @ApiProperty({ description: 'Días de tiempo de entrega' })
  leadTimeDays?: number;

  @ApiProperty({ description: 'Datos de envío completos' })
  shippingDataComplete!: boolean;

  @ApiProperty({ description: 'Permite recogida local' })
  allowsLocalPickup!: boolean;

  @ApiProperty({ description: 'Artesanía (tags[1])' })
  craft?: string;

  @ApiProperty({ description: 'Material principal (tags[0])' })
  material?: string;

  // Datos de la tienda
  @ApiProperty({ description: 'ID de la tienda' })
  shopId!: string;

  @ApiProperty({ description: 'Nombre de la tienda' })
  storeName!: string;

  @ApiProperty({ description: 'Slug de la tienda' })
  storeSlug!: string;

  @ApiProperty({ description: 'Logo URL de la tienda' })
  logoUrl?: string;

  @ApiProperty({ description: 'Banner URL de la tienda' })
  bannerUrl?: string;

  @ApiProperty({ description: 'Descripción de la tienda' })
  storeDescription?: string;

  @ApiProperty({ description: 'Región de la tienda' })
  region?: string;

  @ApiProperty({ description: 'Ciudad de la tienda' })
  city?: string;

  @ApiProperty({ description: 'Departamento de la tienda' })
  department?: string;

  @ApiProperty({ description: 'Tipo de artesanía de la tienda' })
  craftType?: string;

  @ApiProperty({ description: 'Estado de datos bancarios' })
  bankDataStatus!: string;

  @ApiProperty({ description: 'Se puede comprar este producto' })
  canPurchase!: boolean;
}
