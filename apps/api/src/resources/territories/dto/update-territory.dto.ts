import { PartialType } from '@nestjs/mapped-types';
import { CreateTerritoryDto } from './create-territory.dto';

export class UpdateTerritoryDto extends PartialType(CreateTerritoryDto) {}
