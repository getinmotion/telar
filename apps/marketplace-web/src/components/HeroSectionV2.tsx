/**
 * HeroSectionV2 Component
 * Nueva versión del Hero con diseño de 2 columnas
 */

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Imagen del hero desde S3
const HERO_IMAGE = "https://telar-prod-bucket.s3.us-east-1.amazonaws.com/images/1766278723378_0_WhatsApp_Image_2025-08-08_at_3.29.32_PM.jpeg.jpeg";

export const HeroSectionV2 = () => {
  return (
    <section className="w-full bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Grid de 2 columnas con margin lateral del 10% */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mx-[10%]">

          {/* Columna 1: Contenido de texto */}
          <div className="flex flex-col gap-6">
            {/* Título principal */}
            <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-6 text-charcoal tracking-tight">
              HISTORIAS HECHAS <br />
              <span className="italic text-primary">A MANO</span>
            </h1>

            {/* Descripción principal */}
            <p className="text-sm md:text-base text-charcoal/70 font-sans font-light leading-relaxed">
              Objetos auténticos creados por talleres artesanales de Colombia.
              Cada pieza conserva la historia, el origen y el conocimiento de
              quienes la crean.
            </p>

            {/* Subtítulo light */}
            <p className="text-sm md:text-base text-muted-foreground font-light tracking-wide uppercase">
              Hecho a mano por talleres artesanales de Colombia.
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to="/productos">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
                >
                  Explorar Piezas
                </Button>
              </Link>
              <Link to="/tiendas">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2"
                >
                  Conocer Talleres
                </Button>
              </Link>
            </div>
          </div>

          {/* Columna 2: Imagen y etiquetas */}
          <div className="flex flex-col gap-4">
            {/* Imagen con zoom */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl h-[250px] md:h-[300px]">
              <img
                src={HERO_IMAGE}
                alt="Artesanía colombiana"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Etiquetas debajo de la imagen */}
            <div className="flex flex-col gap-2 px-2">
              {/* Origen */}
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-500 uppercase tracking-wide">
                Origen: Bogotá, Colombia
              </p>

              {/* Frase en cursiva */}
              <p className="text-lg md:text-xl font-serif italic text-foreground/80">
                "Cada puntada es un susurro de nuestros ancestros."
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
