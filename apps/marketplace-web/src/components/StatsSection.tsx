import { useEffect, useRef, useState } from "react";
import { Sparkles, Users, MapPin, Star, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/hooks/useStats";
import { StatItem } from "@/types/storyblok";

// Icon mapping - supports both English and Spanish names
const ICON_MAP: Record<string, LucideIcon> = {
  // English
  sparkles: Sparkles,
  users: Users,
  'map-pin': MapPin,
  star: Star,
  // Spanish
  estrella: Star,
  personas: Users,
  localizacion: MapPin,
  ubicacion: MapPin,
  usuarios: Users,
  brillos: Sparkles,
};

// Fallback stats when CMS content is not available
const FALLBACK_STATS = [
  { value: "1000+", label: "Artesanías Únicas", icon: "sparkles", iconColor: "text-primary" },
  { value: "200", label: "Artesanos", icon: "users", iconColor: "text-secondary" },
  { value: "32", label: "Departamentos", icon: "map-pin", iconColor: "text-primary" },
  { value: "98%", label: "Satisfacción", icon: "star", iconColor: "text-yellow-500" }
];

export const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { data: cmsStats, isLoading } = useStats();

  // Transform CMS stats or use fallback
  const stats = cmsStats && cmsStats.length > 0
    ? cmsStats.map((stat: StatItem) => ({
        value: stat.value,
        label: stat.label,
        icon: stat.icon || 'sparkles',
        iconColor: stat.icon_color || 'text-primary'
      }))
    : FALLBACK_STATS;

  useEffect(() => {
    if (isLoading || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [isLoading]);

  return (
    <section ref={sectionRef} className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-3">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-10 w-20 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))
          ) : (
            stats.map((stat, index) => {
              const IconComponent = ICON_MAP[stat.icon] || Sparkles;
              
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
            })
          )}
        </div>
      </div>
    </section>
  );
};
