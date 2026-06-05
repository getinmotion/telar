import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateArtisansClientMarketThreeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopKnowledgeMainBuyerOne!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopKnowledgeMainBuyerTwo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopKnowledgeMainBuyerThree?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopKnowledgeDigitalPresence!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopKnowledgeWhereSaleOne!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopKnowledgeWhereSaleTwo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopKnowledgeWhereSaleThree?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopKnowledgeSalesActivity!: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
