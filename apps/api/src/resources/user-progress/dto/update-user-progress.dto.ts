import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserProgressDto } from './create-user-progress.dto';

// Omitimos userId porque no debe actualizarse
export class UpdateUserProgressDto extends PartialType(
  OmitType(CreateUserProgressDto, ['userId'] as const),
) {}
