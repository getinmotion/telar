import { PartialType } from '@nestjs/swagger';
import { CreateArtisanShopDto } from './create-artisan-shop.dto';

export class UpdateArtisanShopDto extends PartialType(CreateArtisanShopDto) {}
