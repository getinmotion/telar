import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface TopNavigationProps {
  language?: 'en' | 'es';
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ language = 'es' }) => {
  const menuItems = language === 'es' 
    ? ['Cursos', 'Acerca', 'Recursos', 'Contacto']
    : ['Courses', 'About', 'Resources', 'Contact'];
  
  const ctaText = language === 'es' ? 'Inspírate' : 'Get inspired';

  return (
    <nav className="absolute top-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4">
      <div className="bg-card rounded-full shadow-[var(--shadow-elegant)] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className="text-foreground font-medium text-base hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
        <Button 
          size="sm"
          variant="default"
          className="rounded-full px-6 font-medium"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {ctaText}
        </Button>
      </div>
    </nav>
  );
};
