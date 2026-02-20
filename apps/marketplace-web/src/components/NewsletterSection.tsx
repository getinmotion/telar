import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNewsletterContent } from "@/hooks/useNewsletterContent";
import { getStoryblokImageUrl } from "@/types/storyblok";

// Fallback content when CMS is not available
const FALLBACK_CONTENT = {
  title: "Recibe lo mejor de nuestros artesanos",
  description: "Suscríbete a nuestro boletín y descubre historias únicas, nuevas colecciones y ofertas exclusivas cada semana.",
  placeholder: "tu@email.com",
  button_text: "Suscribirse",
  disclaimer: "Al suscribirte aceptas recibir emails promocionales. Puedes cancelar en cualquier momento.",
  icon: null,
  subtitle: null
};

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { data: cmsContent, isLoading: cmsLoading } = useNewsletterContent();

  const content = cmsContent || FALLBACK_CONTENT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate subscription
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("¡Gracias por suscribirte!");
    setEmail("");
    setLoading(false);
  };

  if (cmsLoading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="space-y-6">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-12 w-96 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
            <div className="flex gap-3 max-w-md mx-auto pt-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-32" />
            </div>
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  const iconUrl = content.icon ? getStoryblokImageUrl(content.icon) : null;

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10">
      <div className="container mx-auto max-w-2xl text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            {iconUrl ? (
              <img 
                src={iconUrl} 
                alt="Newsletter" 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <Mail className="w-8 h-8 text-primary" />
            )}
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            {content.title}
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {content.description}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
            <Input
              type="email"
              placeholder={content.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base flex-1 bg-background"
              required
            />
            <Button 
              type="submit" 
              size="lg" 
              className="h-12 px-8 whitespace-nowrap"
              disabled={loading}
            >
              {loading ? "Suscribiendo..." : content.button_text}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            {content.disclaimer}
          </p>

          {content.subtitle && (
            <p className="text-sm text-muted-foreground mt-4">
              {content.subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
