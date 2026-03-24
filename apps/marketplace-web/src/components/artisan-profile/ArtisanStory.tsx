interface ArtisanStoryProps {
  artisanName: string;
  story: string;
  quote?: string;
  imageUrl?: string;
  traditionLabel?: string;
  traditionText?: string;
}

export default function ArtisanStory({
  artisanName,
  story,
  quote,
  imageUrl,
  traditionLabel = "Tradicion Viva",
  traditionText = "Tres generaciones de maestros tejedores.",
}: ArtisanStoryProps) {
  // Split story into paragraphs
  const paragraphs = story.split("\n").filter((p) => p.trim());

  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-12 gap-12 lg:gap-24 items-start">
          {/* Vertical label */}
          <div className="col-span-12 lg:col-span-1 hidden lg:block">
            <span
              className="font-serif text-6xl text-primary/10 select-none"
              style={{ writingMode: "vertical-rl" }}
            >
              HISTORIA
            </span>
          </div>

          {/* Text content */}
          <div className="col-span-12 lg:col-span-6">
            <h2 className="font-serif text-5xl md:text-6xl mb-10 italic leading-tight">
              La historia del taller
            </h2>
            <div className="space-y-8 text-xl leading-[1.6] text-slate-800 font-light">
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{
                    __html: p.replace(
                      artisanName,
                      `<span class="font-bold text-charcoal">${artisanName}</span>`
                    ),
                  }} />
                ))
              ) : (
                <p>
                  La historia de{" "}
                  <span className="font-bold text-charcoal">{artisanName}</span>{" "}
                  es una historia de tradicion y dedicacion artesanal.
                </p>
              )}

              {quote && (
                <p className="italic font-serif text-3xl md:text-4xl text-primary py-8 border-y border-primary/20 leading-snug">
                  "{quote}"
                </p>
              )}
            </div>
          </div>

          {/* Image with overlay card */}
          <div className="col-span-12 lg:col-span-5 pt-12 lg:pt-24">
            <div className="aspect-[4/5] bg-slate-100 relative max-w-sm mx-auto lg:ml-auto overflow-visible">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`Vida en el taller de ${artisanName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 italic text-sm">
                  Vida en el Taller
                </div>
              )}
              <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-charcoal text-white p-8 flex flex-col justify-center">
                <p className="text-[9px] tracking-[0.3em] uppercase mb-4 text-primary font-bold">
                  {traditionLabel}
                </p>
                <p className="font-serif text-xl italic">{traditionText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
