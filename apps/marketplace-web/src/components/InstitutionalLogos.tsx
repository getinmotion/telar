/**
 * InstitutionalLogos — lockup institucional en el orden oficial:
 * MinCulturas → Villa Adelaida → (en alianza) CoCrea.
 *
 * `variant="cream"` para fondos oscuros (footer), `"dark"` para fondos claros.
 */

import culturasLogo from "@/assets/culturas-logo.svg";
import culturasLogoCream from "@/assets/culturas-logo-cream.svg";
import villaAdelaidaLogo from "@/assets/cocrea-horizontal.svg";
import villaAdelaidaLogoCream from "@/assets/cocrea-footer-logo.svg";
import cocreaAliadoLogo from "@/assets/cocrea-aliado-logo.png";
import cocreaAliadoLogoCream from "@/assets/cocrea-aliado-logo-cream.png";

interface InstitutionalLogosProps {
  variant?: "dark" | "cream";
  /** Alto del logo de MinCulturas y Villa Adelaida (clases Tailwind). */
  size?: "sm" | "md" | "lg";
  className?: string;
}

// `lg` se achica en móvil: a tamaño fijo el lockup hacía muy alto el footer.
const SIZES = {
  sm: { main: "h-10 md:h-12", cocrea: "h-3.5 md:h-4" },
  md: { main: "h-14 md:h-16", cocrea: "h-4 md:h-5" },
  lg: { main: "h-16 md:h-24", cocrea: "h-5 md:h-7" },
} as const;

export const InstitutionalLogos = ({
  variant = "dark",
  size = "md",
  className = "",
}: InstitutionalLogosProps) => {
  const isCream = variant === "cream";
  const s = SIZES[size];

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-4 md:gap-8 ${className}`}
    >
      <img
        src={isCream ? culturasLogoCream : culturasLogo}
        alt="Ministerio de las Culturas, las Artes y los Saberes"
        className={`${s.main} w-auto object-contain`}
      />

      <span
        className={`hidden sm:block h-12 w-px ${isCream ? "bg-white/25" : "bg-charcoal/20"}`}
        aria-hidden
      />

      <img
        src={isCream ? villaAdelaidaLogoCream : villaAdelaidaLogo}
        alt="Villa Adelaida"
        className={`${s.main} w-auto object-contain`}
      />

      <div className="flex flex-col gap-1">
        <span
          className={`text-[9px] uppercase tracking-[0.2em] font-bold ${
            isCream ? "text-white/60" : "text-charcoal/50"
          }`}
        >
          Aliado
        </span>
        <img
          src={isCream ? cocreaAliadoLogoCream : cocreaAliadoLogo}
          alt="Corporación Colombia Crea Talento — CoCrea"
          className={`${s.cocrea} w-auto object-contain`}
        />
      </div>
    </div>
  );
};
