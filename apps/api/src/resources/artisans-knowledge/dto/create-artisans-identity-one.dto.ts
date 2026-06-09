import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateArtisansIdentityOneDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nameShop!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  artisanHistory!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  ageExperience!: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopHistory?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopDescription?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopDefinition?: string;

  // Stores one or more category UUIDs separated by commas
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopCategoriesId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopSpecialDefinitionOne?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopSpecialDefinitionTwo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopSpecialDefinitionThree?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopBornSpecialDefinitionOne?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopBornSpecialDefinitionTwo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopBornSpecialDefinitionThree?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
