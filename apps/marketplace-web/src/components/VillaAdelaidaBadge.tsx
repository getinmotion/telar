/**
 * VillaAdelaidaBadge — identifica los productos del convenio Villa Adelaida
 * dentro del catálogo general de telar.co.
 */

import { isVillaAdelaidaProduct } from "@/lib/villaAdelaida";
import villaAdelaidaLogo from "@/assets/villa-adelaida-horizontal.svg";

export const VillaAdelaidaBadge = ({
  product,
  className = "",
}: {
  product: unknown;
  className?: string;
}) => {
  if (!isVillaAdelaidaProduct(product)) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-black/10 px-2 py-1 shadow-sm ${className}`}
      title="Producto del Programa de fortalecimiento comercial – Villa Adelaida"
    >
      <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-black/60 leading-none">
        En alianza
        <br />
        con
      </span>
      <img
        src={villaAdelaidaLogo}
        alt="Villa Adelaida"
        className="h-6 w-auto object-contain"
      />
    </div>
  );
};
