import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { BadgeTarget, BadgeAssignment } from '../entities/badge.entity';

export class CreateBadgeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsEnum(BadgeTarget)
  targetType: BadgeTarget;

  @IsEnum(BadgeAssignment)
  assignmentType: BadgeAssignment;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
