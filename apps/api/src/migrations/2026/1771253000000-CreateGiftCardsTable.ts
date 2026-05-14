import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGiftCardsTable1771253000000 implements MigrationInterface {
  name = 'CreateGiftCardsTable1771253000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear función para actualizar updated_at si no existe
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Crear función para verificar gift card depleted si no existe
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION check_gift_card_depleted()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.remaining_amount <= 0 AND OLD.remaining_amount > 0 THEN
          NEW.status = 'depleted';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Crear tabla gift_cards en el esquema public
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.gift_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        initial_amount NUMERIC NOT NULL CHECK (initial_amount > 0),
        remaining_amount NUMERIC NOT NULL CHECK (remaining_amount >= 0),
        currency TEXT DEFAULT 'COP',
        status TEXT NOT NULL DEFAULT 'active' CHECK (
          status IN ('active', 'expired', 'depleted', 'blocked')
        ),
        expiration_date TIMESTAMP WITH TIME ZONE NULL,
        purchaser_email TEXT NOT NULL,
        recipient_email TEXT NULL,
        message TEXT NULL,
        marketplace_order_id TEXT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        original_amount NUMERIC NULL,
        order_id TEXT NULL,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP WITH TIME ZONE NULL
      )
    `);

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gift_cards_code
      ON public.gift_cards (code)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gift_cards_status
      ON public.gift_cards (status)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser_email
      ON public.gift_cards (purchaser_email)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient
      ON public.gift_cards (recipient_email)
    `);

    // Crear trigger para actualizar updated_at
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_gift_cards_updated_at ON public.gift_cards;
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_gift_cards_updated_at
      BEFORE UPDATE ON public.gift_cards
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Crear trigger para verificar depleted
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS gift_card_depleted_check ON public.gift_cards;
    `);

    await queryRunner.query(`
      CREATE TRIGGER gift_card_depleted_check
      BEFORE UPDATE ON public.gift_cards
      FOR EACH ROW
      EXECUTE FUNCTION check_gift_card_depleted();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar triggers
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS gift_card_depleted_check ON public.gift_cards
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_gift_cards_updated_at ON public.gift_cards
    `);

    // Eliminar índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_gift_cards_recipient
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_gift_cards_purchaser_email
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_gift_cards_status
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_gift_cards_code
    `);

    // Eliminar tabla
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.gift_cards
    `);

    // Eliminar funciones
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS check_gift_card_depleted()
    `);

    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column()
    `);
  }
}
