import { PartialType } from '@nestjs/swagger';
import { CreateArtisanMediaCommunityDto } from './create-artisan-media-community.dto';

export class UpdateArtisanMediaCommunityDto extends PartialType(CreateArtisanMediaCommunityDto) {}
