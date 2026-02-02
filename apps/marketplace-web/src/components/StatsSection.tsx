import { useEffect, useRef, useState } from "react";
import { Sparkles, Users, MapPin, Star, LucideIcon } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
}

const STATS: StatItem[] = [
  { 
    value: "1000+", 
    label: "Artesanías Únicas", 
    icon: Sparkles,
    iconColor: "text-primary"
  },
  { 
    value: "500+", 
    label: "Artesanos", 
    icon: Users,
    iconColor: "text-secondary"
  },
  { 
    value: "32", 
    label: "Departamentos", 
    icon: MapPin,
    iconColor: "text-primary"
  },
  { 
    value: "98%", 
    label: "Satisfacción", 
    icon: Star,
    iconColor: "text-yellow-500"
  }
];

export const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <div
                key={index}
                className={`text-center space-y-3 transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
                    <IconComponent 
                      className={`h-6 w-6 ${stat.iconColor}`}
                      strokeWidth={2}
                    />
                  </div>
                </div>
                
                <div className="text-4xl font-extrabold text-foreground">
                  {stat.value}
                </div>
                
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
