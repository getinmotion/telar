
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';

interface CheckboxOption {
  id: string;
  label: string;
  value?: string;
  icon?: React.ReactNode;
}

interface CheckboxCardsProps {
  options: CheckboxOption[];
  selectedValues: string[];
  onSelectionChange?: (values: string[]) => void;
  onChange?: (value: string, checked: boolean) => void;
  title?: string;
  description?: string;
  withIcons?: boolean;
}

export const CheckboxCards: React.FC<CheckboxCardsProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  onChange,
  title,
  description,
  withIcons = false
}) => {
  const handleCheckboxChange = (option: CheckboxOption, checked: boolean) => {
    const value = option.value || option.id;
    
    let updatedValues: string[];
    if (checked) {
      updatedValues = [...selectedValues, value];
    } else {
      updatedValues = selectedValues.filter(v => v !== value);
    }
    
    // Call onChange first if provided
    if (onChange) {
      onChange(value, checked);
    }
    
    // Then call onSelectionChange with the updated array
    if (onSelectionChange) {
      onSelectionChange(updatedValues);
    }
  };

  return (
    <div className="space-y-6">
      {title && (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-charcoal mb-3">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-lg">{description}</p>
          )}
        </div>
      )}
      
      <div className="grid gap-4">
        {options.map((option, index) => {
          const value = option.value || option.id;
          const isSelected = selectedValues.includes(value);
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <label className={`
                flex items-center space-x-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-float
                ${isSelected 
                  ? 'border-neon-green bg-neon-green-50 shadow-neon' 
                  : 'border-border hover:border-neon-green-300 bg-white hover:bg-neon-green-50/30'
                }
              `}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                  className="w-5 h-5"
                />
                {withIcons && option.icon && (
                  <div className="flex-shrink-0">
                    {option.icon}
                  </div>
                )}
                <span className="flex-1 text-charcoal font-semibold text-base">
                  {option.label}
                </span>
              </label>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
