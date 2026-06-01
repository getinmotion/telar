import { IsString, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { ApprovalStatus } from '../entities/technique.entity';

export class CreateTechniqueDto {
  @IsOptional()
  @IsUUID()
  craftId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  craftIds?: string[];

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsUUID()
  suggestedBy?: string;
}
