/**
 * InstitutionalBand — banda superior del micrositio.
 *
 * Lleva los logos institucionales y la salida al catálogo completo de Telar.
 * La renderiza el Layout, así que aparece en todas las páginas de cocrea y no
 * solo en la home.
 */

import { ArrowLeft } from "lucide-react";
import { InstitutionalLogos } from "@/components/InstitutionalLogos";
import { TELAR_MARKETPLACE_URL } from "@/lib/villaAdelaida";

export const InstitutionalBand = () => (
  <div className="border-b border-charcoal/10 bg-white/60">
    <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-center md:justify-between">
      <InstitutionalLogos size="sm" />
      <a
        href={TELAR_MARKETPLACE_URL}
        className="inline-flex items-center gap-2 shrink-0 border border-charcoal/25 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal hover:text-cream hover:border-charcoal transition-all"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a Telar
      </a>
    </div>
  </div>
);
