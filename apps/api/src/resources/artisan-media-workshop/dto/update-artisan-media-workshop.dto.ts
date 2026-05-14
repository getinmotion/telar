import { PartialType } from '@nestjs/swagger';
import { CreateArtisanMediaWorkshopDto } from './create-artisan-media-workshop.dto';

export class UpdateArtisanMediaWorkshopDto extends PartialType(CreateArtisanMediaWorkshopDto) {}
