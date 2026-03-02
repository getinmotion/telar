import { PartialType } from '@nestjs/swagger';
import { CreateProductModerationHistoryDto } from './create-product-moderation-history.dto';

export class UpdateProductModerationHistoryDto extends PartialType(
  CreateProductModerationHistoryDto,
) {}
