import { PartialType } from '@nestjs/swagger';
import { CreateArtisanOriginDto } from './create-artisan-origin.dto';

export class UpdateArtisanOriginDto extends PartialType(CreateArtisanOriginDto) {}
