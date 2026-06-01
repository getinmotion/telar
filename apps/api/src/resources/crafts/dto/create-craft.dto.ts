import { IsString, IsOptional, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { ApprovalStatus } from '../entities/craft.entity';

export class CreateCraftDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsUUID()
  suggestedBy?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
