import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTaxonomyTechniques1780100400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Tejeduría tradicional ─────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Telar de pedal'), ('Telar horizontal'), ('Telar vertical'),
        ('Tejido manual'), ('Tejido plano'), ('Trama y urdimbre')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Tejeduría tradicional'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Bordado artesanal ─────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Bordado manual'), ('Bordado tradicional'),
        ('Bordado en relieve'), ('Aplicaciones textiles')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Bordado artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Tintorería artesanal ──────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Tintes naturales'), ('Teñido vegetal'),
        ('Inmersión artesanal'), ('Teñido por reserva')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Tintorería artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Tejeduría ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Telar horizontal'), ('Anudado'), ('Trenzado'), ('Tejido manual')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Tejeduría'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Macramé ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Macramé'), ('Anudado'), ('Bordado mural'), ('Telar decorativo')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Macramé'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Confección artesanal ──────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Costura manual'), ('Bordado'), ('Patchwork'), ('Tejido decorativo')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Confección artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Joyería artesanal ─────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Filigrana'), ('Engaste'), ('Fundición'), ('Calado'), ('Martillado')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Joyería artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Trabajo en chaquira ───────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Tejido en chaquira'), ('Ensamble manual')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Trabajo en chaquira'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Alambrismo ────────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Alambrismo'), ('Ensamble'), ('Filigrana'), ('Tejido en fibras')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Alambrismo'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Cestería ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Trenzado'), ('Espiralado'), ('Entretejido'), ('Enrollado')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Cestería'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Cerámica artesanal ────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Modelado manual'), ('Torno'), ('Esmaltado'),
        ('Grabado'), ('Quemado artesanal'), ('Pintura cerámica')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Cerámica artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Carpintería artesanal ─────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Tallado'), ('Ensamble'), ('Trenzado decorativo'),
        ('Curvado'), ('Marquetería'), ('Pulido'), ('Trenzado asiento')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Carpintería artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Ebanistería ───────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Tallado'), ('Ensamble'), ('Curvado'), ('Marquetería'), ('Trenzado asiento')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Ebanistería'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Ilustración cerámica ──────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Modelado manual'), ('Pintura cerámica'), ('Esmaltado')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Ilustración cerámica'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Escultura artesanal ───────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Tallado'), ('Modelado'), ('Fundición'), ('Ensamble')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Escultura artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Tallado artesanal ─────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Tallado manual'), ('Pintura tradicional'), ('Aplicaciones decorativas'), ('Pulido'), ('Ensamble')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Tallado artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Luthería artesanal ────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Ensamble acústico'), ('Tensado'), ('Tallado')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Luthería artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Costura artesanal ─────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Costura manual'), ('Bordado'), ('Modelado textil'),
        ('Ensamble textil'), ('Serigrafía artesanal')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Costura artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Marroquinería artesanal ───────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Costura manual'), ('Trenzado'), ('Crochet'), ('Bordado tradicional')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Marroquinería artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Cosmética artesanal ───────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Saponificación'), ('Maceración'), ('Mezcla botánica')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Cosmética artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Cerería artesanal ─────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Vertido'), ('Mezcla aromática'), ('Decoración botánica')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Cerería artesanal'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Alfarería ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, t.name, 'approved'
      FROM taxonomy.crafts, (VALUES
        ('Torno'), ('Modelado'), ('Quemado artesanal'), ('Esmaltado')
      ) AS t(name)
      WHERE taxonomy.crafts.name = 'Alfarería'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);

    // ── Limpiar duplicado: 'fieltrado' (minúscula) en Textiles y Tejidos ────
    // Primero redirigir FKs existentes al 'Fieltrado' correcto, luego eliminar
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_technique_id = (
        SELECT id FROM taxonomy.techniques
        WHERE name = 'Fieltrado'
          AND craft_id = (SELECT id FROM taxonomy.crafts WHERE name = 'Textiles y Tejidos')
      )
      WHERE primary_technique_id = (
        SELECT id FROM taxonomy.techniques
        WHERE name = 'fieltrado'
          AND craft_id = (SELECT id FROM taxonomy.crafts WHERE name = 'Textiles y Tejidos')
      );
    `);
    await queryRunner.query(`
      DELETE FROM taxonomy.techniques
      WHERE name = 'fieltrado'
        AND craft_id = (SELECT id FROM taxonomy.crafts WHERE name = 'Textiles y Tejidos');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restaurar duplicado eliminado y devolver FK al producto
    await queryRunner.query(`
      INSERT INTO taxonomy.techniques (id, craft_id, name, status)
      SELECT gen_random_uuid(), id, 'fieltrado', 'approved'
      FROM taxonomy.crafts WHERE name = 'Textiles y Tejidos'
      ON CONFLICT (craft_id, name) DO NOTHING;
    `);
    await queryRunner.query(`
      UPDATE shop.product_artisanal_identity
      SET primary_technique_id = (
        SELECT id FROM taxonomy.techniques
        WHERE name = 'fieltrado'
          AND craft_id = (SELECT id FROM taxonomy.crafts WHERE name = 'Textiles y Tejidos')
      )
      WHERE primary_technique_id = (
        SELECT id FROM taxonomy.techniques
        WHERE name = 'Fieltrado'
          AND craft_id = (SELECT id FROM taxonomy.crafts WHERE name = 'Textiles y Tejidos')
      );
    `);

    // Eliminar técnicas de los oficios nuevos
    await queryRunner.query(`
      DELETE FROM taxonomy.techniques
      WHERE craft_id IN (
        SELECT id FROM taxonomy.crafts WHERE name IN (
          'Tejeduría tradicional', 'Bordado artesanal', 'Tintorería artesanal',
          'Tejeduría', 'Macramé', 'Confección artesanal',
          'Joyería artesanal', 'Trabajo en chaquira', 'Alambrismo',
          'Cestería', 'Cerámica artesanal', 'Carpintería artesanal',
          'Ebanistería', 'Ilustración cerámica', 'Escultura artesanal',
          'Tallado artesanal', 'Luthería artesanal', 'Costura artesanal',
          'Marroquinería artesanal', 'Cosmética artesanal', 'Cerería artesanal',
          'Alfarería'
        )
      );
    `);
  }
}
