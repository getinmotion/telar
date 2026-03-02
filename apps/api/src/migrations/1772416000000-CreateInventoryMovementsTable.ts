import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey, TableCheck } from 'typeorm';

export class CreateInventoryMovementsTable1772416000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla inventory_movements
    await queryRunner.createTable(
      new Table({
        name: 'inventory_movements',
        schema: 'public',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'product_variant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'qty',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ref_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Crear índice para product_variant_id
    await queryRunner.createIndex(
      'inventory_movements',
      new TableIndex({
        name: 'idx_inventory_movements_variant_id',
        columnNames: ['product_variant_id'],
      }),
    );

    // Crear índice para type
    await queryRunner.createIndex(
      'inventory_movements',
      new TableIndex({
        name: 'idx_inventory_movements_type',
        columnNames: ['type'],
      }),
    );

    // Crear índice para created_at (descendente)
    await queryRunner.createIndex(
      'inventory_movements',
      new TableIndex({
        name: 'idx_inventory_movements_created_at',
        columnNames: ['created_at'],
      }),
    );

    // Crear foreign key para product_variant_id
    await queryRunner.createForeignKey(
      'inventory_movements',
      new TableForeignKey({
        name: 'inventory_movements_product_variant_id_fkey',
        columnNames: ['product_variant_id'],
        referencedTableName: 'product_variants',
        referencedSchema: 'public',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Crear foreign key para created_by
    await queryRunner.createForeignKey(
      'inventory_movements',
      new TableForeignKey({
        name: 'inventory_movements_created_by_fkey',
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedSchema: 'auth',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Crear check constraint para type
    await queryRunner.createCheckConstraint(
      'inventory_movements',
      new TableCheck({
        name: 'inventory_movements_type_check',
        expression: "type = ANY (ARRAY['IN'::text, 'OUT'::text, 'ADJUST'::text])",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar check constraint
    await queryRunner.dropCheckConstraint(
      'inventory_movements',
      'inventory_movements_type_check',
    );

    // Eliminar foreign keys
    await queryRunner.dropForeignKey(
      'inventory_movements',
      'inventory_movements_created_by_fkey',
    );

    await queryRunner.dropForeignKey(
      'inventory_movements',
      'inventory_movements_product_variant_id_fkey',
    );

    // Eliminar índices
    await queryRunner.dropIndex(
      'inventory_movements',
      'idx_inventory_movements_created_at',
    );

    await queryRunner.dropIndex(
      'inventory_movements',
      'idx_inventory_movements_type',
    );

    await queryRunner.dropIndex(
      'inventory_movements',
      'idx_inventory_movements_variant_id',
    );

    // Eliminar tabla
    await queryRunner.dropTable('inventory_movements', true);
  }
}
