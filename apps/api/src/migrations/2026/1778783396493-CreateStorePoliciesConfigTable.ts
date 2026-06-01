import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStorePoliciesConfigTable1778783396493
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla store.store_policies_config
    await queryRunner.query(`
      CREATE TABLE store.store_policies_config (
        id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        return_policy TEXT       NULL,
        faq          JSONB       NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NULL
      )
    `);

    // 2. Eliminar columna policies_config (jsonb) de shop.artisan_shops
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
      DROP COLUMN policies_config
    `);

    // 3. Agregar columna id_policies_config como FK nullable
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
        ADD COLUMN id_policies_config UUID NULL,
        ADD CONSTRAINT fk_artisan_shops_policies_config
          FOREIGN KEY (id_policies_config)
          REFERENCES store.store_policies_config(id)
          ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar FK y columna de shop.artisan_shops
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
        DROP CONSTRAINT fk_artisan_shops_policies_config,
        DROP COLUMN id_policies_config
    `);

    // 2. Restaurar columna policies_config original
    await queryRunner.query(`
      ALTER TABLE shop.artisan_shops
        ADD COLUMN policies_config JSONB NOT NULL DEFAULT '{}'
    `);

    // 3. Eliminar tabla store.store_policies_config
    await queryRunner.query(`
      DROP TABLE store.store_policies_config
    `);
  }
}
