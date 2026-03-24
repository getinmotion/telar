import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import {
  CategoryEditorialHeader,
  SubcategoryPills,
  CategoryFilterSidebar,
  CategoryProductGrid,
  EditorialStoryBlock,
  FeaturedWorkshops,
  GiftCTA,
} from "@/components/category-detail";
import { useMarketplaceCategories } from "@/hooks/useMarketplaceCategories";
import { useProducts } from "@/contexts/ProductsContext";
import { Product } from "@/types/products.types";

// Map category name to URL-friendly slug
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Subcategory keywords per category (can be extended or fetched from CMS)
const SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Textiles y Moda": [
    "Cojines",
    "Mantas",
    "Hamacas",
    "Caminos de mesa",
    "Tapices",
    "Prendas textiles",
    "Accesorios textiles",
  ],
  "Joyeria y Accesorios": [
    "Collares",
    "Aretes",
    "Pulseras",
    "Anillos",
    "Tobilleras",
  ],
  "Decoracion del Hogar": [
    "Jarrones",
    "Cuadros",
    "Tapices",
    "Espejos",
    "Velas",
  ],
  "Bolsos y Carteras": [
    "Mochilas",
    "Bolsos de mano",
    "Carteras",
    "Monederos",
    "Morrales",
  ],
  "Vajillas y Cocina": [
    "Platos",
    "Tazas",
    "Bowls",
    "Bandejas",
    "Cubiertos",
  ],
  "Muebles": [
    "Sillas",
    "Mesas",
    "Estanterias",
    "Baules",
  ],
  "Arte y Esculturas": [
    "Esculturas",
    "Figuras",
    "Cuadros",
    "Grabados",
  ],
  "Cuidado Personal": [
    "Jabones",
    "Cremas",
    "Aceites",
    "Balsamos",
  ],
};

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { categories, categoryNames } = useMarketplaceCategories();
  const { products, total, fetchProducts } = useProducts();

  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState(2000000);

  // Find the matching category from slug
  const category = useMemo(() => {
    return categories.find((cat) => toSlug(cat.name) === slug);
  }, [categories, slug]);

  const categoryName = category?.name || "";

  const safeProducts = Array.isArray(products) ? products : [];

  // Fetch products for this category
  useEffect(() => {
    if (categoryName) {
      fetchProducts({ category: categoryName, limit: 12 }).catch(() => {});
    }
  }, [categoryName]);

  // Subcategories for this category
  const subcategories = useMemo(() => {
    return SUBCATEGORIES_MAP[categoryName] || [];
  }, [categoryName]);

  // Extract unique techniques, regions, and materials from loaded products
  const techniques = useMemo(() => {
    const map = new Map<string, number>();
    safeProducts.forEach((p) =>
      p.techniques?.forEach((t) => map.set(t, (map.get(t) || 0) + 1))
    );
    return Array.from(map, ([label, count]) => ({ label, count }));
  }, [safeProducts]);

  const regions = useMemo(() => {
    const map = new Map<string, number>();
    safeProducts.forEach((p) => {
      if (p.department) map.set(p.department, (map.get(p.department) || 0) + 1);
    });
    return Array.from(map, ([label, count]) => ({ label, count }));
  }, [safeProducts]);

  const materials = useMemo(() => {
    const map = new Map<string, number>();
    safeProducts.forEach((p) =>
      p.materials?.forEach((m) => map.set(m, (map.get(m) || 0) + 1))
    );
    return Array.from(map, ([label, count]) => ({ label, count }));
  }, [safeProducts]);

  // Extract unique workshops from products
  const workshops = useMemo(() => {
    const seen = new Set<string>();
    return safeProducts
      .filter((p) => {
        if (!p.storeName || seen.has(p.storeName)) return false;
        seen.add(p.storeName);
        return true;
      })
      .slice(0, 6)
      .map((p) => ({
        name: p.storeName || "",
        region: p.department || "",
        description: p.storeDescription || `Taller artesanal en ${p.city || p.department || "Colombia"}.`,
        imageUrl: p.logoUrl,
        slug: p.storeSlug,
      }));
  }, [safeProducts]);

  if (!category) {
    return (
      <div className="min-h-screen bg-editorial-bg flex items-center justify-center">
        <p className="text-charcoal/50 font-sans">Categoria no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editorial-bg text-charcoal">
      {/* Editorial Header with Breadcrumb */}
      <CategoryEditorialHeader
        categoryName={categoryName}
        categoryDescription={
          category.description ||
          `Piezas artesanales de ${categoryName} hechas a mano por talleres de Colombia.`
        }
        imageUrl={category.imageUrl}
      />

      {/* Subcategory Pills */}
      {subcategories.length > 0 && (
        <SubcategoryPills
          subcategories={subcategories}
          activeSubcategory={activeSubcategory}
          onSelect={setActiveSubcategory}
        />
      )}

      {/* Filters + Product Grid */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="flex flex-col lg:flex-row gap-16">
          <CategoryFilterSidebar
            categories={categoryNames}
            activeCategory={categoryName}
            techniques={techniques}
            regions={regions}
            materials={materials}
            onCategoryChange={(cat) => {
              const newSlug = toSlug(cat);
              window.location.href = `/categoria/${newSlug}`;
            }}
            currentPrice={priceValue}
            onPriceChange={setPriceValue}
          />

          <CategoryProductGrid
            products={safeProducts}
            totalProducts={total}
            hasMore={safeProducts.length < total}
            onLoadMore={() =>
              fetchProducts({
                category: categoryName,
                limit: 12,
                page: Math.floor(safeProducts.length / 12) + 1,
              }).catch(() => {})
            }
          />
        </div>
      </section>

      {/* Editorial Story Block */}
      <EditorialStoryBlock
        title="El tejido en"
        highlightText={category.name.split(" y ")[0] || "Colombia"}
        description={`Descubre la rica tradicion artesanal detras de cada pieza de ${categoryName}. Una herencia que perdura a traves de generaciones de artesanos colombianos.`}
      />

      {/* Featured Workshops */}
      <FeaturedWorkshops workshops={workshops} />

      {/* Gift CTA */}
      <GiftCTA />

      <Footer />
    </div>
  );
}
