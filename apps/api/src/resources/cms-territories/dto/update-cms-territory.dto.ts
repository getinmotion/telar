import { PartialType } from '@nestjs/mapped-types';
import { CreateCmsTerritoryDto } from './create-cms-territory.dto';

export class UpdateCmsTerritoryDto extends PartialType(CreateCmsTerritoryDto) {}
