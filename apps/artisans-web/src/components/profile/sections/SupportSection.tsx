import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Mail, ExternalLink } from 'lucide-react';

export const SupportSection: React.FC = () => {
  const supportLinks = [
    {
      icon: Mail,
      title: 'Correo Electrónico',
      description: 'soporte@telar.co',
      href: 'mailto:soporte@telar.co',
      external: true,
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Soporte
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          ¿Necesitas ayuda? Estamos aquí para ti
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {supportLinks.map((link) => {
          const Icon = link.icon;
          
          return (
            <a
              key={link.title}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
            >
              <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-medium group-hover:text-primary transition-colors">
                  {link.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </div>
              {link.external && (
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              )}
            </a>
          );
        })}

        {/* Legal Links */}
        <div className="pt-4 mt-4 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground mb-3">Documentos legales</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="link" size="sm" className="h-auto p-0" asChild>
              <a href="/terminos" target="_blank" rel="noopener noreferrer">
                Términos y Condiciones
              </a>
            </Button>
            <span className="text-muted-foreground">·</span>
            <Button variant="link" size="sm" className="h-auto p-0" asChild>
              <a href="/privacidad" target="_blank" rel="noopener noreferrer">
                Política de Privacidad
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
