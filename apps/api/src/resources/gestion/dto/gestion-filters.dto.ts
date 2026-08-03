import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * Estado DERIVADO de la unidad productiva. No es una columna: se calcula en el
 * CTE `up_sel` de `gestion-sql.ts` a partir del catálogo y de la actividad.
 * Escalera de prioridad: en_riesgo > activa > creada.
 */
export enum ShopStatusFilter {
  CREADA = 'creada',
  ACTIVA = 'activa',
  EN_RIESGO = 'en_riesgo',
}

/**
 * Filtros globales del tablero. TODOS los endpoints de gestión los aceptan con
 * exactamente la misma forma, para que el mismo filtro dé el mismo número en
 * cualquier pantalla.
 *
 * Los DTO específicos de cada endpoint EXTIENDEN esta clase.
 */
export class GestionFiltersDto {
  @ApiPropertyOptional({
    description:
      'Convenio (taxonomy.agreements.id), o el literal "none" para las unidades productivas sin convenio asignado.',
  })
  @IsOptional()
  @Matches(
    /^(none|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
    { message: 'agreementId debe ser un UUID o "none"' },
  )
  agreementId?: string;

  @ApiPropertyOptional({ description: 'Región (texto libre, igualdad exacta)' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @ApiPropertyOptional({ description: 'Departamento (texto libre, igualdad exacta)' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @ApiPropertyOptional({ description: 'Municipio (texto libre, igualdad exacta)' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  municipality?: string;

  @ApiPropertyOptional({
    enum: ShopStatusFilter,
    description: 'Estado derivado de la unidad productiva',
  })
  @IsOptional()
  @IsEnum(ShopStatusFilter)
  shopStatus?: ShopStatusFilter;

  @ApiPropertyOptional({
    description:
      'Inicio del rango (YYYY-MM-DD). Filtra unidades productivas por su FECHA DE CREACIÓN (cohorte), no por actividad ocurrida en la ventana.',
  })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({
    description: 'Fin del rango (YYYY-MM-DD), inclusivo. Ver nota de `from`.',
  })
  @IsOptional()
  @IsISO8601()
  to?: string;
}
