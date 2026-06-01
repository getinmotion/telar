import { PartialType } from '@nestjs/swagger';
import { CreateArtisanMaterialDto } from './create-artisan-material.dto';

export class UpdateArtisanMaterialDto extends PartialType(CreateArtisanMaterialDto) {}
