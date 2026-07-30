import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePriceRefIdForeignKey1785389439058 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log(
      '⏳ Eliminando foreign key constraint de cart_items.price_ref_id...',
    );

    // Eliminar el constraint de foreign key hacia product_prices
    // ya que la tabla product_prices no se está usando
    console.log('🗑️  Eliminando FK cart_items_price_ref_id_fkey...');

    await queryRunner.query(`
            ALTER TABLE payments.cart_items
            DROP CONSTRAINT IF EXISTS cart_items_price_ref_id_fkey
        `);

    // Agregar comentario explicativo a la columna
    await queryRunner.query(`
            COMMENT ON COLUMN payments.cart_items.price_ref_id IS 
            'Optional reference ID - can be variant ID, promotion ID, or null. No FK constraint since product_prices table is not in use.'
        `);

    console.log('✅ Foreign key constraint eliminado exitosamente');
    console.log(
      'ℹ️  price_ref_id ahora puede referenciar variant IDs o ser null sin restricciones FK',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log(
      '⏳ Revirtiendo: recreando foreign key constraint en cart_items.price_ref_id...',
    );

    // Nota: Este rollback asume que existe la tabla product_prices
    // Si no existe, el rollback fallará
    console.log(
      '⚠️  Advertencia: Este rollback requiere que exista la tabla product_prices',
    );

    await queryRunner.query(`
            ALTER TABLE payments.cart_items
            ADD CONSTRAINT cart_items_price_ref_id_fkey
            FOREIGN KEY (price_ref_id) REFERENCES payments.product_prices(id)
            ON DELETE SET NULL
        `);

    // Eliminar el comentario
    await queryRunner.query(`
            COMMENT ON COLUMN payments.cart_items.price_ref_id IS NULL
        `);

    console.log('✅ Foreign key constraint restaurado');
  }
}
