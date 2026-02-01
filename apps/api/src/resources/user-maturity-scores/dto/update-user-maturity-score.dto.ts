import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserMaturityScoreDto } from './create-user-maturity-score.dto';

// Omitimos userId porque no se debe poder actualizar
export class UpdateUserMaturityScoreDto extends PartialType(
  OmitType(CreateUserMaturityScoreDto, ['userId'] as const),
) {}
