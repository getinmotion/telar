import { PartialType } from '@nestjs/swagger';
import { CreateArtisanMediaWorkingDto } from './create-artisan-media-working.dto';

export class UpdateArtisanMediaWorkingDto extends PartialType(CreateArtisanMediaWorkingDto) {}
