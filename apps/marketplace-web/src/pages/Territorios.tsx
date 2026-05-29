/**
 * Territorios — Editorial cartographic landing page
 * Route: /territorios
 *
 * 100 % CMS-driven via <PageRenderer pageKey="territorios" />.
 * El bloque interactivo (mapa + spotlight + tiendas + lista índice) vive
 * como `embedded_widget` con `widget: 'territorios_map_block'` registrado
 * en SectionDispatcher. El curador puede reordenar todo desde
 * /moderacion/cms y poner secciones editoriales antes o después del mapa.
 */
import { Footer } from '@/components/Footer';
import { PageRenderer } from '@/components/cms/PageRenderer';
import { FALLBACK_TERRITORIOS_SECTIONS } from '@/datafallback/fallbackTerritorios';

const Territorios = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2', color: '#1b1c19' }}>
      <PageRenderer pageKey="territorios" fallback={FALLBACK_TERRITORIOS_SECTIONS} />
      <Footer />
    </div>
  );
};

export default Territorios;
