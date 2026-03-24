import { PartialType } from '@nestjs/swagger';
import { CreateProductsNewDto } from './create-products-new.dto';

export class UpdateProductsNewDto extends PartialType(CreateProductsNewDto) {}
