import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import {
  ArtisanHero,
  ArtisanStory,
  ArtisanTechniques,
  ArtisanOrigin,
  ArtisanProcess,
  ArtisanTraceability,
  ArtisanProductsGrid,
  ArtisanFairTrade,
} from "@/components/artisan-profile";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { useProducts } from "@/contexts/ProductsContext";
import type { Technique } from "@/components/artisan-profile/ArtisanTechniques";
import type { ProcessStep } from "@/components/artisan-profile/ArtisanProcess";

export default function ArtisanProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { currentShop, fetchShopBySlug, loading: shopLoading } = useArtisanShops();
  const { products, fetchProductsByShop } = useProducts();

  const safeProducts = Array.isArray(products) ? products : [];

  // Fetch shop by slug
  useEffect(() => {
    if (slug) {
      fetchShopBySlug(slug).catch(() => {});
    }
  }, [slug]);

  // Fetch products when shop loads
  useEffect(() => {
    if (currentShop?.id) {
      fetchProductsByShop(currentShop.id).catch(() => {});
    }
  }, [currentShop?.id]);

  // Build location string
  const location = useMemo(() => {
    if (!currentShop) return "";
    return [currentShop.municipality, currentShop.department]
      .filter(Boolean)
      .join(", ");
  }, [currentShop]);

  // Derive techniques from products data
  const techniques: Technique[] = useMemo(() => {
    const techSet = new Set<string>();
    safeProducts.forEach((p) =>
      p.techniques?.forEach((t) => techSet.add(t))
    );
    return Array.from(techSet).slice(0, 2).map((t) => ({
      name: t,
      description: `Tecnica artesanal utilizada por ${currentShop?.shopName || "este taller"}.`,
    }));
  }, [safeProducts, currentShop?.shopName]);

  // Derive process steps (generic if no specific data available)
  const processSteps: ProcessStep[] = useMemo(() => {
    return [
      {
        title: "Seleccion de Fibras",
        description:
          "Elegimos cuidadosamente las materias primas, priorizando la calidad y la sostenibilidad local.",
        phaseLabel: "Fase 1: Materia Prima",
      },
      {
        title: "Preparacion y Montaje",
        description:
          "Se prepara el espacio de trabajo, un proceso que define el patron y estructura de la pieza.",
        phaseLabel: "Fase 2: Estructura",
      },
      {
        title: "Creacion Artesanal",
        description:
          "Dias de trabajo manual donde el artesano imprime su alma en cada centimetro, creando texturas irrepetibles.",
        phaseLabel: "Fase 3: Ejecucion",
      },
    ];
  }, []);

  // Loading state
  if (shopLoading && !currentShop) {
    return (
      <div className="min-h-screen bg-editorial-bg flex items-center justify-center">
        <p className="text-charcoal/50 font-sans animate-pulse">
          Cargando perfil del artesano...
        </p>
      </div>
    );
  }

  // Not found
  if (!shopLoading && !currentShop) {
    return (
      <div className="min-h-screen bg-editorial-bg flex items-center justify-center">
        <p className="text-charcoal/50 font-sans">Artesano no encontrado</p>
      </div>
    );
  }

  const shop = currentShop!;

  return (
    <div className="min-h-screen bg-editorial-bg text-charcoal">
      {/* 1. Editorial Hero */}
      <ArtisanHero
        name={shop.shopName}
        location={location}
        technique={shop.craftType || "Artesania tradicional"}
        tagline={shop.description}
        imageUrl={shop.bannerUrl}
      />

      {/* 2. Story */}
      <ArtisanStory
        artisanName={shop.shopName}
        story={
          shop.story ||
          `El taller de ${shop.shopName} es un espacio dedicado a preservar las tecnicas artesanales tradicionales de ${location || "Colombia"}.`
        }
      />

      {/* 3. Techniques */}
      {techniques.length > 0 && (
        <ArtisanTechniques techniques={techniques} />
      )}

      {/* 4. Cultural Origin */}
      {location && (
        <ArtisanOrigin
          location={location}
          description={`Reconocido por su tradicion artesanal. Una tierra donde la cultura y el oficio se entrelazan en cada pieza creada por ${shop.shopName}.`}
        />
      )}

      {/* 5. Creation Process */}
      <ArtisanProcess steps={processSteps} />

      {/* 6. Digital Traceability */}
      <ArtisanTraceability
        artisanName={shop.shopName}
        location={location}
      />

      {/* 7. Products */}
      <ArtisanProductsGrid
        products={safeProducts}
        shopSlug={shop.shopSlug}
      />

      {/* 8. Fair Trade */}
      <ArtisanFairTrade
        location={
          shop.municipality || shop.department || undefined
        }
      />

      <Footer />
    </div>
  );
}
