import { PartialType } from '@nestjs/swagger';
import { CreateBrandThemeDto } from './create-brand-theme.dto';

export class UpdateBrandThemeDto extends PartialType(CreateBrandThemeDto) {}
