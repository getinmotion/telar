import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMasterCoordinatorContextDto } from './create-master-coordinator-context.dto';

// Omitimos userId porque no se debe poder actualizar (relación 1:1)
export class UpdateMasterCoordinatorContextDto extends PartialType(
  OmitType(CreateMasterCoordinatorContextDto, ['userId'] as const),
) {}
