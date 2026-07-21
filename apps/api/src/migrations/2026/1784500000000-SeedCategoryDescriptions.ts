import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Puebla la columna `description` de las categorías padre de la taxonomía con
 * el copy editorial que antes vivía hardcodeado en el frontend
 * (marketplace-web `CategoryDetail.tsx` → CATEGORY_EDITORIAL).
 *
 * Así la descripción queda como una sola fuente editable desde el backend y la
 * consume directamente `ExploreProducts` vía `activeCategory.description`.
 */
export class SeedCategoryDescriptions1784500000000
  implements MigrationInterface
{
  private static readonly DESCRIPTIONS: { slug: string; description: string }[] =
    [
      {
        slug: 'textiles-y-moda',
        description:
          'Piezas textiles hechas a mano por talleres artesanales de Colombia. Cada pieza conserva una historia, una técnica y un origen cultural.',
      },
      {
        slug: 'joyeria-y-accesorios',
        description:
          'Piezas únicas elaboradas a mano por artesanos colombianos. Cada joya cuenta una historia de tradición, creatividad y conexión cultural.',
      },
      {
        slug: 'bolsos-y-carteras',
        description:
          'Bolsos y carteras tejidos y elaborados a mano con técnicas ancestrales colombianas. Cada pieza es un lienzo de color, textura y tradición.',
      },
      {
        slug: 'decoracion-del-hogar',
        description:
          'Piezas decorativas artesanales que transforman cualquier espacio. Cada objeto trae consigo la calidez y autenticidad de los talleres colombianos.',
      },
      {
        slug: 'arte-y-esculturas',
        description:
          'Obras de arte y esculturas creadas por maestros artesanos colombianos. Expresiones únicas que capturan la esencia cultural de cada región.',
      },
      {
        slug: 'vajillas-y-cocina',
        description:
          'Vajillas y utensilios artesanales para la mesa y la cocina. Cada pieza está hecha con el cuidado y la dedicación de manos expertas.',
      },
      {
        slug: 'muebles',
        description:
          'Muebles hechos a mano por maestros carpinteros y artesanos colombianos. Cada pieza combina funcionalidad con el carácter único del trabajo manual.',
      },
      {
        slug: 'juguetes-e-instrumentos-musicales',
        description:
          'Juguetes tradicionales e instrumentos musicales artesanales de Colombia. Piezas que celebran el juego, la música y la tradición cultural.',
      },
    ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const { slug, description } of SeedCategoryDescriptions1784500000000.DESCRIPTIONS) {
      await queryRunner.query(
        `UPDATE taxonomy.categories SET description = $1 WHERE slug = $2`,
        [description, slug],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const slugs = SeedCategoryDescriptions1784500000000.DESCRIPTIONS.map(
      (d) => d.slug,
    );
    await queryRunner.query(
      `UPDATE taxonomy.categories SET description = NULL WHERE slug = ANY($1)`,
      [slugs],
    );
  }
}
