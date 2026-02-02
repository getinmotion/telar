
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain } from 'lucide-react';

interface BifurcationChoiceProps {
  language: 'en' | 'es';
  selectedType: 'quick' | 'deep' | null;
  onSelect: (type: 'quick' | 'deep') => void;
}

export const BifurcationChoice: React.FC<BifurcationChoiceProps> = ({
  language,
  selectedType,
  onSelect
}) => {
  const translations = {
    en: {
      title: "Choose Your Analysis Type",
      subtitle: "Would you like a quick recommendation or a deeper analysis?",
      quick: {
        title: "Quick Analysis",
        description: "Get immediate recommendations based on your current answers"
      },
      deep: {
        title: "Deep Analysis", 
        description: "Answer 5 more questions for detailed insights and precise recommendations"
      }
    },
    es: {
      title: "Elegí tu Tipo de Análisis",
      subtitle: "¿Querés una recomendación rápida o un análisis más profundo?",
      quick: {
        title: "Análisis Rápido",
        description: "Obtené recomendaciones inmediatas basadas en tus respuestas actuales"
      },
      deep: {
        title: "Análisis Profundo",
        description: "Respondé 5 preguntas más para obtener información detallada y recomendaciones precisas"
      }
    }
  };

  const t = translations[language];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-xl font-semibold text-foreground mb-2">{t.title}</h4>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('quick')}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            selectedType === 'quick' 
              ? 'border-primary bg-primary/10 shadow-lg' 
              : 'border-border hover:border-primary/30 hover:shadow-md'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              selectedType === 'quick' ? 'bg-primary' : 'bg-primary/20'
            }`}>
              <Zap className={`h-6 w-6 ${
                selectedType === 'quick' ? 'text-primary-foreground' : 'text-primary'
              }`} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{t.quick.title}</h3>
            <p className="text-muted-foreground text-sm">{t.quick.description}</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('deep')}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            selectedType === 'deep' 
              ? 'border-primary bg-primary/10 shadow-lg' 
              : 'border-border hover:border-primary/30 hover:shadow-md'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              selectedType === 'deep' ? 'bg-primary' : 'bg-primary/20'
            }`}>
              <Brain className={`h-6 w-6 ${
                selectedType === 'deep' ? 'text-primary-foreground' : 'text-primary'
              }`} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{t.deep.title}</h3>
            <p className="text-muted-foreground text-sm">{t.deep.description}</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};
