
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScoreBreakdown } from '../hooks/utils/scoreCalculation';
import { CategoryScore } from '@/components/maturity/types';
import { TrendingUp, User, Target, DollarSign, PlusCircle } from 'lucide-react';

interface ScoreBreakdownDisplayProps {
  breakdown: ScoreBreakdown;
  scores: CategoryScore;
  language: 'en' | 'es';
}

const categoryDetails = {
  en: {
    ideaValidation: { title: "Idea Validation", icon: TrendingUp },
    userExperience: { title: "User Experience", icon: User },
    marketFit: { title: "Market Fit", icon: Target },
    monetization: { title: "Monetization", icon: DollarSign },
    breakdownTitle: "How we calculated your score:",
    points: "pts"
  },
  es: {
    ideaValidation: { title: "Validación de Idea", icon: TrendingUp },
    userExperience: { title: "Experiencia de Usuario", icon: User },
    marketFit: { title: "Ajuste al Mercado", icon: Target },
    monetization: { title: "Monetización", icon: DollarSign },
    breakdownTitle: "Así calculamos tu puntaje:",
    points: "pts"
  }
};

export const ScoreBreakdownDisplay: React.FC<ScoreBreakdownDisplayProps> = ({ breakdown, scores, language }) => {
  const t = categoryDetails[language];

  const categoryOrder: (keyof ScoreBreakdown)[] = ['ideaValidation', 'userExperience', 'marketFit', 'monetization'];

  return (
    <div className="w-full space-y-4">
      <h3 className="text-xl font-bold text-foreground text-center">
        {language === 'es' ? 'El Detalle de Tus Resultados' : 'Your Results Breakdown'}
      </h3>
      <Accordion type="single" collapsible className="w-full">
        {categoryOrder.map((category) => {
          const entries = breakdown[category];
          const details = t[category];
          const score = scores[category as keyof CategoryScore];

          if (entries.length === 0 || typeof details === 'string' || !details) {
            return null;
          }
          
          const Icon = details.icon;

          return (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-3 w-full">
                  <Icon className="w-6 h-6 text-primary" />
                  <span>{details.title}</span>
                  <span className="ml-auto font-bold text-primary">{score}%</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-3">{t.breakdownTitle}</h4>
                  <ul className="space-y-2">
                    {entries.map((entry, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <PlusCircle className="w-4 h-4 text-success mr-3 flex-shrink-0 mt-0.5" />
                        <span className="flex-1 text-foreground">{entry.reason}</span>
                        <span className="font-medium text-success whitespace-nowrap ml-2">+{entry.points} {t.points}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
