import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToProducts1769526854190
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna deleted_at para soft delete
    await queryRunner.query(`
      ALTER TABLE shop.products 
      ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL
    `);

    // Crear índice para mejorar rendimiento de consultas con soft delete
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_deleted_at 
      ON shop.products (deleted_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índice
    await queryRunner.query(
      `DROP INDEX IF EXISTS shop.idx_products_deleted_at`,
    );

    // Eliminar columna
    await queryRunner.query(`
      ALTER TABLE shop.products 
      DROP COLUMN IF EXISTS deleted_at
    `);
  }
}
