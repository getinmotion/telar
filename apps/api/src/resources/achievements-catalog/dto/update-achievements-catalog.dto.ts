import { PartialType } from '@nestjs/swagger';
import { CreateAchievementsCatalogDto } from './create-achievements-catalog.dto';

export class UpdateAchievementsCatalogDto extends PartialType(CreateAchievementsCatalogDto) {}
