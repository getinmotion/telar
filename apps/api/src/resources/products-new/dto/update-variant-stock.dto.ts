import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

/**
 * Ajuste directo de stock de una variante (shop.product_variants).
 * No modifica el estado de moderación del producto.
 */
export class UpdateVariantStockDto {
  @ApiProperty({
    description: 'Nueva cantidad de stock de la variante',
    example: 10,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  stockQuantity: number;
}
