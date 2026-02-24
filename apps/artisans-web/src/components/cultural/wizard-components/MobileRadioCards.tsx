
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';

interface RadioOption {
  id: string;
  label: string;
  value?: number | string;
  icon?: React.ReactNode;
}

interface MobileRadioCardsProps {
  options: RadioOption[];
  selectedValue?: number | string;
  onSelectionChange?: (value: number | string) => void;
  onChange?: (value: string) => void;
  name?: string;
  withIcons?: boolean;
}

export const MobileRadioCards: React.FC<MobileRadioCardsProps> = ({
  options,
  selectedValue,
  onSelectionChange,
  onChange,
  name,
  withIcons = false
}) => {
  const handleValueChange = (value: string) => {
    const option = options.find(opt => (opt.value || opt.id).toString() === value);
    if (option) {
      const finalValue = option.value || option.id;
      if (onSelectionChange) {
        onSelectionChange(finalValue);
      }
      if (onChange) {
        onChange(value);
      }
    }
  };

  return (
    <RadioGroup 
      value={selectedValue?.toString()} 
      onValueChange={handleValueChange}
      name={name}
      className="space-y-3"
    >
      {options.map((option, index) => {
        const value = (option.value || option.id).toString();
        const isSelected = selectedValue?.toString() === value;
        
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
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25 hover:shadow-sm bg-white'
              }
            `}>
              <RadioGroupItem
                value={value}
                className="w-5 h-5 mr-4 flex-shrink-0 border-2"
              />
              
              {withIcons && option.icon && (
                <div className="mr-3 text-purple-600 flex-shrink-0">
                  {option.icon}
                </div>
              )}
              
              <span className="text-gray-800 font-medium text-base leading-relaxed flex-1">
                {option.label}
              </span>
            </label>
          </motion.div>
        );
      })}
    </RadioGroup>
  );
};
