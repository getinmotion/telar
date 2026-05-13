/**
 * Homepage — 100% CMS-driven via PageRenderer.
 *
 * Toda la página se compone de secciones en `cms_pages.pageKey='home'`
 * ordenadas por `position`. El curador reordena, añade y quita desde
 * el admin sin pedir cambios al equipo de frontend.
 *
 * Para añadir un widget hardcoded nuevo:
 *  1. Crearlo en `components/home/widgets/HomeWidgets.tsx`
 *  2. Registrarlo en `components/cms/SectionDispatcher.tsx` (WIDGET_REGISTRY)
 *  3. Añadir una sección `embedded_widget` con `payload.widget = 'tu_widget'`
 *     desde el admin o el seed.
 */
import { Helmet } from 'react-helmet-async';
import { Footer } from '@/components/Footer';
import { PageRenderer } from '@/components/cms/PageRenderer';

export default function Index() {
  return (
    <>
      <Helmet>
        <title>TELAR — Artesanía Colombiana</title>
        <meta
          name="description"
          content="Objetos auténticos creados por talleres artesanales de Colombia. Cada pieza conserva la historia, el origen y el conocimiento de quienes la crean."
        />
      </Helmet>

      <div className="min-h-screen bg-[#f9f7f2] text-[#2c2c2c] font-sans selection:bg-[#7a8a7a] selection:text-white">
        <PageRenderer pageKey="home" />
        <Footer />
      </div>
    </>
  );
}
