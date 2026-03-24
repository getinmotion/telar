import { Handshake } from "lucide-react";

interface ArtisanFairTradeProps {
  location?: string;
}

export default function ArtisanFairTrade({ location }: ArtisanFairTradeProps) {
  return (
    <section className="py-24 md:py-32 bg-editorial-bg border-t border-charcoal/5">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-10">
          <Handshake className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-5xl md:text-6xl mb-8 italic">
          Compromiso Etico y Comercio Justo
        </h3>
        <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed mb-12">
          Creemos en un modelo donde el valor se distribuye equitativamente. Cada
          compra apoya directamente la economia de las familias artesanas
          {location ? ` de ${location}` : ""}.
        </p>
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            100% Hecho a Mano
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Pago Justo Directo
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Impacto Sostenible
          </span>
        </div>
      </div>
    </section>
  );
}
