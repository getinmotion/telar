import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

export const Footer = ({ showNewsletter = false }: { showNewsletter?: boolean }) => {
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
    <footer className={`relative bg-forest text-white overflow-visible `}>
      {/* ── Floating Newsletter Module (only on Historias & Sobre Telar) ── */}
      {/* {showNewsletter && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-6 z-10">
          <div className="bg-white text-forest p-10 md:p-16 shadow-2xl rounded-md flex flex-col lg:flex-row items-center justify-between gap-12 border border-stone-100">
            <div className="max-w-md">
              <h2 className="font-serif text-3xl md:text-4xl mb-4 leading-tight">
                Historias del mundo artesanal
              </h2>
              <p className="font-sans text-forest/70 text-base">
                Crónicas de maestros artesanos y lanzamientos exclusivos.
              </p>
            </div>
            <div className="w-full max-w-md">
              <form onSubmit={handleSubscribe} className="flex flex-col gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-forest/60 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="w-full bg-transparent border-0 border-b border-forest/25 py-2 px-0 text-sm focus:ring-0 focus:border-primary placeholder:text-forest/40 transition-colors outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold uppercase tracking-[0.2em] text-[11px] py-4 rounded-sm hover:bg-forest transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? "Suscribiendo..." : "Suscribirme Gratis"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )} */}

      {/* ── Navegación ── */}
      <div className={`max-w-7xl mx-auto px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-8 ${showNewsletter ? "mt-10 md:mt-0" : ""}`}>
        <FooterNav title="Explorar">
          <FooterLink to="/productos">Todos los Productos</FooterLink>
          <FooterLink to="/categorias">Categorías</FooterLink>
        </FooterNav>

        <FooterNav title="Villa Adelaida">
          <FooterLink to="/sobre-villa-adelaida">Alianza Villa Adelaida</FooterLink>
          <FooterLink to="/tiendas">Talleres</FooterLink>
        </FooterNav>

        <FooterNav title="Legal">
          <FooterLink to="/legal/terminos-y-condiciones">Términos y condiciones</FooterLink>
          <FooterLink to="/legal/politica-de-privacidad">Privacidad</FooterLink>
          <FooterLink to="/legal/politica-de-cookies">Cookies</FooterLink>
          <FooterLink to="/legal/politica-de-garantias">Garantías</FooterLink>
        </FooterNav>

        {/* Sin "Pedidos": no hay ruta de pedidos, el link caía en la home */}
        <FooterNav title="Cuenta">
          <FooterLink to="/profile">Mi cuenta</FooterLink>
          <FooterLink to="/wishlist">Favoritos</FooterLink>
        </FooterNav>
      </div>

      {/* ── Cierre institucional ──
          Sin repetir el lockup de logos: ya va en la banda superior, que el
          Layout renderiza en todas las páginas. Aquí basta el texto. */}
      <div className="max-w-7xl mx-auto px-8 py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex flex-col gap-2 text-white/65 text-[9px] font-bold tracking-[0.2em] uppercase">
            <p>Programa de fortalecimiento comercial – Villa Adelaida</p>
            <p>Ministerio de las Culturas, las Artes y los Saberes</p>
          </div>
          <div className="flex flex-col gap-2 text-white/55 text-[9px] font-bold tracking-[0.2em] uppercase md:text-right">
            <p>&copy; {new Date().getFullYear()} Villa Adelaida. TODOS LOS DERECHOS RESERVADOS.</p>
            <p className="text-white/75 tracking-[0.3em]">Colombia</p>
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
    <nav className="flex flex-col gap-4">
      <h3 className="font-serif text-xs font-bold uppercase tracking-[0.4em] text-sage">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">{children}</ul>
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
        className="text-white/80 text-xs tracking-wide hover:text-sage transition-colors duration-300"
      >
        {children}
      </Link>
    </li>
  );
}
