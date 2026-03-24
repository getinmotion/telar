interface ArtisanHeroProps {
  name: string;
  location: string;
  technique: string;
  tagline?: string;
  profileNumber?: string;
  imageUrl?: string;
}

export default function ArtisanHero({
  name,
  location,
  technique,
  tagline,
  profileNumber,
  imageUrl,
}: ArtisanHeroProps) {
  // Split name into lines for editorial display
  const nameParts = name.split(" ");
  const firstLine = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(" ");
  const secondLine = nameParts.slice(Math.ceil(nameParts.length / 2)).join(" ");

  // Extract region label from location
  const locationParts = location.split(",").map((s) => s.trim());
  const regionLabel = locationParts.length > 1
    ? `Maestros del ${locationParts[1]} / ${locationParts[0]}`
    : location;

  return (
    <section className="relative min-h-[70vh] flex flex-col justify-end pb-16 pt-12 md:pt-0">
      {/* Background image */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-slate-200/40 z-0 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-serif italic text-xl">
            Retrato del Taller
          </div>
        )}
      </div>

      <div className="max-w-[1440px] mx-auto px-8 w-full relative z-10">
        {/* Name */}
        <div className="grid grid-cols-12 gap-0">
          <div className="col-span-12 lg:col-span-9">
            <p className="text-primary font-extrabold tracking-[0.5em] uppercase mb-6 text-[11px]">
              {regionLabel}
            </p>
            <h1
              className="font-serif italic font-bold leading-[0.85] text-charcoal mb-8"
              style={{ fontSize: "clamp(3.5rem, 12vw, 12rem)", letterSpacing: "-0.04em" }}
            >
              {firstLine}
              {secondLine && (
                <>
                  <br />
                  {secondLine}
                </>
              )}
            </h1>
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 lg:col-span-4 border-l-2 border-primary pl-8 py-1">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 mb-1">
                  Ubicacion
                </p>
                <p className="font-bold text-base">{location}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 mb-1">
                  Tecnica Principal
                </p>
                <p className="font-bold text-base">{technique}</p>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8 flex justify-end">
            <div className="max-w-md text-right">
              {profileNumber && (
                <p className="text-[10px] tracking-widest uppercase font-bold text-charcoal/40 mb-2">
                  Perfil del Artesano {profileNumber}
                </p>
              )}
              {tagline && (
                <p className="text-lg leading-relaxed text-slate-600 font-light italic">
                  {tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
