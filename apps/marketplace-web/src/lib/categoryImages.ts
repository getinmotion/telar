/**
 * Ilustraciones de categoría del marketplace.
 *
 * Son el set curado de la marca (mismo trazo, misma paleta) y tienen
 * prioridad sobre el `imageUrl` que trae la taxonomía de la API: ese campo
 * apunta a fotos sueltas en S3 que no siguen la línea gráfica. Si una
 * categoría no tiene ilustración curada, se usa el `imageUrl` de la API.
 *
 * Se resuelven por slug y, si el slug no coincide, por nombre en minúsculas.
 * Las usan la home, "Explorar por categorías", /categorias y /categoria/:slug
 * para que las cuatro superficies muestren la misma imagen por categoría.
 */

import joyeriaImg from '@/assets/categories/joyeria.jpg';
import decoracionImg from '@/assets/categories/decoracion.jpg';
import textilesImg from '@/assets/categories/textiles.jpg';
import bolsosImg from '@/assets/categories/bolsos.jpg';
import vajillasImg from '@/assets/categories/vajillas.jpg';
import mueblesImg from '@/assets/categories/muebles.jpg';
import arteImg from '@/assets/categories/arte.jpg';
import juguetesImg from '@/assets/categories/juguetes.jpg';
import cuidadoPersonalImg from '@/assets/categories/cuidado-personal.jpg';

export const CATEGORY_IMAGES: Record<string, string> = {
  // Por slug (como los devuelve la API)
  'joyeria-y-accesorios': joyeriaImg,
  'decoracion-del-hogar': decoracionImg,
  'textiles-y-moda': textilesImg,
  'bolsos-y-carteras': bolsosImg,
  'vajillas-y-cocina': vajillasImg,
  muebles: mueblesImg,
  'arte-y-esculturas': arteImg,
  'juguetes-e-instrumentos-musicales': juguetesImg,
  // La API la sirve como 'belleza-y-cuidado-personal' y la nombra 'Cuidado Personal'
  'belleza-y-cuidado-personal': cuidadoPersonalImg,
  'cuidado-personal': cuidadoPersonalImg,
  // Por nombre en minúsculas
  'joyería y accesorios': joyeriaImg,
  'decoración del hogar': decoracionImg,
  'textiles y moda': textilesImg,
  'bolsos y carteras': bolsosImg,
  'vajillas y cocina': vajillasImg,
  'arte y esculturas': arteImg,
  'juguetes e instrumentos musicales': juguetesImg,
  'cuidado personal': cuidadoPersonalImg,
  'belleza y cuidado personal': cuidadoPersonalImg,
};

/** Imagen a mostrar para una categoría: la ilustración curada si existe, si no la de la API. */
export function getCategoryImage(cat: {
  slug: string;
  name: string;
  imageUrl: string | null;
}): string {
  return (
    CATEGORY_IMAGES[cat.slug] ??
    CATEGORY_IMAGES[cat.name.toLowerCase()] ??
    cat.imageUrl ??
    decoracionImg
  );
}
