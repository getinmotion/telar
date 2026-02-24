import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface MultipleChoiceInputProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  helpText?: string;
}

export const MultipleChoiceInput: React.FC<MultipleChoiceInputProps> = ({
  options,
  value = [],
  onChange,
  helpText
}) => {
  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {helpText && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
        {value.length > 0 && (
          <span className="text-xs font-medium text-primary">
            {value.length} seleccionada{value.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isSelected = value.includes(option);
          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => toggleOption(option)}
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
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}
                `}>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
