import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10">
      <div className="container mx-auto max-w-2xl text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Recibe lo mejor de nuestros artesanos
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Suscríbete a nuestro boletín y descubre historias únicas, nuevas colecciones y ofertas exclusivas cada semana.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
            <Input
              type="email"
              placeholder="tu@email.com"
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
              {loading ? "Suscribiendo..." : "Suscribirse"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            Al suscribirte aceptas recibir emails promocionales. Puedes cancelar en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  );
};
