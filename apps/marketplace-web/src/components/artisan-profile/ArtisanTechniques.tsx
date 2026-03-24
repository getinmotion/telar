import { ArrowUpRight } from "lucide-react";

export interface Technique {
  name: string;
  description: string;
  imageUrl?: string;
}

interface ArtisanTechniquesProps {
  techniques: Technique[];
}

export default function ArtisanTechniques({ techniques }: ArtisanTechniquesProps) {
  if (techniques.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-8 bg-editorial-bg">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-16">
          <p className="text-primary font-bold tracking-[0.4em] uppercase mb-4 text-[10px]">
            Saber-hacer
          </p>
          <h3 className="font-serif text-6xl md:text-7xl mb-6 leading-none">
            Tecnica Artesanal
          </h3>
        </div>

        <div className="grid grid-cols-12 gap-8 lg:gap-16">
          {techniques.slice(0, 2).map((tech, index) => (
            <div
              key={tech.name}
              className={
                index === 0
                  ? "col-span-12 lg:col-span-5"
                  : "col-span-12 lg:col-span-5 lg:col-start-8 lg:mt-32"
              }
            >
              <div className="aspect-[16/10] bg-slate-200 mb-8 overflow-hidden">
                {tech.imageUrl ? (
                  <img
                    src={tech.imageUrl}
                    alt={tech.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-sm">
                    {tech.name}
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between border-t border-charcoal/10 pt-6">
                <div>
                  <h4 className="font-serif text-3xl mb-4">{tech.name}</h4>
                  <p className="text-slate-600 text-base leading-relaxed font-light max-w-sm">
                    {tech.description}
                  </p>
                </div>
                <ArrowUpRight className="w-7 h-7 text-primary flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
