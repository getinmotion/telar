import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para agregar nuevos valores al ENUM user_type
 *
 * Valores existentes: 'regular', 'premium', 'enterprise'
 * Valores nuevos: 'shop_owner', 'admin'
 *
 * user_type final: 'regular', 'premium', 'enterprise', 'shop_owner', 'admin'
 */
export class AddShopOwnerAndAdminToUserType1771189800415
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar 'shop_owner' al ENUM user_type si no existe
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'shop_owner'
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type')
        ) THEN
          ALTER TYPE public.user_type ADD VALUE 'shop_owner';
        END IF;
      END $$;
    `);

    // Agregar 'admin' al ENUM user_type si no existe
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'admin'
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type')
        ) THEN
          ALTER TYPE public.user_type ADD VALUE 'admin';
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // NOTA: No se pueden eliminar valores de un ENUM en PostgreSQL fácilmente
    // La única forma es recrear el tipo completamente, lo cual es peligroso
    // Por seguridad, solo registramos que esta operación no es reversible
    console.warn(
      '⚠️  ADVERTENCIA: No se pueden eliminar valores de ENUM en PostgreSQL',
    );
    console.warn(
      '   Los valores "shop_owner" y "admin" permanecerán en el tipo user_type',
    );
    console.warn(
      '   Si necesitas revertir, deberás recrear el tipo manualmente',
    );

    // Alternativa (comentada por seguridad):
    // Para revertir completamente, necesitarías:
    // 1. Cambiar todos los valores 'shop_owner' y 'admin' a otro valor válido
    // 2. Crear un nuevo tipo sin estos valores
    // 3. Alterar la columna para usar el nuevo tipo
    // 4. Eliminar el tipo antiguo
    // Esto es complejo y puede causar pérdida de datos
  }
}
