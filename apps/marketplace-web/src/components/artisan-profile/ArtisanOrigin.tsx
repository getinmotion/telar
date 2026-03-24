interface ArtisanOriginProps {
  location: string;
  description: string;
  onExploreRegion?: () => void;
}

export default function ArtisanOrigin({
  location,
  description,
  onExploreRegion,
}: ArtisanOriginProps) {
  return (
    <section className="bg-charcoal py-32 md:py-48 relative overflow-hidden">
      {/* Giant background text */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex items-center justify-center">
        <div className="text-[20rem] font-black text-white leading-none select-none">
          ORIGEN
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
        <p className="text-primary font-bold tracking-[0.6em] uppercase mb-8 text-[10px]">
          Ubicacion Geografica
        </p>
        <h3 className="font-serif text-6xl md:text-7xl text-editorial-bg mb-10 italic leading-tight">
          {location}
        </h3>
        <p className="text-xl text-slate-400 leading-[1.8] font-light mb-12 max-w-2xl mx-auto">
          {description}
        </p>
        {onExploreRegion && (
          <button
            onClick={onExploreRegion}
            className="group relative overflow-hidden border border-primary text-primary px-12 py-4 text-xs font-bold tracking-[0.3em] uppercase transition-all"
          >
            <span className="relative z-10 group-hover:text-white transition-colors">
              Explorar la Region
            </span>
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        )}
      </div>
    </section>
  );
}
