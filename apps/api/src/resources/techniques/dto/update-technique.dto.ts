import { PartialType } from '@nestjs/swagger';
import { CreateTechniqueDto } from './create-technique.dto';

export class UpdateTechniqueDto extends PartialType(CreateTechniqueDto) {}
