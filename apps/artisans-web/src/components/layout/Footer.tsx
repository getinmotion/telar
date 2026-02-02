import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
  Shield,
  Truck,
  CreditCard,
  Award,
  Recycle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PoweredByGetInMotion } from '@/components/PoweredByGetInMotion';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter subscription logic here
  };

  return (
    <footer className="bg-background border-t">
      {/* Trust Banner */}
      <div className="bg-primary/5 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-primary" />
              <span>Envío gratis +$150.000</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>Compra 100% segura</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Pago contra entrega</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-primary" />
              <span>Hecho con amor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <h3 className="text-xl font-bold">Artesanos</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Conectamos artesanos colombianos con el mundo, preservando tradiciones 
              y promoviendo el comercio justo de productos hechos a mano.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="hover-glow">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover-glow">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover-glow">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover-glow">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Enlaces Rápidos</h4>
            <div className="space-y-2">
              {[
                { label: 'Explorar Productos', path: '/productos' },
                { label: 'Directorio de Tiendas', path: '/tienda' },
                { label: 'Crear Tienda', path: '/crear-tienda' },
                { label: 'Sobre Nosotros', path: '/about' },
                { label: 'Contacto', path: '/contact' },
                { label: 'Blog', path: '/blog' },
              ].map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors story-link"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold">Atención al Cliente</h4>
            <div className="space-y-2">
              {[
                { label: 'Centro de Ayuda', path: '/help' },
                { label: 'Términos y Condiciones', path: '/terminos' },
                { label: 'Política de Privacidad', path: '/privacidad' },
                { label: 'Política de Publicidad', path: '/publicidad' },
              ].map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors story-link"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>+57 (1) 234-5678</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>hola@artesanos.co</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Bogotá, Colombia</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold">Mantente Conectado</h4>
            <p className="text-sm text-muted-foreground">
              Recibe las últimas novedades, productos destacados y ofertas especiales.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Tu email"
                className="w-full"
                required
              />
              <Button type="submit" className="w-full">
                Suscribirse
              </Button>
            </form>

            {/* Certifications */}
            <div className="space-y-3 pt-4">
              <h5 className="text-sm font-medium">Certificaciones</h5>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Comercio Justo
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Recycle className="h-3 w-3 mr-1" />
                  Eco-Friendly
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  SSL Seguro
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} TELAR. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <button onClick={() => navigate('/privacidad')} className="hover:text-primary transition-colors">
                Política de Privacidad
              </button>
              <button onClick={() => navigate('/terminos')} className="hover:text-primary transition-colors">
                Términos de Servicio
              </button>
            </div>
          </div>

          {/* Payment Methods and Powered By */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Aceptamos:</span>
              <div className="flex gap-1">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  💳
                </div>
                <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  💳
                </div>
                <div className="w-8 h-5 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
                  💰
                </div>
              </div>
            </div>
            <span className="text-muted-foreground">•</span>
            <PoweredByGetInMotion variant="dark" size="md" />
          </div>
        </div>
      </div>
    </footer>
  );
};