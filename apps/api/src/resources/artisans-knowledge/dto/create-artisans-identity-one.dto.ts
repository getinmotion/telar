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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopHistory!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopDescription!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopDefinition!: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  shopCategoriesId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopSpecialDefinitionOne!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopSpecialDefinitionTwo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopSpecialDefinitionThree?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopBornSpecialDefinitionOne!: string;

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
