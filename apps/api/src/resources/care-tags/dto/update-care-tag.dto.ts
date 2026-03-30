import { PartialType } from '@nestjs/swagger';
import { CreateCareTagDto } from './create-care-tag.dto';

export class UpdateCareTagDto extends PartialType(CreateCareTagDto) {}
