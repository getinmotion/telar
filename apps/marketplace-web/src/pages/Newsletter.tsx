import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

const Newsletter = () => {
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
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Suscríbete</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center py-20">
          <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] font-sans block mb-8">
            Newsletter
          </span>
          <h1 className="text-5xl md:text-8xl leading-[0.9] font-serif mb-10 text-charcoal tracking-tight italic">
            Historias del mundo artesanal
          </h1>
          <p className="text-lg md:text-xl text-charcoal/50 max-w-2xl mx-auto leading-relaxed font-sans mb-16">
            Crónicas de maestros artesanos, lanzamientos exclusivos y el pulso
            del oficio manual colombiano. Directo a tu correo, sin ruido.
          </p>

          {/* Subscribe form */}
          <div className="max-w-lg mx-auto">
            <form onSubmit={handleSubscribe} className="flex flex-col gap-8">
              <div className="text-left">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-3 font-sans">
                  Tu correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full bg-transparent border-0 border-b-2 border-charcoal/10 py-4 px-0 text-lg focus:ring-0 focus:border-primary placeholder:text-charcoal/20 transition-colors outline-none font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold uppercase tracking-[0.2em] text-[11px] py-5 rounded-full hover:bg-[#783200] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 font-sans"
              >
                {loading ? "Suscribiendo..." : "Suscribirme Gratis"}
              </button>
              <p className="text-[10px] text-charcoal/30 uppercase tracking-widest font-sans">
                Sin spam. Cancela cuando quieras.
              </p>
            </form>
          </div>
        </div>

        {/* What you'll get */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 pt-16 border-t border-charcoal/5">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary font-sans block mb-4">
              01
            </span>
            <h3 className="font-serif text-xl italic mb-3">
              Historias de origen
            </h3>
            <p className="text-sm text-charcoal/50 font-sans leading-relaxed">
              Crónicas desde los talleres: quién hace la pieza, dónde, y por
              qué importa.
            </p>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary font-sans block mb-4">
              02
            </span>
            <h3 className="font-serif text-xl italic mb-3">
              Acceso anticipado
            </h3>
            <p className="text-sm text-charcoal/50 font-sans leading-relaxed">
              Sé el primero en descubrir nuevas colecciones y ediciones
              limitadas antes que nadie.
            </p>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary font-sans block mb-4">
              03
            </span>
            <h3 className="font-serif text-xl italic mb-3">
              Guías de cuidado
            </h3>
            <p className="text-sm text-charcoal/50 font-sans leading-relaxed">
              Aprende a mantener y valorar tus piezas artesanales con consejos
              de los propios artesanos.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Newsletter;
