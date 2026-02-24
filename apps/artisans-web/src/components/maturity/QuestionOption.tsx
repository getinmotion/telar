
import React from 'react';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';
import { QuestionOption as QuestionOptionType } from './types';
import { motion } from 'framer-motion';

interface QuestionOptionProps {
  option: QuestionOptionType;
  questionId: string;
  isSelected: boolean;
  onSelect: (questionId: string, value: number) => void;
}

export const QuestionOption: React.FC<QuestionOptionProps> = ({ 
  option, 
  questionId, 
  isSelected, 
  onSelect
}) => {
  return (
    <motion.div 
      key={option.id}
      className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all
        ${isSelected 
          ? 'border-primary bg-primary/10 shadow-md' 
          : 'border-border hover:border-primary/50'}`}
      onClick={() => onSelect(questionId, option.value)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={isSelected ? { scale: 0.98 } : { scale: 1 }}
      animate={isSelected ? { scale: 1 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <RadioGroupItem 
        value={option.id} 
        id={option.id}
        checked={isSelected}
        className="mr-4"
      />
      <div className="flex items-center flex-1 min-h-[60px]">
        {option.icon && <span className="mr-4 text-primary text-2xl">{option.icon}</span>}
        <Label htmlFor={option.id} className="flex-1 cursor-pointer text-lg">
          {option.text}
        </Label>
      </div>
      {isSelected && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-2"
        >
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </motion.div>
      )}
      
      {isSelected && (
        <motion.div 
          className="absolute -inset-px rounded-xl bg-primary/10 blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};
