import { PartialType } from '@nestjs/swagger';
import { CreateArtisanMediaFamilyDto } from './create-artisan-media-family.dto';

export class UpdateArtisanMediaFamilyDto extends PartialType(CreateArtisanMediaFamilyDto) {}
