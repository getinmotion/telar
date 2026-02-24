import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface SingleChoiceInputProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
}

export const SingleChoiceInput: React.FC<SingleChoiceInputProps> = ({
  options,
  value,
  onChange,
  helpText
}) => {
  return (
    <div className="space-y-3">
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isSelected = value === option;
          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => onChange(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${isSelected 
                  ? 'border-primary bg-primary/10 shadow-md' 
                  : 'border-border hover:border-primary/50 bg-card'
                }
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {option}
                </span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
