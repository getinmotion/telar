import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MIGRATION: Crear tabla payout_user_info
 *
 * DESCRIPCIÓN:
 * - Crea la tabla payments.payout_user_info para almacenar información de cuentas bancarias
 * - Incluye datos encriptados (bank_name, num_account)
 * - Incluye tracking de creación y actualización (created_by, updated_by)
 */
export class CreatePayoutUserInfoTable1780462527102
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE payments.payout_user_info (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        -- Información principal
        name_payout_main TEXT NOT NULL,
        user_id UUID NOT NULL,
        type_account TEXT NOT NULL,

        -- Información bancaria (encriptada)
        bank_name TEXT NOT NULL,
        num_account TEXT NOT NULL,

        -- Información adicional
        country_id UUID NOT NULL,
        currency VARCHAR(10) NOT NULL,

        -- Auditoría
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_by UUID NULL,
        updated_by UUID NULL,

        -- Foreign Keys
        CONSTRAINT fk_payout_user_info_user
          FOREIGN KEY (user_id)
          REFERENCES auth.users(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_payout_user_info_country
          FOREIGN KEY (country_id)
          REFERENCES taxonomy.countries(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_payout_user_info_created_by
          FOREIGN KEY (created_by)
          REFERENCES auth.users(id)
          ON DELETE SET NULL,

        CONSTRAINT fk_payout_user_info_updated_by
          FOREIGN KEY (updated_by)
          REFERENCES auth.users(id)
          ON DELETE SET NULL
      );
    `);

    // Índices para mejorar performance
    await queryRunner.query(`
      CREATE INDEX idx_payout_user_info_user_id
      ON payments.payout_user_info(user_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_payout_user_info_country_id
      ON payments.payout_user_info(country_id);
    `);

    // Comentarios en la tabla
    await queryRunner.query(`
      COMMENT ON TABLE payments.payout_user_info IS
      'Información de cuentas bancarias para pagos. Contiene datos encriptados.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN payments.payout_user_info.bank_name IS
      'Nombre del banco (encriptado)';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN payments.payout_user_info.num_account IS
      'Número de cuenta bancaria (encriptado)';
    `);

    console.log('✅ Tabla payments.payout_user_info creada exitosamente');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS payments.idx_payout_user_info_country_id;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS payments.idx_payout_user_info_user_id;
    `);

    // Eliminar tabla
    await queryRunner.query(`
      DROP TABLE IF EXISTS payments.payout_user_info;
    `);

    console.log('✅ Tabla payments.payout_user_info eliminada');
  }
}
