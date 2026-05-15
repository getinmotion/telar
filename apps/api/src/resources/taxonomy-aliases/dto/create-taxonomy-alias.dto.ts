import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNotEmpty, IsIn } from 'class-validator';
import { TaxonomyAliasType } from '../entities/taxonomy-alias.entity';

export class CreateTaxonomyAliasDto {
  @ApiProperty({ description: 'ID del término canónico al que apunta este alias' })
  @IsUUID()
  @IsNotEmpty()
  canonicalId!: string;

  @ApiProperty({
    description: 'Tipo de taxonomía',
    enum: ['material', 'craft', 'technique', 'style'],
  })
  @IsString()
  @IsIn(['material', 'craft', 'technique', 'style'])
  canonicalType!: TaxonomyAliasType;

  @ApiProperty({ description: 'Nombre alternativo / término fusionado' })
  @IsString()
  @IsNotEmpty()
  aliasName!: string;

  @ApiPropertyOptional({ description: 'ID del moderador' })
  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
