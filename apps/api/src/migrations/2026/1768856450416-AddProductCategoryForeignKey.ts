import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductCategoryForeignKey1768856450416
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar la clave foránea a product_categories
    // Nota: category_id permanece NULLABLE por ahora
    // Los productos pueden existir sin categoría hasta que se asignen
    await queryRunner.query(`
      ALTER TABLE shop.products 
      ADD CONSTRAINT products_category_id_fkey 
      FOREIGN KEY (category_id) 
      REFERENCES public.product_categories (id) 
      ON DELETE SET NULL;
    `);

    // OPCIONAL: Si deseas hacer category_id obligatorio más adelante:
    // 1. Asegúrate de que todos los productos tengan una categoría asignada
    // 2. Ejecuta: ALTER TABLE shop.products ALTER COLUMN category_id SET NOT NULL;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la clave foránea
    await queryRunner.query(`
      ALTER TABLE shop.products 
      DROP CONSTRAINT IF EXISTS products_category_id_fkey;
    `);
  }
}
