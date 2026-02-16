import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsAndLedgerSchema1769550000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Extensiones
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // 2. Schemas y tablas externas (mocks / stubs)
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS auth`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS auth.users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        email text UNIQUE,
        full_name text
      )
    `);

    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS shop`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shop.artisan_shops (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shop.products (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        shop_id uuid REFERENCES shop.artisan_shops(id),
        name text,
        sku text,
        price_minor bigint DEFAULT 0
      )
    `);

    // 3. Schema payments
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS payments`);

    // 3.1 Enums y tipos
    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_context') THEN
    CREATE TYPE payments.sale_context AS ENUM ('marketplace', 'tenant');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cart_status') THEN
    CREATE TYPE payments.cart_status AS ENUM ('open', 'locked', 'converted', 'abandoned');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checkout_status') THEN
    CREATE TYPE payments.checkout_status AS ENUM ('created', 'awaiting_payment', 'paid', 'failed', 'canceled', 'refunded', 'partial_refunded');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE payments.order_status AS ENUM ('pending_fulfillment', 'delivered', 'canceled', 'refunded');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'charge_direction') THEN
    CREATE TYPE payments.charge_direction AS ENUM ('add', 'subtract');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'charge_scope') THEN
    CREATE TYPE payments.charge_scope AS ENUM ('checkout', 'order');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_intent_status') THEN
    CREATE TYPE payments.payment_intent_status AS ENUM ('requires_payment_method', 'requires_action', 'processing', 'succeeded', 'failed', 'canceled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_attempt_status') THEN
    CREATE TYPE payments.payment_attempt_status AS ENUM ('created', 'redirected', 'authorized', 'captured', 'failed', 'canceled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status') THEN
    CREATE TYPE payments.payout_status AS ENUM ('requested', 'processing', 'paid', 'failed', 'canceled');
  END IF;
END$$;
    `);

    // 3.2 Payment providers
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.payment_providers (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        code text NOT NULL UNIQUE,
        display_name text NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        capabilities jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // 3.3 Product prices and charge rules
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.product_prices (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id uuid NOT NULL REFERENCES shop.products(id) ON DELETE CASCADE,
        context payments.sale_context NOT NULL,
        context_shop_id uuid NULL REFERENCES shop.artisan_shops(id) ON DELETE CASCADE,
        currency char(3) NOT NULL,
        amount_minor bigint NOT NULL CHECK (amount_minor >= 0),
        is_active boolean NOT NULL DEFAULT true,
        effective_from timestamptz NOT NULL DEFAULT now(),
        effective_to timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT product_prices_context_chk CHECK (
          (context = 'marketplace' AND context_shop_id IS NULL) OR
          (context = 'tenant' AND context_shop_id IS NOT NULL)
        )
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_product_prices_open ON payments.product_prices(product_id, context, context_shop_id, currency) WHERE is_active = true AND effective_to IS NULL`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.charge_types (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        code text NOT NULL UNIQUE,
        direction payments.charge_direction NOT NULL,
        scope payments.charge_scope NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.charge_rules (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        charge_type_id uuid NOT NULL REFERENCES payments.charge_types(id) ON DELETE RESTRICT,
        context payments.sale_context NOT NULL,
        context_shop_id uuid NULL REFERENCES shop.artisan_shops(id) ON DELETE CASCADE,
        currency char(3) NULL,
        rate_bps integer NULL CHECK (rate_bps IS NULL OR rate_bps >= 0),
        fixed_minor bigint NULL CHECK (fixed_minor IS NULL OR fixed_minor >= 0),
        priority integer NOT NULL DEFAULT 100,
        is_active boolean NOT NULL DEFAULT true,
        effective_from timestamptz NOT NULL DEFAULT now(),
        effective_to timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // 3.4 Carts and cart items
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.carts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        buyer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        context payments.sale_context NOT NULL DEFAULT 'marketplace',
        context_shop_id uuid NULL REFERENCES shop.artisan_shops(id) ON DELETE CASCADE,
        currency char(3) NOT NULL DEFAULT 'COP',
        status payments.cart_status NOT NULL DEFAULT 'open',
        version integer NOT NULL DEFAULT 1,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        locked_at timestamptz NULL,
        converted_at timestamptz NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.cart_shipping_info (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        cart_id uuid NOT NULL REFERENCES payments.carts(id) ON DELETE CASCADE,
        full_name text NOT NULL,
        email text NOT NULL,
        phone text NOT NULL,
        address text NOT NULL,
        dane_ciudad integer NOT NULL,
        desc_ciudad text NOT NULL,
        desc_depart text NOT NULL,
        postal_code text NOT NULL,
        desc_envio text NOT NULL,
        num_guia text,
        valor_flete_minor bigint DEFAULT 0,
        valor_sobre_flete_minor bigint DEFAULT 0,
        valor_total_flete_minor bigint DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.cart_items (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        cart_id uuid NOT NULL REFERENCES payments.carts(id) ON DELETE CASCADE,
        product_id uuid NOT NULL REFERENCES shop.products(id) ON DELETE RESTRICT,
        seller_shop_id uuid NOT NULL REFERENCES shop.artisan_shops(id) ON DELETE RESTRICT,
        quantity integer NOT NULL CHECK (quantity > 0),
        currency char(3) NOT NULL,
        unit_price_minor bigint NOT NULL CHECK (unit_price_minor >= 0),
        price_source text NOT NULL CHECK (price_source IN ('product_base', 'override')),
        price_ref_id uuid NULL REFERENCES payments.product_prices(id) ON DELETE SET NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // 3.5 Checkouts and orders
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.checkouts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        cart_id uuid NOT NULL REFERENCES payments.carts(id) ON DELETE RESTRICT,
        buyer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        context payments.sale_context NOT NULL,
        context_shop_id uuid NULL REFERENCES shop.artisan_shops(id) ON DELETE CASCADE,
        currency char(3) NOT NULL,
        status payments.checkout_status NOT NULL DEFAULT 'created',
        subtotal_minor bigint NOT NULL DEFAULT 0 CHECK (subtotal_minor >= 0),
        charges_total_minor bigint NOT NULL DEFAULT 0 CHECK (charges_total_minor >= 0),
        total_minor bigint NOT NULL DEFAULT 0 CHECK (total_minor >= 0),
        idempotency_key text NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.orders (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        checkout_id uuid NOT NULL REFERENCES payments.checkouts(id) ON DELETE CASCADE,
        seller_shop_id uuid NOT NULL REFERENCES shop.artisan_shops(id) ON DELETE RESTRICT,
        currency char(3) NOT NULL,
        gross_subtotal_minor bigint NOT NULL CHECK (gross_subtotal_minor >= 0),
        net_to_seller_minor bigint NOT NULL CHECK (net_to_seller_minor >= 0),
        status payments.order_status NOT NULL DEFAULT 'pending_fulfillment',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (checkout_id, seller_shop_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.order_items (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id uuid NOT NULL REFERENCES payments.orders(id) ON DELETE CASCADE,
        product_id uuid NOT NULL REFERENCES shop.products(id) ON DELETE RESTRICT,
        quantity integer NOT NULL CHECK (quantity > 0),
        currency char(3) NOT NULL,
        unit_price_minor bigint NOT NULL CHECK (unit_price_minor >= 0),
        line_total_minor bigint NOT NULL CHECK (line_total_minor >= 0),
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.checkout_charges (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        checkout_id uuid NOT NULL REFERENCES payments.checkouts(id) ON DELETE CASCADE,
        charge_type_id uuid NOT NULL REFERENCES payments.charge_types(id) ON DELETE RESTRICT,
        scope payments.charge_scope NOT NULL,
        order_id uuid NULL REFERENCES payments.orders(id) ON DELETE CASCADE,
        amount_minor bigint NOT NULL,
        currency char(3) NOT NULL,
        rule_id uuid NULL REFERENCES payments.charge_rules(id) ON DELETE SET NULL,
        basis jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT checkout_charges_scope_chk CHECK (
          (scope = 'checkout' AND order_id IS NULL) OR
          (scope = 'order' AND order_id IS NOT NULL)
        )
      )
    `);

    // 3.6 Payment intents and attempts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.payment_intents (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        checkout_id uuid NOT NULL REFERENCES payments.checkouts(id) ON DELETE RESTRICT,
        provider_id uuid NOT NULL REFERENCES payments.payment_providers(id) ON DELETE RESTRICT,
        currency char(3) NOT NULL,
        amount_minor bigint NOT NULL CHECK (amount_minor >= 0),
        status payments.payment_intent_status NOT NULL DEFAULT 'requires_payment_method',
        external_intent_id text NULL,
        provider_data jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (provider_id, external_intent_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.payment_attempts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        payment_intent_id uuid NOT NULL REFERENCES payments.payment_intents(id) ON DELETE CASCADE,
        attempt_no integer NOT NULL CHECK (attempt_no > 0),
        status payments.payment_attempt_status NOT NULL DEFAULT 'created',
        idempotency_key text NOT NULL UNIQUE,
        request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
        response_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
        error_message text NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (payment_intent_id, attempt_no)
      )
    `);

    // 3.7 Payouts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments.payouts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        shop_id uuid NOT NULL REFERENCES shop.artisan_shops(id) ON DELETE RESTRICT,
        currency char(3) NOT NULL,
        amount_minor bigint NOT NULL CHECK (amount_minor > 0),
        status payments.payout_status NOT NULL DEFAULT 'requested',
        external_payout_id text NULL,
        destination jsonb NOT NULL DEFAULT '{}'::jsonb,
        idempotency_key text NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // 4. Schema ledger
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ledger`);

    // 4.1 Enums y tipos para ledger
    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'owner_type' AND n.nspname = 'ledger'
  ) THEN
    CREATE TYPE ledger.owner_type AS ENUM ('platform', 'shop');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'account_type' AND n.nspname = 'ledger'
  ) THEN
    CREATE TYPE ledger.account_type AS ENUM ('clearing', 'revenue', 'taxes', 'pending', 'available', 'payout_in_transit');
  END IF;
END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ledger.accounts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        owner_type ledger.owner_type NOT NULL,
        owner_id uuid NULL,
        currency char(3) NOT NULL,
        account_type ledger.account_type NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT accounts_owner_chk CHECK (
          (owner_type = 'platform' AND owner_id IS NULL) OR
          (owner_type = 'shop' AND owner_id IS NOT NULL)
        ),
        UNIQUE (owner_type, owner_id, currency, account_type)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ledger.transactions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        reference_type text NOT NULL,
        reference_id uuid NOT NULL,
        currency char(3) NOT NULL,
        description text NULL,
        idempotency_key text NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (reference_type, reference_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ledger.entries (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        transaction_id uuid NOT NULL REFERENCES ledger.transactions(id) ON DELETE CASCADE,
        account_id uuid NOT NULL REFERENCES ledger.accounts(id) ON DELETE RESTRICT,
        amount_minor bigint NOT NULL CHECK (amount_minor <> 0),
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order to avoid dependency issues

    // Ledger schema
    await queryRunner.query(`DROP TABLE IF EXISTS ledger.entries CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS ledger.transactions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS ledger.accounts CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS ledger.account_type CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS ledger.owner_type CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS ledger CASCADE`);

    // Payments schema
    await queryRunner.query(`DROP TABLE IF EXISTS payments.payouts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.payment_attempts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.payment_intents CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.checkout_charges CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.order_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.orders CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.checkouts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.cart_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.cart_shipping_info CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.carts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.charge_rules CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.charge_types CASCADE`);
    await queryRunner.query(`DROP INDEX IF EXISTS payments.uq_product_prices_open`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.product_prices CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments.payment_providers CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS payments.payout_status CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS payments.payment_attempt_status CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS payments.payment_intent_status CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS payments.charge_scope CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS payments.charge_direction CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS payments.order_status CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS payments.checkout_status CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS payments.cart_status CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS payments.sale_context CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS payments CASCADE`);

    // Shop schema (only remove tables created by this migration, not the schema itself)
    await queryRunner.query(`DROP TABLE IF EXISTS shop.products CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS shop.artisan_shops CASCADE`);
    // Note: Don't drop shop schema as it may be used by other migrations

    // Auth schema (only remove tables created by this migration, not the schema itself)
    await queryRunner.query(`DROP TABLE IF EXISTS auth.users CASCADE`);
    // Note: Don't drop auth schema as it may be used by other migrations
  }
}
