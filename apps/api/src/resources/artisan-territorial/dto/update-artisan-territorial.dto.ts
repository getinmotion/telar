import { PartialType } from '@nestjs/swagger';
import { CreateArtisanTerritorialDto } from './create-artisan-territorial.dto';

export class UpdateArtisanTerritorialDto extends PartialType(CreateArtisanTerritorialDto) {}
