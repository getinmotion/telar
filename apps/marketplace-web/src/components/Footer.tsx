import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ChevronDown } from "lucide-react";
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-0 md:gap-8">
          {/* Company Info - Always expanded */}
          <div className="space-y-4 col-span-1 md:col-span-2 pb-6 md:pb-0">
            <img 
              src={telarHorizontal}
              alt="TELAR" 
              className="h-8 md:h-10 w-auto mb-4 brightness-0 invert" 
            />
            <p className="text-sm text-gray-300 max-w-sm">
              Conectando artesanos locales con el mundo. Descubre piezas únicas hechas a mano con amor y tradición.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <Separator className="md:hidden bg-gray-700" />

          {/* Shop */}
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
                <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Nuevos Ingresos
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Ofertas
                </a>
              </li>
            </ul>
          </FooterSection>

          <Separator className="md:hidden bg-gray-700" />

          {/* About */}
          <FooterSection title="Empresa">
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <Link to="/tiendas" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Artesanos
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Sostenibilidad
                </a>
              </li>
            </ul>
          </FooterSection>

          <Separator className="md:hidden bg-gray-700" />

          {/* Help */}
          <FooterSection title="Ayuda">
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Envíos
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Mi Cuenta
                </a>
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
                <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">+57 300 123 4567</span>
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
          <div className="flex gap-4 md:gap-6">
            <span>Colombia</span>
            <span className="hidden md:inline">|</span>
            <span>Español</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
