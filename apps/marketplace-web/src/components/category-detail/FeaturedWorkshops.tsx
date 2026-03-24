import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

export interface Workshop {
  name: string;
  region: string;
  description: string;
  imageUrl?: string;
  slug?: string;
}

interface FeaturedWorkshopsProps {
  workshops: Workshop[];
}

export default function FeaturedWorkshops({ workshops }: FeaturedWorkshopsProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (workshops.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-6 mb-32">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="font-serif text-4xl mb-2 text-charcoal">
            Talleres Destacados
          </h2>
          <p className="text-charcoal/50 text-sm font-medium font-sans">
            Maestros del hilo y la tradicion artesanal.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => scroll("left")}
            className="border border-charcoal/10 p-2 rounded-full hover:bg-charcoal/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="border border-charcoal/10 p-2 rounded-full hover:bg-charcoal/5 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory"
      >
        {workshops.map((workshop) => (
          <div
            key={workshop.name}
            onClick={() => workshop.slug && navigate(`/tienda/${workshop.slug}`)}
            className="bg-white p-8 rounded-sm border border-primary/10 hover:shadow-xl transition-all cursor-pointer group min-w-[320px] flex-shrink-0 snap-start"
          >
            <div className="w-full aspect-square rounded-sm mb-8 overflow-hidden bg-[#e5e1d8]">
              {workshop.imageUrl ? (
                <img
                  src={workshop.imageUrl}
                  alt={workshop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#d1cdc3] to-transparent opacity-50" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-xl mb-1 font-sans text-charcoal">
              {workshop.name}
            </h3>
            <p className="text-primary text-[10px] uppercase tracking-widest mb-4 font-bold font-sans">
              {workshop.region}
            </p>
            <p className="text-sm text-charcoal/60 leading-relaxed font-sans">
              {workshop.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
