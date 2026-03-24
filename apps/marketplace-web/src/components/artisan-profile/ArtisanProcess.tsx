export interface ProcessStep {
  title: string;
  description: string;
  imageUrl?: string;
  phaseLabel?: string;
}

interface ArtisanProcessProps {
  steps: ProcessStep[];
}

export default function ArtisanProcess({ steps }: ArtisanProcessProps) {
  if (steps.length === 0) return null;

  // Stagger offset for each column
  const staggerClass = (index: number) => {
    if (index === 1) return "lg:mt-16";
    if (index === 2) return "lg:mt-32";
    return "";
  };

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 border-b border-slate-100 pb-8 gap-4">
          <h3 className="font-serif text-5xl md:text-6xl italic">
            Como se crea cada pieza
          </h3>
          <p className="text-slate-400 text-[10px] tracking-widest uppercase mb-1">
            El camino de la fibra
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-16 lg:gap-24">
          {steps.slice(0, 3).map((step, index) => (
            <div
              key={step.title}
              className={`relative group ${staggerClass(index)}`}
            >
              <span className="font-serif text-[8rem] font-bold text-primary/5 absolute -top-20 -left-4 group-hover:text-primary/10 transition-colors select-none">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-6 tracking-tight">
                  {step.title}
                </h4>
                <div className="aspect-video bg-slate-50 mb-6 overflow-hidden">
                  {step.imageUrl ? (
                    <img
                      src={step.imageUrl}
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm italic">
                      {step.phaseLabel || `Fase ${index + 1}`}
                    </div>
                  )}
                </div>
                <p className="text-slate-500 text-base leading-relaxed font-light">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
