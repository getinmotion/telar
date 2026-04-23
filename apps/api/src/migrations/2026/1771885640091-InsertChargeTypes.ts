import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertChargeTypes1771885640091 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insertar tipos de cargos
    await queryRunner.query(`
      INSERT INTO payments.charge_types (id, code, direction, scope, created_at)
      VALUES
        (gen_random_uuid(), 'SHIPPING', 'add', 'checkout', NOW()),
        (gen_random_uuid(), 'VAT', 'add', 'order', NOW()),
        (gen_random_uuid(), 'PLATFORM_FEE', 'subtract', 'order', NOW())
      ON CONFLICT (code) DO NOTHING;
    `);

    // Insertar proveedores de pago
    await queryRunner.query(`
      INSERT INTO payments.payment_providers (id, code, display_name, is_active, capabilities, created_at, updated_at)
      VALUES
        (gen_random_uuid(), 'wompi', 'Wompi Colombia', true, '{"redirect": true, "webhook_events": ["transaction.updated"]}'::jsonb, NOW(), NOW()),
        (gen_random_uuid(), 'cobre', 'Cobre Colombia', true, '{"redirect": true, "webhook_events": ["accounts.balance.credit"]}'::jsonb, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar proveedores de pago
    await queryRunner.query(`
      DELETE FROM payments.payment_providers
      WHERE code IN ('wompi', 'cobre');
    `);

    // Eliminar tipos de cargos
    await queryRunner.query(`
      DELETE FROM payments.charge_types
      WHERE code IN ('SHIPPING', 'VAT', 'PLATFORM_FEE');
    `);
  }
}
