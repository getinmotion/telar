
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';

interface CheckboxOption {
  id: string;
  label: string;
  value?: string;
  icon?: React.ReactNode;
}

interface MobileCheckboxCardsProps {
  options: CheckboxOption[];
  selectedValues: string[];
  onSelectionChange?: (values: string[]) => void;
  onChange?: (value: string, checked: boolean) => void;
  withIcons?: boolean;
}

export const MobileCheckboxCards: React.FC<MobileCheckboxCardsProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  onChange,
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
    <div className="space-y-3">
      {options.map((option, index) => {
        const value = option.value || option.id;
        const isSelected = selectedValues.includes(value);
        
        return (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
          >
            <label className={`
              flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[64px]
              ${isSelected 
                ? 'border-purple-500 bg-purple-50 shadow-md scale-[1.02]' 
                : 'border-border hover:border-purple-300 hover:bg-purple-25 hover:shadow-sm bg-white'
              }
            `}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                className="w-5 h-5 mr-4 flex-shrink-0 border-2"
              />
              
              {withIcons && option.icon && (
                <div className="mr-3 text-purple-600 flex-shrink-0">
                  {option.icon}
                </div>
              )}
              
              <span className="text-foreground font-medium text-base leading-relaxed flex-1">
                {option.label}
              </span>
            </label>
          </motion.div>
        );
      })}
    </div>
  );
};
