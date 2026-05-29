/**
 * Colecciones — Editorial Collections Archive
 * Route: /colecciones
 *
 * 100 % CMS-driven via <PageRenderer pageKey="colecciones" />.
 * Toda la composición visual la controla el curador desde /moderacion/cms.
 *
 * Bloques data-driven (collections de Mongo, content picks, 3 cols con
 * curatorialCategories/techniques) son `embedded_widget` registrados en
 * `SectionDispatcher`. Para agregar un widget nuevo:
 *  1. Crearlo en `components/colecciones/ColeccionesWidgets.tsx`
 *  2. Registrarlo en `SectionDispatcher.tsx` (WIDGET_REGISTRY)
 *  3. Añadir una sección `embedded_widget` desde el admin o el seed.
 */
import { Helmet } from 'react-helmet-async';
import { Footer } from '@/components/Footer';
import { PageRenderer } from '@/components/cms/PageRenderer';
import { FALLBACK_COLECCIONES_SECTIONS } from '@/datafallback/fallbackColecciones';

export default function Colecciones() {
  return (
    <>
      <Helmet>
        <title>Colecciones — TELAR</title>
        <meta
          name="description"
          content="Selecciones curadas que exploran la materialidad y el alma de la artesanía colombiana."
        />
      </Helmet>

      <div className="bg-[#f9f7f2] text-[#2c2c2c] min-h-screen">
        <PageRenderer pageKey="colecciones" fallback={FALLBACK_COLECCIONES_SECTIONS} />
        <Footer />
      </div>
    </>
  );
}
