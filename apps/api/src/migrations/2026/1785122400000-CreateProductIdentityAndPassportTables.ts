import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductIdentityAndPassportTables1785122400000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear schema digital_identity si no existe
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS digital_identity`);

    // Habilitar extensión UUID si no existe
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ========================================
    // 1. TABLA: product_identity
    // ========================================
    await queryRunner.query(`
      CREATE TABLE digital_identity.product_identity (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        identity_key VARCHAR(255) NOT NULL,
        product_id UUID NOT NULL,
        store_id UUID NOT NULL,
        artisan_id UUID NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT product_identity_pkey PRIMARY KEY (id),
        CONSTRAINT product_identity_identity_key_unique UNIQUE (identity_key)
      )
    `);

    // Índices para product_identity
    await queryRunner.query(`
      CREATE INDEX idx_product_identity_product_id 
      ON digital_identity.product_identity (product_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_product_identity_store_id 
      ON digital_identity.product_identity (store_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_product_identity_artisan_id 
      ON digital_identity.product_identity (artisan_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_product_identity_is_active 
      ON digital_identity.product_identity (is_active)
    `);

    // Foreign Keys para product_identity
    await queryRunner.query(`
      ALTER TABLE digital_identity.product_identity
      ADD CONSTRAINT fk_product_identity_product_core
      FOREIGN KEY (product_id)
      REFERENCES shop.products_core (id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE digital_identity.product_identity
      ADD CONSTRAINT fk_product_identity_stores
      FOREIGN KEY (store_id)
      REFERENCES store.stores (id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE digital_identity.product_identity
      ADD CONSTRAINT fk_product_identity_artisan_profile
      FOREIGN KEY (artisan_id)
      REFERENCES artesanos.artisan_profile (id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    // ========================================
    // 2. TABLA: users_passport
    // ========================================
    await queryRunner.query(`
      CREATE TABLE digital_identity.users_passport (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        num_identificacion VARCHAR(50) NOT NULL,
        nombre_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefono VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT users_passport_pkey PRIMARY KEY (id)
      )
    `);

    // Índices para users_passport
    await queryRunner.query(`
      CREATE INDEX idx_users_passport_num_identificacion 
      ON digital_identity.users_passport (num_identificacion)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_users_passport_email 
      ON digital_identity.users_passport (email)
    `);

    // ========================================
    // 3. TABLA: passport_user (Pivot)
    // ========================================
    await queryRunner.query(`
      CREATE TABLE digital_identity.passport_user (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        passport_identity_id UUID NOT NULL,
        user_passport_id UUID NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT passport_user_pkey PRIMARY KEY (id)
      )
    `);

    // Índices para passport_user
    await queryRunner.query(`
      CREATE INDEX idx_passport_user_passport_identity_id 
      ON digital_identity.passport_user (passport_identity_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_passport_user_user_passport_id 
      ON digital_identity.passport_user (user_passport_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_passport_user_is_active 
      ON digital_identity.passport_user (is_active)
    `);

    // Foreign Keys para passport_user
    await queryRunner.query(`
      ALTER TABLE digital_identity.passport_user
      ADD CONSTRAINT fk_passport_user_product_identity
      FOREIGN KEY (passport_identity_id)
      REFERENCES digital_identity.product_identity (id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE digital_identity.passport_user
      ADD CONSTRAINT fk_passport_user_users_passport
      FOREIGN KEY (user_passport_id)
      REFERENCES digital_identity.users_passport (id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    // Índice compuesto único para evitar duplicados en la tabla pivot
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_passport_user_unique_relationship
      ON digital_identity.passport_user (passport_identity_id, user_passport_id)
    `);

    // ========================================
    // 4. COMENTARIOS EN LAS TABLAS
    // ========================================
    await queryRunner.query(`
      COMMENT ON TABLE digital_identity.product_identity IS 
      'Identidad única de productos para certificados digitales'
    `);

    await queryRunner.query(`
      COMMENT ON TABLE digital_identity.users_passport IS 
      'Información de usuarios compradores de productos con certificado'
    `);

    await queryRunner.query(`
      COMMENT ON TABLE digital_identity.passport_user IS 
      'Tabla pivot: relación entre productos certificados y sus compradores'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN digital_identity.product_identity.identity_key IS 
      'Clave única generada para identificar el producto (usada en QR)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar en orden inverso (tablas dependientes primero)

    // 1. Eliminar tabla pivot
    await queryRunner.query(`DROP INDEX IF EXISTS digital_identity.idx_passport_user_unique_relationship`);
    await queryRunner.query(`DROP INDEX IF EXISTS digital_identity.idx_passport_user_is_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS digital_identity.idx_passport_user_user_passport_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS digital_identity.idx_passport_user_passport_identity_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS digital_identity.passport_user`);

    // 2. Eliminar users_passport
    await queryRunner.query(`DROP INDEX IF EXISTS digital_identity.idx_users_passport_email`);
    await queryRunner.query(`DROP INDEX IF EXISTS digital_identity.idx_users_passport_num_identificacion`);
    await queryRunner.query(`DROP TABLE IF EXISTS digital_identity.users_passport`);

    // 3. Eliminar product_identity
    await queryRunner.query(`DROP INDEX IF EXISTS digital_identity.idx_product_identity_is_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS digital_identity.idx_product_identity_artisan_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS digital_identity.idx_product_identity_store_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS digital_identity.idx_product_identity_product_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS digital_identity.product_identity`);

    // Nota: No eliminamos el schema porque podría tener otras tablas en el futuro
    // Si deseas eliminarlo: DROP SCHEMA IF EXISTS digital_identity CASCADE;
  }
}
