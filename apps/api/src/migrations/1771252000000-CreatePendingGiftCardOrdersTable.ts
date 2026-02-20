import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePendingGiftCardOrdersTable1771252000000
  implements MigrationInterface
{
  name = 'CreatePendingGiftCardOrdersTable1771252000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla pending_gift_card_orders en el esquema payments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.pending_gift_card_orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cart_id UUID NOT NULL,
        user_id UUID NOT NULL,
        purchaser_email VARCHAR(255) NOT NULL,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        processed_at TIMESTAMP WITH TIME ZONE NULL,

        -- Foreign key a carts
        CONSTRAINT fk_pending_gift_card_orders_cart
          FOREIGN KEY (cart_id)
          REFERENCES payments.carts(id)
          ON DELETE CASCADE,

        -- Foreign key a users
        CONSTRAINT fk_pending_gift_card_orders_user
          FOREIGN KEY (user_id)
          REFERENCES auth.users(id)
          ON DELETE CASCADE
      )
    `);

    // Crear índices para mejorar el rendimiento
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_gift_card_orders_cart_id
      ON payments.pending_gift_card_orders(cart_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_gift_card_orders_user_id
      ON payments.pending_gift_card_orders(user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_gift_card_orders_created_at
      ON payments.pending_gift_card_orders(created_at DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_gift_card_orders_processed_at
      ON payments.pending_gift_card_orders(processed_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS payments.idx_pending_gift_card_orders_processed_at
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS payments.idx_pending_gift_card_orders_created_at
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS payments.idx_pending_gift_card_orders_user_id
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS payments.idx_pending_gift_card_orders_cart_id
    `);

    // Eliminar tabla
    await queryRunner.query(`
      DROP TABLE IF EXISTS payments.pending_gift_card_orders
    `);
  }
}
