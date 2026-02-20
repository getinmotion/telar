import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone, ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import telarHorizontal from '@/assets/telar-horizontal.svg';

interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FooterSection = ({ title, children }: FooterSectionProps) => {
  return (
    <>
      {/* Mobile: Collapsible */}
      <Collapsible className="md:hidden">
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-left">
          <h4 className="font-semibold text-white">{title}</h4>
          <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-3">
          {children}
        </CollapsibleContent>
      </Collapsible>
      
      {/* Desktop: Always visible */}
      <div className="hidden md:block">
        <h4 className="font-semibold text-white mb-4">{title}</h4>
        {children}
      </div>
    </>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-secondary text-gray-100 border-t border-secondary/80">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Mobile: Single column with collapsibles */}
        {/* Desktop: Multi-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-0 md:gap-8">
          {/* Company Info - Always expanded */}
          <div className="space-y-4 col-span-1 md:col-span-2 pb-6 md:pb-0">
            <div className="bg-white rounded-full px-4 py-2 mb-4 inline-block">
              <img 
                src={telarHorizontal}
                alt="TELAR" 
                className="h-6 md:h-8 w-auto" 
              />
            </div>
            <p className="text-sm text-gray-300 max-w-sm">
              Conectando artesanos locales con el mundo. Descubre piezas únicas hechas a mano con amor y tradición.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://facebook.com/telar.co" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/telar.co" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <Separator className="md:hidden bg-gray-700" />

          {/* Comprar */}
          <FooterSection title="Comprar">
            <ul className="space-y-2">
              <li>
                <Link to="/productos" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Todos los Productos
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Categorías
                </Link>
              </li>
              <li>
                <Link to="/giftcards" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Tarjetas de Regalo
                </Link>
              </li>
            </ul>
          </FooterSection>

          <Separator className="md:hidden bg-gray-700" />

          {/* Descubre */}
          <FooterSection title="Descubre">
            <ul className="space-y-2">
              <li>
                <Link to="/tiendas" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Artesanos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Lista de Deseos
                </Link>
              </li>
            </ul>
          </FooterSection>

          <Separator className="md:hidden bg-gray-700" />

          {/* Contact */}
          <FooterSection title="Contacto">
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">Bogotá, Colombia</span>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">hola@telar.co</span>
              </li>
            </ul>
          </FooterSection>
        </div>

        <Separator className="my-8 md:my-12 bg-gray-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} TELAR. Todos los derechos reservados.</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link to="/privacidad" className="hover:text-primary transition-colors">
              Privacidad
            </Link>
            <Link to="/terminos" className="hover:text-primary transition-colors">
              Términos
            </Link>
            <Link to="/datos-personales" className="hover:text-primary transition-colors">
              Tratamiento de Datos
            </Link>
            <span className="hidden md:inline text-gray-600">|</span>
            <span>Colombia</span>
            <span>Español</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
