
import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Gauge, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface MaturityCategory {
  name: { en: string; es: string };
  score: number;
  color: string;
}

export const ProductMaturityMeter = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<MaturityCategory[]>([
    {
      name: { en: 'Idea Validation', es: 'Validación de Idea' },
      score: 90,
      color: 'bg-success'
    },
    {
      name: { en: 'User Experience', es: 'Experiencia de Usuario' },
      score: 75,
      color: 'bg-accent'
    },
    {
      name: { en: 'Market Fit', es: 'Ajuste al Mercado' },
      score: 60,
      color: 'bg-primary'
    },
    {
      name: { en: 'Monetization', es: 'Monetización' },
      score: 30,
      color: 'bg-warning'
    }
  ]);

  const overallScore = Math.round(
    categories.reduce((acc, category) => acc + category.score, 0) / categories.length
  );

  const maturityLevel = () => {
    if (overallScore >= 80) return language === 'en' ? 'Advanced' : 'Avanzado';
    if (overallScore >= 60) return language === 'en' ? 'Growing' : 'Creciendo';
    if (overallScore >= 40) return language === 'en' ? 'Developing' : 'Desarrollando';
    return language === 'en' ? 'Early Stage' : 'Etapa Inicial';
  };

  const translations = {
    en: {
      title: "Project Maturity",
      overallMaturity: "Overall Maturity",
      level: "Level",
      categories: "Categories",
      calculate: "Calculate Your Maturity",
      recalculate: "Recalculate",
      calculateDesc: "Answer questions to get a personalized assessment"
    },
    es: {
      title: "Madurez del Proyecto",
      overallMaturity: "Madurez General",
      level: "Nivel",
      categories: "Categorías",
      calculate: "Calcula Tu Madurez",
      recalculate: "Recalcular",
      calculateDesc: "Responde preguntas para obtener una evaluación personalizada"
    }
  };

  const t = translations[language];
  
  const handleNavigateToCalculator = () => {
    navigate('/maturity-calculator');
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Gauge className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{t.title}</h2>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{t.overallMaturity}</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{maturityLevel()}</span>
            <span className="text-lg font-bold">{overallScore}%</span>
          </div>
        </div>
        <div className="relative">
          <Progress value={overallScore} className="h-3 bg-muted" />
          <div 
            className="absolute bottom-full mb-1 transform -translate-x-1/2 text-xs font-bold"
            style={{ left: `${overallScore}%` }}
          >
            <div className="w-2 h-2 bg-primary rounded-full mx-auto mb-1"></div>
          </div>
        </div>
        
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">{language === 'en' ? 'Early' : 'Inicial'}</span>
          <span className="text-xs text-primary font-medium">{language === 'en' ? 'Advanced' : 'Avanzado'}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">{t.categories}</h3>
          <span className="text-xs text-muted-foreground">{t.level}</span>
        </div>
        
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">{category.name[language]}</span>
                <span className="text-xs font-medium">{category.score}%</span>
              </div>
              <Progress value={category.score} className={`h-2 ${category.color}`} />
            </div>
          ))}
        </div>
      </div>
      
      <Button 
        onClick={handleNavigateToCalculator}
        className="w-full flex justify-between items-center"
        variant="outline"
      >
        <span>{overallScore > 0 ? t.recalculate : t.calculate}</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{t.calculateDesc}</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </Button>
    </div>
  );
};
