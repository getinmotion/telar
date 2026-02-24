import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { PoweredByGetInMotion } from '@/components/PoweredByGetInMotion';

interface ShopFooterProps {
  shopName: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export const ShopFooter: React.FC<ShopFooterProps> = ({
  shopName,
  contactEmail,
  contactPhone,
  address,
  socialLinks
}) => {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {shopName}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Productos artesanales únicos, elaborados con la más alta calidad 
              y atención al detalle. Cada pieza cuenta una historia.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Contacto
            </h4>
            <div className="space-y-3">
              {contactEmail && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{contactEmail}</span>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{contactPhone}</span>
                </div>
              )}
              {address && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Enlaces
            </h4>
            <div className="space-y-3">
              <Link to="/privacidad" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/terminos" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Términos y Condiciones
              </Link>
              <Link to="/publicidad" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Política de Publicidad
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-sm text-muted-foreground">
              © 2024 {shopName}. Todos los derechos reservados.
            </p>
            <PoweredByGetInMotion variant="dark" size="md" />
          </div>
          
          {/* Social Links */}
          {socialLinks && (
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {socialLinks.instagram && (
                <a 
                  href={socialLinks.instagram} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialLinks.facebook && (
                <a 
                  href={socialLinks.facebook} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialLinks.twitter && (
                <a 
                  href={socialLinks.twitter} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};