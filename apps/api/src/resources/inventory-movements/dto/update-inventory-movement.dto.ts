import { PartialType } from '@nestjs/swagger';
import { CreateInventoryMovementDto } from './create-inventory-movement.dto';

/**
 * DTO para actualizar un movimiento de inventario
 *
 * NOTA: Los movimientos de inventario normalmente NO se deben actualizar
 * para mantener la integridad del histórico. En su lugar, se debe crear
 * un nuevo movimiento de tipo ADJUST para corregir errores.
 *
 * Este DTO existe solo por completitud del CRUD, pero su uso debe ser
 * restringido o evitado en producción.
 */
export class UpdateInventoryMovementDto extends PartialType(
  CreateInventoryMovementDto,
) {}
