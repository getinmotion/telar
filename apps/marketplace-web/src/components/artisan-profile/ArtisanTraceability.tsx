import { QrCode, ShieldCheck } from "lucide-react";

interface ArtisanTraceabilityProps {
  artisanName: string;
  location: string;
  registryId?: string;
  certId?: string;
}

export default function ArtisanTraceability({
  artisanName,
  location,
  registryId,
  certId,
}: ArtisanTraceabilityProps) {
  return (
    <section className="py-24 md:py-32 px-8 bg-editorial-bg border-y border-charcoal/5">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-12 items-center gap-12 lg:gap-24">
          {/* Left: text */}
          <div className="col-span-12 lg:col-span-7">
            <div className="inline-flex items-center gap-4 mb-8">
              <span className="w-10 h-[1px] bg-primary" />
              <span className="text-primary text-[9px] font-extrabold tracking-[0.4em] uppercase">
                Certificacion de Autoria Digital
              </span>
            </div>
            <h3
              className="font-serif text-6xl md:text-7xl mb-8 leading-[1]"
              style={{ letterSpacing: "-0.04em" }}
            >
              Huella Digital del Artesano
            </h3>
            <div className="space-y-6 text-xl leading-relaxed text-slate-600 font-light max-w-2xl">
              <p>
                Cada pieza es una obra de autor unica. Nuestro sistema de
                trazabilidad garantiza que el legado de{" "}
                <span className="text-charcoal font-bold underline decoration-primary/30 underline-offset-8">
                  {artisanName}
                </span>{" "}
                se preserve intacto desde su telar hasta su hogar.
              </p>
              <p>
                A traves de tecnologia de registro seguro, aseguramos la
                autenticidad y el reconocimiento directo al maestro artesano por
                su inestimable propiedad intelectual y cultural.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-6">
              <div className="p-3 bg-white shadow-lg">
                <QrCode className="w-12 h-12 text-charcoal" />
              </div>
              <div>
                <p className="text-[9px] tracking-[0.3em] uppercase font-bold text-charcoal mb-1">
                  Verificacion Inmediata
                </p>
                <p className="text-xs text-slate-400">
                  Escanee la etiqueta de su pieza para
                  <br />
                  acceder al registro historico.
                </p>
              </div>
            </div>
          </div>

          {/* Right: certificate card */}
          <div className="col-span-12 lg:col-span-5 flex justify-end">
            <div className="w-full max-w-md bg-white p-12 shadow-2xl relative overflow-hidden border border-slate-50">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />

              <div className="flex justify-center mb-10">
                <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center p-2">
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>

              <div className="text-center mb-12">
                <p className="font-serif text-3xl mb-3 italic text-charcoal">
                  {registryId || "Registro No. ----"}
                </p>
                <p className="text-[9px] tracking-[0.4em] uppercase text-slate-400 font-bold">
                  Certificado de Autenticidad TELAR
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-50 pt-8">
                <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                  <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
                    Maestro Artesano
                  </span>
                  <span className="font-bold text-xs tracking-widest uppercase">
                    {artisanName}
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                  <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
                    Ubicacion Origen
                  </span>
                  <span className="font-bold text-xs tracking-widest uppercase">
                    {location}
                  </span>
                </div>
                {certId && (
                  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                    <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
                      Identificador
                    </span>
                    <span className="font-bold text-xs tracking-widest uppercase">
                      {certId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
