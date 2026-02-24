
import React from 'react';
import { Check } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

export const ValueProposition: React.FC = () => {
  const { t } = useTranslations();

  return (
    <section 
      className="py-16 md:py-24 bg-background"
      data-section="value-proposition"
      id="value-proposition"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {t.valueProposition.title}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t.valueProposition.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {t.valueProposition.reasons.map((reason, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {reason}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Obtén el apoyo que necesitas para hacer crecer tu negocio artesanal
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};