import { PartialType } from '@nestjs/swagger';
import { CreateArtisanIdentityDto } from './create-artisan-identity.dto';

export class UpdateArtisanIdentityDto extends PartialType(CreateArtisanIdentityDto) {}
