import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateArtisansCommercialTwoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopRangePayment!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopKnowledgeCost!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopKnowledgeDefineCost!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopKnowledgeIsProfitable!: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
