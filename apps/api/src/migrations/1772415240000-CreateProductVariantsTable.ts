import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

/**
 * Migración para crear la tabla product_variants
 *
 * Esta tabla almacena variantes de productos con opciones como tamaño, color, etc.
 * Incluye manejo de inventario, precios, SKU y dimensiones.
 */
export class CreateProductVariantsTable1772415240000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla product_variants
    await queryRunner.createTable(
      new Table({
        name: 'product_variants',
        schema: 'public',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'sku',
            type: 'text',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'option_values',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'::jsonb",
          },
          {
            name: 'price',
            type: 'numeric(10,2)',
            isNullable: true,
          },
          {
            name: 'compare_at_price',
            type: 'numeric(10,2)',
            isNullable: true,
          },
          {
            name: 'cost',
            type: 'numeric(10,2)',
            isNullable: true,
          },
          {
            name: 'stock',
            type: 'integer',
            isNullable: true,
            default: 0,
          },
          {
            name: 'min_stock',
            type: 'integer',
            isNullable: true,
            default: 5,
          },
          {
            name: 'weight',
            type: 'numeric(8,2)',
            isNullable: true,
          },
          {
            name: 'dimensions',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'::jsonb",
          },
          {
            name: 'status',
            type: 'text',
            isNullable: true,
            default: "'active'::text",
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Crear índices
    await queryRunner.createIndex(
      'product_variants',
      new TableIndex({
        name: 'idx_product_variants_product_id',
        columnNames: ['product_id'],
      }),
    );

    await queryRunner.createIndex(
      'product_variants',
      new TableIndex({
        name: 'idx_product_variants_sku',
        columnNames: ['sku'],
      }),
    );

    await queryRunner.createIndex(
      'product_variants',
      new TableIndex({
        name: 'idx_product_variants_status',
        columnNames: ['status'],
      }),
    );

    // Crear foreign key a products
    await queryRunner.createForeignKey(
      'product_variants',
      new TableForeignKey({
        name: 'product_variants_product_id_fkey',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedSchema: 'shop',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Crear check constraint para status
    await queryRunner.query(`
      ALTER TABLE public.product_variants
      ADD CONSTRAINT product_variants_status_check
      CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'discontinued'::text]))
    `);

    // Crear función para actualizar updated_at si no existe
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION public.update_variant_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Crear trigger para updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_product_variants_updated_at
      BEFORE UPDATE ON public.product_variants
      FOR EACH ROW
      EXECUTE FUNCTION public.update_variant_updated_at();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
    `);

    // Eliminar función
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS public.update_variant_updated_at();
    `);

    // Eliminar tabla (esto también eliminará los índices y constraints)
    await queryRunner.dropTable('product_variants', true);
  }
}
