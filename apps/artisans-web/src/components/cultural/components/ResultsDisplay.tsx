
import React from 'react';
import { motion } from 'framer-motion';
import { CategoryScore, RecommendedAgents } from '@/types/dashboard';
import { DebouncedButton } from './DebouncedButton';

interface ResultsDisplayProps {
  scores: CategoryScore;
  recommendedAgents: RecommendedAgents;
  t: any;
  language: 'en' | 'es';
  onComplete: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = React.memo(({ 
  scores, 
  recommendedAgents, 
  t,
  language,
  onComplete 
}) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-xl font-semibold text-foreground mb-2">{t.resultsTitle}</h4>
      <p className="text-muted-foreground mb-6">{t.resultsSubtitle}</p>
    </div>

    {/* Scores Display */}
    <div className="space-y-4">
      {Object.entries(scores).map(([category, score]) => (
        <div key={category} className="space-y-2">
          <div className="flex justify-between">
            <span className="capitalize text-sm font-medium">{category.replace(/([A-Z])/g, ' $1')}</span>
            <span className="text-sm font-semibold">{score}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>
      ))}
    </div>

    {/* Recommendations */}
    <div className="space-y-4">
      <div>
        <h5 className="font-semibold text-foreground mb-2">{t.primaryRecommendations}</h5>
        <div className="flex flex-wrap gap-2">
          {recommendedAgents.primary?.map((agent, index) => (
            <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {agent.replace('-', ' ')}
            </span>
          ))}
        </div>
      </div>

      {recommendedAgents.secondary && (
        <div>
          <h5 className="font-semibold text-foreground mb-2">{t.secondaryRecommendations}</h5>
          <div className="flex flex-wrap gap-2">
            {recommendedAgents.secondary.map((agent, index) => (
              <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {agent.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Enhanced analysis notice */}
    {recommendedAgents.extended && (
      <div className="p-4 bg-gradient-to-r from-success/10 to-success/20 rounded-lg border border-success/20">
        <h5 className="font-semibold text-success-foreground mb-2">
          {language === 'en' ? 'Enhanced Analysis Complete' : 'Análisis Mejorado Completado'}
        </h5>
        <p className="text-sm text-success">
          {language === 'en' 
            ? 'Your recommendations are based on the comprehensive analysis including extended questions.'
            : 'Tus recomendaciones están basadas en el análisis integral incluyendo preguntas extendidas.'}
        </p>
      </div>
    )}

      {/* Completion button */}
      <div className="flex justify-center pt-4">
        <DebouncedButton
          size="lg"
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8 py-3"
          onClick={onComplete}
        >
          {t.finishAssessment}
        </DebouncedButton>
      </div>
  </div>
));

ResultsDisplay.displayName = 'ResultsDisplay';
