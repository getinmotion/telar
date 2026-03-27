import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApprovalStatus } from '../entities/technique.entity';

export class CreateTechniqueDto {
  @IsUUID()
  craftId: string;

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
