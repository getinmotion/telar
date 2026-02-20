import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAddressesTable1771251000000 implements MigrationInterface {
  name = 'CreateAddressesTable1771251000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla addresses en el esquema shop
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shop.addresses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        label VARCHAR(100) NOT NULL,
        street_address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        dane_code VARCHAR(20) NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

        -- Foreign key a user_profiles
        CONSTRAINT fk_addresses_user
          FOREIGN KEY (user_id)
          REFERENCES artesanos.user_profiles(user_id)
          ON DELETE CASCADE
      )
    `);

    // Crear índices para mejorar el rendimiento
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_addresses_user_id
      ON shop.addresses(user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_addresses_is_default
      ON shop.addresses(is_default)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_addresses_created_at
      ON shop.addresses(created_at DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_addresses_created_at
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_addresses_is_default
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_addresses_user_id
    `);

    // Eliminar tabla
    await queryRunner.query(`
      DROP TABLE IF EXISTS shop.addresses
    `);
  }
}
