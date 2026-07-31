/**
 * AlianzaVillaAdelaida — sección del Programa de fortalecimiento comercial
 * Villa Adelaida dentro de telar.co. Ruta: /alianza-villa-adelaida
 *
 * Encabeza un banner al micrositio, que es el despliegue del marketplace con
 * el catálogo ya filtrado por el convenio.
 */

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import villaAdelaidaLogo from "@/assets/villa-adelaida-cream.svg";
import {
  VILLA_ADELAIDA_MICROSITIO_URL,
} from "@/lib/villaAdelaida";

const COMO_LO_HACE = [
  "Programación de conversatorios, laboratorios y actividades relacionadas con diseño e innovación.",
  "Estrategias de comercialización de productos y servicios asociados a procesos y emprendimientos.",
  "Actividades descentralizadas en los territorios, orientadas al encuentro entre los saberes propios y el diseño contemporáneo.",
  "Becas y residencias dentro del Sistema Nacional de Convocatorias.",
  "Búsqueda y consolidación de alianzas estratégicas con actores públicos, privados y académicos para el desarrollo conjunto de proyectos.",
];

const TERRITORIOS = [
  "Barichara",
  "Buenaventura",
  "Cali",
  "Mompox",
  "Popayán",
];

const AlianzaVillaAdelaida = () => {
  return (
    <>
      <Helmet>
        <title>Alianza Villa Adelaida — TELAR</title>
        <meta
          name="description"
          content="Programa de fortalecimiento comercial Villa Adelaida: artesanos, productores y unidades productivas vinculadas a las Escuelas Taller de Colombia."
        />
      </Helmet>

      <div className="min-h-screen bg-[#f9f7f2] text-[#2c2c2c] font-sans">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <nav className="flex text-[10px] uppercase tracking-widest text-[#2c2c2c]/50 gap-2">
            <Link to="/" className="hover:text-[#ec6d13] transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-[#ec6d13] font-bold">
              Alianza Villa Adelaida
            </span>
          </nav>
        </div>

        {/* ═══════════ BANNER AL MICROSITIO ═══════════ */}
        <section className="max-w-[1400px] mx-auto px-6 mb-16">
          <a
            href={VILLA_ADELAIDA_MICROSITIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-sm overflow-hidden"
            style={{ backgroundColor: "#27423F" }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-8 md:px-12 py-10">
              <div className="flex items-center gap-8">
                <img
                  src={villaAdelaidaLogo}
                  alt="Villa Adelaida"
                  className="h-16 w-auto object-contain shrink-0"
                />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/60 mb-2">
                    Micrositio
                  </p>
                  <h2 className="text-2xl md:text-3xl font-serif text-white leading-tight">
                    Ir al micrositio Villa Adelaida
                  </h2>
                  <p className="text-sm text-white/70 mt-2 max-w-lg">
                    Explora el catálogo completo de los talleres y productores
                    del programa, con su propia navegación.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 shrink-0 bg-white text-[#27423F] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] group-hover:bg-white/90 transition-colors">
                Entrar
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </a>
        </section>

        {/* ═══════════ QUÉ ES ═══════════ */}
        <section className="max-w-[1400px] mx-auto px-6 mb-20">
          <div className="max-w-4xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#ec6d13]">
              Alianza
            </span>
            <h1 className="text-5xl md:text-6xl font-serif leading-tight mt-6 mb-8">
              Villa Adelaida
              <br />
              <span className="italic">Centro Nacional de Diseño e Innovación</span>
            </h1>
            <p className="text-lg text-[#2c2c2c]/70 leading-relaxed">
              Ubicada en una casa patrimonial en el distrito financiero y
              gastronómico de Bogotá, es una plataforma nacional que conecta y
              fortalece el ecosistema del diseño impulsando capacidades,
              promoviendo la innovación y generando valor cultural, social y
              económico.
            </p>
          </div>
        </section>

        {/* ═══════════ CÓMO LO HACE ═══════════ */}
        <section className="max-w-[1400px] mx-auto px-6 mb-20">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#2c2c2c]/40 mb-10">
            ¿Cómo lo hace?
          </h2>
          <ul className="grid md:grid-cols-2 gap-x-16 gap-y-6 max-w-5xl">
            {COMO_LO_HACE.map((item, i) => (
              <li key={i} className="flex gap-5">
                <span className="font-serif italic text-2xl text-[#ec6d13] leading-none pt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-[#2c2c2c]/70 leading-relaxed">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ═══════════ EL PROGRAMA ═══════════ */}
        <section className="py-20 bg-white border-y border-[#2c2c2c]/10">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="max-w-4xl space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#ec6d13]">
                Programa de fortalecimiento comercial
              </span>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                Programa de fortalecimiento
                <br />
                <span className="italic">comercial – Villa Adelaida</span>
              </h2>
              <p className="text-base text-[#2c2c2c]/70 leading-relaxed">
                En el marco del proyecto de Villa Adelaida, y como parte de su
                consolidación como una plataforma de articulación para el
                fortalecimiento de las economías culturales y creativas, se
                diseñó e implementó el programa de fortalecimiento comercial
                dirigido a artesanos, productores y unidades productivas
                vinculadas a las Escuelas Taller de Colombia.
              </p>
              <p className="text-base text-[#2c2c2c]/70 leading-relaxed">
                Esta iniciativa incorpora herramientas digitales, estrategias de
                comercialización y procesos de diagnóstico orientados a
                fortalecer las capacidades comerciales de los participantes,
                mejorar el acceso a nuevos mercados y promover la sostenibilidad
                de sus iniciativas productivas.
              </p>
              <p className="text-base text-[#2c2c2c]/70 leading-relaxed">
                En esta iniciativa también participaron el Programa de Escuelas
                Taller de la Dirección de Estrategia, Desarrollo y
                Emprendimiento y el Grupo de Patrimonio Cultural Inmaterial del
                Ministerio de las Culturas, las Artes y los Saberes.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════ TERRITORIOS ═══════════ */}
        <section className="max-w-[1400px] mx-auto px-6 py-20">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#2c2c2c]/40 mb-10">
            Territorios impactados
          </h2>
          <div className="flex flex-wrap gap-4">
            {TERRITORIOS.map((t) => (
              <span
                key={t}
                className="border border-[#2c2c2c]/15 px-6 py-3 text-sm font-serif"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ═══════════ CIERRE ═══════════ */}
        <section className="max-w-[1400px] mx-auto px-6 pb-24">
          <div
            className="rounded-sm px-8 md:px-16 py-16 text-center text-white"
            style={{ backgroundColor: "#27423F" }}
          >
            <h2 className="text-3xl md:text-4xl font-serif leading-tight mb-6">
              Explora las piezas
              <br />
              <span className="italic">del programa</span>
            </h2>
            <p className="text-base text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Los productos elaborados por artesanos, artesanas, productores y
              unidades productivas del programa están identificados con el sello
              de Villa Adelaida en todo el catálogo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={VILLA_ADELAIDA_MICROSITIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#27423F] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-colors"
              >
                Ir al micrositio
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <Link
                to="/productos"
                className="inline-flex items-center justify-center bg-white/10 border border-white/30 text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/20 transition-colors"
              >
                Ver todo el catálogo
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AlianzaVillaAdelaida;
