import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsIn, IsOptional, IsNotEmpty } from 'class-validator';
import { MarketplaceKey } from '../entities/marketplace-assignment.entity';

export class CreateMarketplaceAssignmentDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description: 'Marketplace destino',
    enum: ['premium', 'regional', 'sponsor', 'hotel', 'design'],
  })
  @IsString()
  @IsIn(['premium', 'regional', 'sponsor', 'hotel', 'design'])
  marketplaceKey!: MarketplaceKey;

  @ApiPropertyOptional({ description: 'ID del curador' })
  @IsUUID()
  @IsOptional()
  assignedBy?: string;
}

export class RemoveMarketplaceAssignmentDto {
  @ApiPropertyOptional({ description: 'Razón de remoción' })
  @IsString()
  @IsOptional()
  removalReason?: string;
}
