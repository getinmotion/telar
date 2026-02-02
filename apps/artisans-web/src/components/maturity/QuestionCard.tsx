
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuestionOption {
  id: string;
  text: string;
  value: number;
}

interface Question {
  id: string;
  title: string;
  subtitle?: string;
  options: QuestionOption[];
}

interface QuestionCardProps {
  question: Question;
  selectedValue?: number;
  onSelectOption: (questionId: string, value: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedValue,
  onSelectOption
}) => {
  const isMobile = useIsMobile();

  // Mobile version
  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">
            {question.title}
          </h3>
          {question.subtitle && (
            <p className="text-muted-foreground text-base leading-relaxed">
              {question.subtitle}
            </p>
          )}
        </div>
        
        <RadioGroup
          value={selectedValue?.toString()}
          onValueChange={(value) => onSelectOption(question.id, parseInt(value))}
          className="space-y-4"
        >
          {question.options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              className={`flex items-start p-4 rounded-xl border-2 transition-all cursor-pointer min-h-[68px] ${
                selectedValue === option.value
                  ? 'border-primary bg-primary/10 shadow-md scale-[1.02]'
                  : 'border-border hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm bg-card'
              }`}
              onClick={() => onSelectOption(question.id, option.value)}
            >
              <RadioGroupItem 
                value={option.value.toString()} 
                id={option.id}
                className="mt-1 border-2 border-primary/50 text-primary flex-shrink-0 w-5 h-5"
              />
              <Label 
                htmlFor={option.id} 
                className="text-base text-foreground cursor-pointer leading-relaxed flex-1 ml-4 font-medium"
              >
                {option.text}
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  // Desktop version - Pill Button Style
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-charcoal mb-3">
          {question.title}
        </h3>
        {question.subtitle && (
          <p className="text-gray-600 text-lg">
            {question.subtitle}
          </p>
        )}
      </div>
      
      <div className="grid gap-4">
        {question.options.map((option, index) => {
          const isSelected = selectedValue === option.value;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => onSelectOption(question.id, option.value)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-neon-green bg-neon-green-50 shadow-neon scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-neon-green-200 hover:bg-neon-green-50/50 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected 
                    ? 'border-neon-green bg-neon-green' 
                    : 'border-gray-300 bg-white'
                }`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-deep-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-base flex-1 leading-relaxed ${
                  isSelected ? 'text-charcoal font-semibold' : 'text-gray-700 font-medium'
                }`}>
                  {option.text}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
