import { PartialType } from '@nestjs/swagger';
import { CreateSuggestProductsDraftDto } from './create-suggest-products-draft.dto';

/**
 * DTO para actualizar un registro de sugerencias de productos draft
 * Todos los campos son opcionales (hereda de CreateDto con PartialType)
 */
export class UpdateSuggestProductsDraftDto extends PartialType(CreateSuggestProductsDraftDto) {}
