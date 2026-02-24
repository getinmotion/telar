import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Eliminar columna deleted_at de user_achievements
 *
 * La tabla user_achievements ya no usará soft delete
 */
export class RemoveDeletedAtFromUserAchievements1771200709449
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.user_achievements
      DROP COLUMN IF EXISTS deleted_at
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.user_achievements
      ADD COLUMN deleted_at timestamp with time zone NULL
    `);
  }
}
