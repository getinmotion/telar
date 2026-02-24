import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWishlistTable1771250000000 implements MigrationInterface {
  name = 'CreateWishlistTable1771250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla wishlist en el esquema shop
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shop.wishlist (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        product_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

        -- Foreign key a user_profiles
        CONSTRAINT fk_wishlist_user
          FOREIGN KEY (user_id)
          REFERENCES artesanos.user_profiles(user_id)
          ON DELETE CASCADE,

        -- Foreign key a products
        CONSTRAINT fk_wishlist_product
          FOREIGN KEY (product_id)
          REFERENCES shop.products(id)
          ON DELETE CASCADE,

        -- Constraint único: un usuario no puede tener el mismo producto dos veces en su wishlist
        CONSTRAINT unique_user_product
          UNIQUE (user_id, product_id)
      )
    `);

    // Crear índices para mejorar el rendimiento
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlist_user_id
      ON shop.wishlist(user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlist_product_id
      ON shop.wishlist(product_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlist_created_at
      ON shop.wishlist(created_at DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_wishlist_created_at
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_wishlist_product_id
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS shop.idx_wishlist_user_id
    `);

    // Eliminar tabla
    await queryRunner.query(`
      DROP TABLE IF EXISTS shop.wishlist
    `);
  }
}
