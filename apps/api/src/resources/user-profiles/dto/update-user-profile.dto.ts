import { PartialType } from '@nestjs/mapped-types';
import { CreateUserProfileDto } from './create-user-profile.dto';
import { OmitType } from '@nestjs/swagger';

// Omitimos userId porque no debe actualizarse
export class UpdateUserProfileDto extends PartialType(
  OmitType(CreateUserProfileDto, ['userId'] as const),
) {}

