import { PartialType } from '@nestjs/swagger';
import { CreateCuratorialCategoryDto } from './create-curatorial-category.dto';

export class UpdateCuratorialCategoryDto extends PartialType(CreateCuratorialCategoryDto) {}
