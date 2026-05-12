/**
 * Territorios — Editorial cartographic landing page
 * Route: /territorios
 * Shows a real map of Colombia with artisan territory markers + editorial index.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Map, { Marker, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Footer } from "@/components/Footer";
import { getArtisanShops } from "@/services/artisan-shops.actions";
import { geocodeArtisan, jitter } from "@/lib/colombia-geocodes";
import type { ArtisanShop } from "@/types/artisan-shops.types";

/* ── Territory data ─────────────────────────────────── */
interface TerritoryPoint {
  slug: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  color: string;
  size: number;
  techniques: string;
  region: string;
}

const TERRITORIES: TerritoryPoint[] = [
  {
    slug: "la-guajira",
    name: "La Guajira",
    subtitle: "Tejeduría Wayúu · Desierto y Mar",
    lat: 11.55,
    lng: -72.9,
    color: "#ec6d13",
    size: 16,
    techniques: "Tejeduría Wayúu",
    region: "Caribe",
  },
  {
    slug: "san-jacinto",
    name: "San Jacinto",
    subtitle: "Hamacas y Telar · Montes de María",
    lat: 9.83,
    lng: -75.12,
    color: "#ec6d13",
    size: 22,
    techniques: "Telar vertical, Macramé",
    region: "Caribe",
  },
  {
    slug: "boyaca",
    name: "Boyacá",
    subtitle: "Tradición Textil · Altiplano",
    lat: 5.53,
    lng: -73.36,
    color: "#ec6d13",
    size: 18,
    techniques: "Hilado manual, Ruanas",
    region: "Andina",
  },
  {
    slug: "narino",
    name: "Nariño",
    subtitle: "Barniz de Pasto · Andes Volcánicos",
    lat: 1.28,
    lng: -77.35,
    color: "#0098f2",
    size: 18,
    techniques: "Barniz de Pasto, Paja Toquilla",
    region: "Pacífico",
  },
  {
    slug: "la-chamba",
    name: "La Chamba",
    subtitle: "Barro Negro · Río Magdalena",
    lat: 3.68,
    lng: -75.02,
    color: "#584237",
    size: 14,
    techniques: "Cerámica de barro negro",
    region: "Andina",
  },
  {
    slug: "putumayo",
    name: "Putumayo",
    subtitle: "Cestería y Semillas · Selva Amazónica",
    lat: 0.77,
    lng: -76.64,
    color: "#0098f2",
    size: 14,
    techniques: "Cestería, Semillas",
    region: "Amazonía",
  },
  {
    slug: "cauca",
    name: "Cauca",
    subtitle: "Seda y Tintes de Paz · Popayán · Timbío · El Tambo",
    lat: 2.44,
    lng: -76.61,
    color: "#ec6d13",
    size: 20,
    techniques: "Sericultura, Tintes Naturales, Telar",
    region: "Pacífico",
  },
];

/* ── Map style — Carto Positron with warm editorial tones ── */
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

/* ── Component ──────────────────────────────────────── */
interface ArtisanPoint {
  shop: ArtisanShop;
  lat: number;
  lng: number;
}

const Territorios = () => {
  const navigate = useNavigate();
  const mapRef = useRef<MapRef>(null);
  const [hoveredTerritory, setHoveredTerritory] = useState<string | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryPoint | null>(null);
  const [hoveredArtisan, setHoveredArtisan] = useState<string | null>(null);

  const { data: shopsResponse } = useQuery({
    queryKey: ["artisan-shops", "territorios-map"],
    queryFn: () =>
      getArtisanShops({
        active: true,
        publishStatus: "published",
        marketplaceApproved: true,
        limit: 100,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const artisanPoints = useMemo<ArtisanPoint[]>(() => {
    const shops = shopsResponse?.data ?? [];
    return shops.flatMap((shop) => {
      const base = geocodeArtisan(shop);
      if (!base) return [];
      const { dLat, dLng } = jitter(shop.id);
      return [{ shop, lat: base.lat + dLat, lng: base.lng + dLng }];
    });
  }, [shopsResponse]);

  const unlocatedShops = useMemo<ArtisanShop[]>(() => {
    const shops = shopsResponse?.data ?? [];
    return shops.filter((s) => !geocodeArtisan(s));
  }, [shopsResponse]);

  // Fly to territory on click
  const flyToTerritory = useCallback((t: TerritoryPoint) => {
    setSelectedTerritory(t);
    mapRef.current?.flyTo({
      center: [t.lng, t.lat],
      zoom: 8,
      duration: 1400,
    });
  }, []);

  // Reset map view
  const resetView = useCallback(() => {
    setSelectedTerritory(null);
    mapRef.current?.flyTo({
      center: [-73.5, 4.5],
      zoom: 5.2,
      duration: 1200,
    });
  }, []);

  // Spotlight territory (default to San Jacinto)
  const spotlight = selectedTerritory || TERRITORIES.find((t) => t.slug === "san-jacinto")!;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f7f2", color: "#1b1c19" }}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="px-8 pt-24 pb-12 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-8">
          <span
            className="text-sm tracking-[0.3em] uppercase mb-6 block font-sans font-bold"
            style={{ color: "#ec6d13" }}
          >
            Geografía Humana
          </span>
          <h1
            className="text-6xl md:text-8xl font-serif font-bold leading-tight mb-8"
            style={{ letterSpacing: "-0.02em", color: "#1b1c19" }}
          >
            El mapa de nuestros hilos
          </h1>
          <p
            className="text-xl md:text-2xl font-serif italic max-w-2xl leading-relaxed"
            style={{ color: "#584237" }}
          >
            "El territorio no es un lugar, es un ecosistema de gestos, materiales y memoria. Cada
            región de Colombia custodia una forma distinta de transformar la materia."
          </p>
        </div>
        <div className="md:col-span-4 flex flex-col justify-end items-start md:items-end text-left md:text-right space-y-4">
          {[
            { value: `+${TERRITORIES.length}`, label: "Regiones" },
            { value: artisanPoints.length > 0 ? `+${artisanPoints.length}` : "+120", label: "Talleres" },
            { value: "+24", label: "Técnicas" },
          ].map((stat) => (
            <div key={stat.label}>
              <span className="block text-4xl font-serif" style={{ color: "#ec6d13" }}>
                {stat.value}
              </span>
              <span className="text-xs tracking-widest uppercase font-sans" style={{ color: "#584237" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ REAL MAP ═══════════════ */}
      <section className="w-full py-24 relative overflow-hidden" style={{ backgroundColor: "#f5f3ee" }}>
        <div className="max-w-[1400px] mx-auto px-8 relative z-10 flex flex-col items-center">
          <div
            className="w-full rounded-xl overflow-hidden relative"
            style={{
              aspectRatio: "16/9",
              boxShadow: "0 20px 40px rgba(27, 28, 25, 0.06)",
            }}
          >
            <Map
              ref={mapRef}
              initialViewState={{
                longitude: -73.5,
                latitude: 4.5,
                zoom: 5.2,
              }}
              style={{ width: "100%", height: "100%" }}
              mapStyle={MAP_STYLE}
              attributionControl={false}
              interactive={true}
            >
              <NavigationControl position="top-right" showCompass={false} />

              {artisanPoints.map(({ shop, lat, lng }) => (
                <Marker
                  key={`artisan-${shop.id}`}
                  longitude={lng}
                  latitude={lat}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    navigate(`/artesano/${shop.shopSlug}`);
                  }}
                >
                  <div
                    className="relative cursor-pointer"
                    onMouseEnter={() => setHoveredArtisan(shop.id)}
                    onMouseLeave={() => setHoveredArtisan(null)}
                  >
                    <div
                      className="rounded-full border transition-transform duration-200"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: "rgba(236, 109, 19, 0.65)",
                        borderColor: "#fff",
                        transform: hoveredArtisan === shop.id ? "scale(1.6)" : "scale(1)",
                      }}
                    />
                    {hoveredArtisan === shop.id && (
                      <div
                        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-[10px] tracking-widest uppercase font-bold font-sans z-20"
                        style={{
                          backgroundColor: "#1b1c19",
                          color: "#f9f7f2",
                        }}
                      >
                        {shop.shopName}
                      </div>
                    )}
                  </div>
                </Marker>
              ))}

              {TERRITORIES.map((t) => (
                <Marker
                  key={t.slug}
                  longitude={t.lng}
                  latitude={t.lat}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    flyToTerritory(t);
                  }}
                >
                  <div
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setHoveredTerritory(t.slug)}
                    onMouseLeave={() => setHoveredTerritory(null)}
                  >
                    {/* Pulse ring */}
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-30"
                      style={{
                        backgroundColor: t.color,
                        width: t.size,
                        height: t.size,
                      }}
                    />
                    {/* Dot */}
                    <div
                      className="rounded-full border-2 transition-transform duration-300"
                      style={{
                        width: t.size,
                        height: t.size,
                        backgroundColor: t.color,
                        borderColor: "#fff",
                        transform: hoveredTerritory === t.slug || selectedTerritory?.slug === t.slug
                          ? "scale(1.4)"
                          : "scale(1)",
                      }}
                    />
                    {/* Tooltip */}
                    {(hoveredTerritory === t.slug || selectedTerritory?.slug === t.slug) && (
                      <div
                        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-[10px] tracking-widest uppercase font-bold font-sans"
                        style={{
                          backgroundColor: "#1b1c19",
                          color: "#f9f7f2",
                        }}
                      >
                        {t.name}
                      </div>
                    )}
                  </div>
                </Marker>
              ))}
            </Map>

            {/* Map caption overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4 z-10">
              <div className="w-12 h-[1px]" style={{ backgroundColor: "#8c7265" }} />
              <span className="text-[10px] uppercase tracking-widest font-sans" style={{ color: "#584237" }}>
                Diagrama de Densidad Artesanal / 2025
              </span>
            </div>

            {/* Reset button when zoomed */}
            {selectedTerritory && (
              <button
                onClick={resetView}
                className="absolute top-4 left-4 z-10 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold font-sans transition-colors"
                style={{
                  backgroundColor: "#1b1c19",
                  color: "#f9f7f2",
                }}
              >
                ← Ver todo Colombia
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════ TIENDAS SIN UBICAR ═══════════════ */}
      {unlocatedShops.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-8 py-12">
          <span
            className="text-xs tracking-widest uppercase mb-4 block font-sans font-bold"
            style={{ color: "#584237" }}
          >
            Tiendas sin ubicación cartográfica
          </span>
          <div className="flex flex-wrap gap-2">
            {unlocatedShops.map((s) => (
              <Link
                key={s.id}
                to={`/artesano/${s.shopSlug}`}
                className="px-3 py-1.5 text-xs font-sans border rounded-full hover:bg-[#1b1c19] hover:text-white transition-colors"
                style={{ borderColor: "rgba(140,114,101,0.3)", color: "#1b1c19" }}
              >
                {s.shopName}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════ TERRITORY SPOTLIGHT ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <span
              className="text-sm tracking-widest uppercase mb-4 block font-sans font-bold"
              style={{ color: "#ec6d13" }}
            >
              Foco Regional
            </span>
            <h3 className="text-5xl font-serif font-bold mb-6" style={{ letterSpacing: "-0.02em" }}>
              {spotlight.name}
            </h3>
            <p className="text-lg italic leading-relaxed mb-8" style={{ color: "#584237" }}>
              {spotlight.slug === "san-jacinto"
                ? '"Donde la hamaca se teje con notas de gaita: la tierra de la hamaca grande, cuna del Reino Finzenú."'
                : `Región: ${spotlight.region}. Tradiciones artesanales arraigadas en el paisaje y la memoria.`}
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <span className="mt-1 text-[#ec6d13]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </span>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest mb-1 font-sans" style={{ color: "#584237" }}>
                    Técnicas Clave
                  </span>
                  <p className="font-medium">{spotlight.techniques}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="mt-1 text-[#ec6d13]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </span>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest mb-1 font-sans" style={{ color: "#584237" }}>
                    Región
                  </span>
                  <p className="font-medium">{spotlight.region}</p>
                </div>
              </div>
            </div>

            <Link
              to={`/territorio/${spotlight.slug}`}
              className="inline-block px-10 py-4 rounded-md text-sm tracking-widest uppercase font-sans font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#ec6d13", color: "#fff" }}
            >
              Explorar Colección
            </Link>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <div
              className="relative aspect-[4/5] rounded-md overflow-hidden"
              style={{
                backgroundColor: "#eae8e3",
                boxShadow: "0 20px 40px rgba(27, 28, 25, 0.06)",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-8xl font-black tracking-tighter uppercase font-serif"
                  style={{ color: "rgba(27,28,25,0.03)" }}
                >
                  {spotlight.region}
                </span>
              </div>
              <div className="absolute bottom-6 right-6 text-right" style={{ color: "#fff" }}>
                <span className="block text-[10px] uppercase tracking-[0.2em] mb-1 font-sans">
                  Territorio
                </span>
                <span className="text-2xl font-serif italic">{spotlight.name}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ DARK EDITORIAL MODULE ═══════════════ */}
      <section className="py-32" style={{ backgroundColor: "#1b1c19", color: "#e4e2dd" }}>
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
            <div className="space-y-12">
              <div className="max-w-md">
                <span className="text-4xl mb-6 block" style={{ color: "#ec6d13" }}>"</span>
                <p className="text-3xl font-serif leading-snug mb-6">
                  La geografía dicta la técnica. Donde hay palma, hay cestería; donde hay volcán, hay
                  barro negro.
                </p>
                <div className="w-16 h-[2px]" style={{ backgroundColor: "#ec6d13" }} />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-8 border rounded-lg" style={{ borderColor: "rgba(228,226,221,0.1)" }}>
                  <span className="block text-5xl font-serif mb-2" style={{ color: "#ec6d13" }}>
                    +120
                  </span>
                  <p className="text-xs uppercase tracking-widest opacity-60 font-sans">
                    Talleres en el Pacífico
                  </p>
                </div>
                <div className="p-8 border rounded-lg" style={{ borderColor: "rgba(228,226,221,0.1)" }}>
                  <span className="block text-5xl font-serif mb-2" style={{ color: "#ba1a1a" }}>
                    45
                  </span>
                  <p className="text-xs uppercase tracking-widest opacity-60 font-sans">
                    Técnicas en riesgo de desaparición
                  </p>
                </div>
              </div>
            </div>

            <div
              className="relative aspect-video md:aspect-square rounded-xl overflow-hidden flex items-center justify-center p-12"
              style={{ backgroundColor: "rgba(228,226,221,0.05)" }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="relative z-10 text-center">
                <h4 className="text-4xl font-serif mb-6" style={{ color: "#f9f7f2" }}>
                  El rastro de la fibra
                </h4>
                <p className="max-w-sm mx-auto leading-relaxed italic" style={{ color: "rgba(228,226,221,0.7)" }}>
                  "En la humedad del Pacífico, la fibra se curva antes de ceder. El artesano no
                  domina la materia, la acompaña en su metamorfosis natural."
                </p>
                <div className="mt-12 flex justify-center gap-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ec6d13" }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(236,109,19,0.4)" }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(236,109,19,0.2)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TERRITORY INDEX ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span
              className="text-sm tracking-widest uppercase mb-4 block font-sans font-bold"
              style={{ color: "#ec6d13" }}
            >
              Índice Editorial
            </span>
            <h2 className="text-5xl font-serif font-bold">Territorios de Gracia</h2>
          </div>
          <div
            className="w-full md:w-1/2 mb-4 h-[1px]"
            style={{
              background: "linear-gradient(90deg, #ec6d13 0%, transparent 100%)",
              opacity: 0.2,
            }}
          />
        </div>

        <div className="space-y-0">
          {TERRITORIES.map((t, i) => (
            <Link
              key={t.slug}
              to={`/territorio/${t.slug}`}
              className="group block py-12 border-b transition-all duration-500 hover:px-8"
              style={{ borderColor: "rgba(140,114,101,0.1)" }}
              onMouseEnter={() => {
                setHoveredTerritory(t.slug);
                mapRef.current?.flyTo({ center: [t.lng, t.lat], zoom: 7, duration: 800 });
              }}
              onMouseLeave={() => {
                setHoveredTerritory(null);
              }}
            >
              <div className="flex flex-col md:flex-row justify-between items-baseline gap-4">
                <div className="flex items-baseline gap-8">
                  <span className="text-xs font-sans" style={{ color: "#584237" }}>
                    {String(i + 1).padStart(2, "0")}.
                  </span>
                  <h4 className="text-4xl md:text-6xl font-serif group-hover:italic transition-all" style={{
                    color: hoveredTerritory === t.slug ? "#ec6d13" : "#1b1c19",
                  }}>
                    {t.name}
                  </h4>
                </div>
                <span
                  className="text-xs tracking-widest uppercase font-sans transition-opacity"
                  style={{ opacity: hoveredTerritory === t.slug ? 1 : 0.4 }}
                >
                  {t.subtitle}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Territorios;
