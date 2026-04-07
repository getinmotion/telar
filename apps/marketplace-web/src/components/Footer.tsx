import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import telarFooterLogo from "@/assets/telar-footer-logo.svg";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("¡Gracias por suscribirte!");
    setEmail("");
    setLoading(false);
  };

  return (
    <footer className="relative bg-[#1a1a1a] text-white pt-32 overflow-visible mt-40">
      {/* ── Floating Newsletter Module ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-6 z-10">
        <div className="bg-white text-[#1a1a1a] p-10 md:p-16 shadow-2xl rounded-xl flex flex-col lg:flex-row items-center justify-between gap-12 border border-stone-100">
          <div className="max-w-md">
            <h2 className="font-serif text-3xl md:text-4xl italic mb-4 leading-tight">
              Historias del mundo artesanal
            </h2>
            <p className="font-sans text-[#1a1a1a]/60 text-base">
              Crónicas de maestros artesanos y lanzamientos exclusivos.
            </p>
          </div>
          <div className="w-full max-w-md">
            <form onSubmit={handleSubscribe} className="flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/50 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full bg-transparent border-0 border-b border-[#1a1a1a]/20 py-2 px-0 text-sm focus:ring-0 focus:border-primary placeholder:text-[#1a1a1a]/30 transition-colors outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold uppercase tracking-[0.2em] text-[11px] py-4 rounded-full hover:bg-[#783200] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? "Suscribiendo..." : "Suscribirme Gratis"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── 6-Column Navigation ── */}
      <div className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-12 gap-y-16 mt-20 md:mt-0">
        <FooterNav title="Explorar">
          <FooterLink to="/productos">Todos los Productos</FooterLink>
          <FooterLink to="/productos">Categorías</FooterLink>
          <FooterLink to="/productos">Colecciones</FooterLink>
        </FooterNav>

        <FooterNav title="Telar">
          <FooterLink to="/sobre-telar">Sobre Telar</FooterLink>
          <FooterLink to="/historias">Historias</FooterLink>
          <FooterLink to="/talleres">Talleres</FooterLink>
          <FooterLink to="/trazabilidad">Trazabilidad</FooterLink>
        </FooterNav>

        <FooterNav title="Descubrir">
          <FooterLink to="/tiendas">Artesanos</FooterLink>
          <FooterLink to="/productos">Técnicas</FooterLink>
          <FooterLink to="/productos">Territorios</FooterLink>
        </FooterNav>

        <FooterNav title="Ayuda">
          <FooterLink to="/ayuda/como-comprar">Cómo comprar</FooterLink>
          <FooterLink to="/ayuda">Centro de ayuda</FooterLink>
          <FooterLink to="/ayuda/contacto">Contacto</FooterLink>
          <FooterLink to="/ayuda/envios">Envíos</FooterLink>
          <FooterLink to="/ayuda/devoluciones">Devoluciones</FooterLink>
        </FooterNav>

        <FooterNav title="Legal">
          <FooterLink to="/legal/terminos-y-condiciones">Términos y condiciones</FooterLink>
          <FooterLink to="/legal/politica-de-privacidad">Privacidad</FooterLink>
          <FooterLink to="/legal/politica-de-cookies">Cookies</FooterLink>
          <FooterLink to="/legal/politica-de-garantias">Garantías</FooterLink>
        </FooterNav>

        <FooterNav title="Cuenta">
          <FooterLink to="/profile">Mi cuenta</FooterLink>
          <FooterLink to="/wishlist">Favoritos</FooterLink>
          <FooterLink to="/">Pedidos</FooterLink>
        </FooterNav>
      </div>

      {/* ── Brand Identity Section ── */}
      <div className="max-w-7xl mx-auto px-8 pb-16 pt-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="max-w-2xl">
            <div className="mb-10">
              <img
                src={telarFooterLogo}
                alt="TELAR"
                className="h-16 w-auto"
              />
            </div>
            <p className="font-serif text-4xl md:text-5xl italic text-white leading-tight">
              Historias hechas a mano que conectan oficio, territorio y personas.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">
            <span>Colombia</span>
          </div>
        </div>
      </div>

      {/* ── Copyright ── */}
      <div className="max-w-7xl mx-auto px-8 py-10 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-col gap-2 text-white/30 text-[9px] font-bold tracking-[0.2em] uppercase">
            <p>Artesanías hechas con amor en Latinoamérica</p>
            <p>telar está orgullosamente desarrollado en Colombia</p>
          </div>
          <div className="text-white/20 text-[9px] font-bold tracking-[0.2em] uppercase">
            <p>&copy; {new Date().getFullYear()} TELAR. TODOS LOS DERECHOS RESERVADOS.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ── Sub-components ──────────────────────────────────

function FooterNav({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <nav className="flex flex-col gap-8">
      <h3 className="font-serif text-xs font-bold uppercase tracking-[0.4em] text-primary">
        {title}
      </h3>
      <ul className="flex flex-col gap-4">{children}</ul>
    </nav>
  );
}

function FooterLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        to={to}
        className="text-white/60 text-xs tracking-wide hover:text-primary transition-colors duration-300"
      >
        {children}
      </Link>
    </li>
  );
}
