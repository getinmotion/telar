import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateArtisansOperationGrowthFourDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopKnowledgeProductsMakeMonth!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopKnowledgeLimitTodayOne!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopKnowledgeLimitTodayTwo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shopKnowledgeLimitTodayThree?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopManyWorkers!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shopFirstSolvingTelar!: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
