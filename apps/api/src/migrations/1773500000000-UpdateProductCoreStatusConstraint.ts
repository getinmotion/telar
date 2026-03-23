import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductCoreStatusConstraint1773500000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ============================================================
        // Migración: CHECK constraint de products_core.status
        // ============================================================
        // Cambia el constraint de status para usar estados legacy:
        // - draft, pending_moderation, changes_requested, approved,
        //   approved_with_edits, rejected
        // - Remapea 'published' → 'approved' en datos existentes
        // - Cambia DEFAULT a 'draft'
        // ============================================================

        // Paso 1: Remapear los datos existentes al esquema legacy
        // Cambia 'published' a 'approved' en registros existentes
        await queryRunner.query(`
            UPDATE shop.products_core
            SET status = 'approved'
            WHERE status = 'published'
        `);

        // Paso 2: Eliminar el CHECK constraint viejo
        await queryRunner.query(`
            ALTER TABLE shop.products_core
            DROP CONSTRAINT IF EXISTS products_core_status_check
        `);

        // Paso 3: Crear el CHECK constraint con los estados legacy
        await queryRunner.query(`
            ALTER TABLE shop.products_core
            ADD CONSTRAINT products_core_status_check
            CHECK (status IN (
                'draft',
                'pending_moderation',
                'changes_requested',
                'approved',
                'approved_with_edits',
                'rejected'
            ))
        `);

        // Paso 4: Cambiar el DEFAULT (los productos nuevos entran como draft)
        await queryRunner.query(`
            ALTER TABLE shop.products_core
            ALTER COLUMN status SET DEFAULT 'draft'
        `);

        // Verificación: Mostrar distribución de estados después de la migración
        const result = await queryRunner.query(`
            SELECT status, COUNT(*) as total
            FROM shop.products_core
            GROUP BY status
            ORDER BY total DESC
        `);

        console.log('✓ Distribución de estados después de la migración:');
        console.table(result);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // ============================================================
        // Revertir cambios del CHECK constraint de products_core.status
        // ============================================================

        // Paso 1: Remapear los datos de vuelta al esquema anterior
        // Cambia 'approved' a 'published' (asumiendo que era el estado anterior común)
        await queryRunner.query(`
            UPDATE shop.products_core
            SET status = 'published'
            WHERE status = 'approved'
        `);

        // Paso 2: Eliminar el CHECK constraint legacy
        await queryRunner.query(`
            ALTER TABLE shop.products_core
            DROP CONSTRAINT IF EXISTS products_core_status_check
        `);

        // Paso 3: Recrear el CHECK constraint anterior
        // Nota: Ajusta estos valores según tu constraint anterior
        await queryRunner.query(`
            ALTER TABLE shop.products_core
            ADD CONSTRAINT products_core_status_check
            CHECK (status IN (
                'draft',
                'published',
                'archived'
            ))
        `);

        // Paso 4: Revertir el DEFAULT al valor anterior (asumiendo 'published')
        await queryRunner.query(`
            ALTER TABLE shop.products_core
            ALTER COLUMN status SET DEFAULT 'published'
        `);

        console.log('✓ Revertida migración de status constraint');
    }

}
