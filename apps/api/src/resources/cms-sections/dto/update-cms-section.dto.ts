import { PartialType } from '@nestjs/mapped-types';
import { CreateCmsSectionDto } from './create-cms-section.dto';

export class UpdateCmsSectionDto extends PartialType(CreateCmsSectionDto) {}
