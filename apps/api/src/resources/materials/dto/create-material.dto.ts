import { IsString, IsOptional, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { ApprovalStatus } from '../entities/material.entity';

export class CreateMaterialDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isOrganic?: boolean;

  @IsOptional()
  @IsBoolean()
  isSustainable?: boolean;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsUUID()
  suggestedBy?: string;
}
