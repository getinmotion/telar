/**
 * AllianceSeal — identificador de los productos que hacen parte del
 * Programa de fortalecimiento comercial – Villa Adelaida.
 *
 * Este despliegue filtra su catálogo por `VITE_AGREEMENT_ID`, así que todo lo
 * que la API devuelve pertenece al convenio: el sello se muestra cuando hay un
 * convenio configurado y se oculta en despliegues sin filtro (dev / catálogo
 * completo), donde marcarlo todo sería falso.
 */

import { AGREEMENT_ID } from "@/lib/agreement";
import villaAdelaidaLogo from "@/assets/cocrea-horizontal.svg";

export const IS_ALLIANCE_DEPLOYMENT = Boolean(AGREEMENT_ID);

export const AllianceSeal = ({ className = "" }: { className?: string }) => {
  if (!IS_ALLIANCE_DEPLOYMENT) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-charcoal/10 px-2 py-1 ${className}`}
      title="Producto del Programa de fortalecimiento comercial – Villa Adelaida"
    >
      <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-charcoal/60 leading-none">
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
