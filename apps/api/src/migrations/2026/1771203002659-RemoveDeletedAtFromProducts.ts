import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Eliminar columna deleted_at de products
 *
 * La tabla products ya no usará soft delete
 */
export class RemoveDeletedAtFromProducts1771203002659
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.products
      DROP COLUMN IF EXISTS deleted_at
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE shop.products
      ADD COLUMN deleted_at timestamp with time zone NULL
    `);
  }
}
