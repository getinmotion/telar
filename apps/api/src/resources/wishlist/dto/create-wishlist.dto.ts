import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWishlistDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'El userId es requerido' })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId!: string;

  @ApiProperty({
    description: 'ID del producto a agregar a wishlist',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'El productId es requerido' })
  @IsUUID('4', { message: 'El productId debe ser un UUID válido' })
  productId!: string;
}
