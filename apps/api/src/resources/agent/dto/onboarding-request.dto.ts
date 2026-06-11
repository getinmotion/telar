import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class IdentityOneDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nameShop!: string;

  @ApiProperty()
  artisanHistory!: string;

  @ApiProperty()
  ageExperience!: string;

  @ApiProperty()
  shopHistory!: string;

  @ApiProperty()
  shopDescription!: string;

  @ApiProperty()
  shopDefinition!: string;

  @ApiProperty()
  shopCategoriesId!: string;

  @ApiProperty()
  shopSpecialDefinitionOne!: string;

  @ApiPropertyOptional({ nullable: true })
  shopSpecialDefinitionTwo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  shopSpecialDefinitionThree!: string | null;

  @ApiProperty()
  shopBornSpecialDefinitionOne!: string;

  @ApiPropertyOptional({ nullable: true })
  shopBornSpecialDefinitionTwo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  shopBornSpecialDefinitionThree!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  createdBy!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedBy!: string | null;
}

class CommercialTwoDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  shopRangePayment!: string;

  @ApiProperty()
  shopKnowledgeCost!: string;

  @ApiProperty()
  shopKnowledgeDefineCost!: string;

  @ApiProperty()
  shopKnowledgeIsProfitable!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  createdBy!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedBy!: string | null;
}

class ClientMarketThreeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  shopKnowledgeMainBuyerOne!: string;

  @ApiPropertyOptional({ nullable: true })
  shopKnowledgeMainBuyerTwo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  shopKnowledgeMainBuyerThree!: string | null;

  @ApiProperty()
  shopKnowledgeDigitalPresence!: string;

  @ApiProperty()
  shopKnowledgeWhereSaleOne!: string;

  @ApiPropertyOptional({ nullable: true })
  shopKnowledgeWhereSaleTwo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  shopKnowledgeWhereSaleThree!: string | null;

  @ApiProperty()
  shopKnowledgeSalesActivity!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  createdBy!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedBy!: string | null;
}

class OperationGrowthFourDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  shopKnowledgeProductsMakeMonth!: string;

  @ApiProperty()
  shopKnowledgeLimitTodayOne!: string;

  @ApiPropertyOptional({ nullable: true })
  shopKnowledgeLimitTodayTwo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  shopKnowledgeLimitTodayThree!: string | null;

  @ApiProperty()
  shopManyWorkers!: string;

  @ApiProperty()
  shopFirstSolvingTelar!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  createdBy!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedBy!: string | null;
}

/**
 * DTO para la petición de onboarding al servicio de agentes
 */
export class OnboardingRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  artisansIdentityId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  artisansCommercialId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  artisansClientMarketId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  artisansOperationGrowthId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  createdAt!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  updatedAt!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  createdBy!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  updatedBy!: string;

  @ApiProperty({ type: IdentityOneDto })
  @Type(() => IdentityOneDto)
  @IsNotEmpty()
  identityOne!: IdentityOneDto;

  @ApiProperty({ type: CommercialTwoDto })
  @Type(() => CommercialTwoDto)
  @IsNotEmpty()
  commercialTwo!: CommercialTwoDto;

  @ApiProperty({ type: ClientMarketThreeDto })
  @Type(() => ClientMarketThreeDto)
  @IsNotEmpty()
  clientMarketThree!: ClientMarketThreeDto;

  @ApiProperty({ type: OperationGrowthFourDto })
  @Type(() => OperationGrowthFourDto)
  @IsNotEmpty()
  operationGrowthFour!: OperationGrowthFourDto;

  @ApiProperty()
  @IsBoolean()
  prefilled!: boolean;
}
