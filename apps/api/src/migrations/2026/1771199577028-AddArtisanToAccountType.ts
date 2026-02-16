import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 1/2: Agregar 'artisan' al ENUM account_type
 *
 * Valores actuales: 'buyer', 'seller', 'both'
 * Valor nuevo: 'artisan'
 *
 * IMPORTANTE: Esta migración solo agrega el valor al ENUM.
 * La migración de datos se hace en MigrateAccountTypeToArtisan
 */
export class AddArtisanToAccountType1771199577028
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'artisan'
          AND enumtypid = (
            SELECT oid FROM pg_type
            WHERE typname = 'account_type'
            AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
          )
        ) THEN
          ALTER TYPE public.account_type ADD VALUE 'artisan';
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // NOTA: El valor 'artisan' permanece en el ENUM (no se puede eliminar)
  }
}
