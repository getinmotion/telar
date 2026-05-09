import { CmsSection } from '../types/cms-section.types';

/**
 * Seed de secciones tipo `content_pick`.
 *
 * Una `content_pick` es un bloque editable donde el curador "pega" una
 * referencia a un blog post (`targetType: 'blog'`) o a una colección
 * (`targetType: 'collection'`) por su `slug`. El frontend hidrata el
 * card con el doc real (cover, título, excerpt) y deja al curador
 * sobreescribir cualquier campo con `overrideX`.
 *
 * Payload shape:
 *   {
 *     slot:        string                       // identificador único (ej: 'home_pick_1')
 *     targetType:  'blog' | 'collection'
 *     slug:        string                       // slug del doc referenciado
 *     label?:      string                       // pill (ej: 'Editorial', 'Lectura recomendada')
 *     overrideTitle?:    string                 // pisa el título del doc
 *     overrideExcerpt?:  string                 // pisa el excerpt
 *     overrideImageUrl?: string                 // pisa la cover
 *     ctaLabel?:   string                       // texto del botón
 *     variant?:    'card' | 'banner' | 'inline' // estilo visual
 *   }
 *
 * Para usar en el seed runner, importa este array y haz:
 *   await seedPage(cmsSvc, 'home', contentPicksSeedSections, log);
 *
 * (o muévelo a la página que prefieras: 'home', 'colecciones', 'tecnicas'…)
 */
export const contentPicksSeedSections: Omit<
  CmsSection,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  // 1) Pick de una colección — banner grande
  {
    pageKey: 'home',
    position: 50,
    type: 'content_pick',
    published: true,
    payload: {
      slot: 'home_pick_1',
      targetType: 'collection',
      slug: 'dia-de-la-madre',
      label: 'Colección destacada',
      ctaLabel: 'Ver colección',
      variant: 'banner',
    },
  },
  // 2) Pick de un blog post — card normal
  {
    pageKey: 'home',
    position: 51,
    type: 'content_pick',
    published: true,
    payload: {
      slot: 'home_pick_2',
      targetType: 'blog',
      slug: 'cauca-seda-paz',
      label: 'Lectura recomendada',
      ctaLabel: 'Leer historia',
      variant: 'card',
    },
  },
  // 3) Pick de colección con overrides — el curador customiza el copy
  {
    pageKey: 'colecciones',
    position: 10,
    type: 'content_pick',
    published: true,
    payload: {
      slot: 'colecciones_pick_featured',
      targetType: 'collection',
      slug: 'ceramica-de-la-chamba',
      label: 'Patrimonio',
      overrideTitle: 'El barro negro de La Chamba',
      overrideExcerpt:
        '300 años de tradición alfarera. Denominación de Origen. Liderazgo femenino.',
      overrideImageUrl: '',
      ctaLabel: 'Entrar en la colección',
      variant: 'banner',
    },
  },
];
