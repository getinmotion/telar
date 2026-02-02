
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';

interface RadioOption {
  id: string;
  label: string;
  value?: number | string;
  icon?: React.ReactNode;
}

interface RadioCardsProps {
  options: RadioOption[];
  selectedValue?: number | string;
  onSelectionChange?: (value: number | string) => void;
  onChange?: (value: string) => void;
  name?: string;
  title?: string;
  description?: string;
  withIcons?: boolean;
}

export const RadioCards: React.FC<RadioCardsProps> = ({
  options,
  selectedValue,
  onSelectionChange,
  onChange,
  name,
  title,
  description,
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
    <div className="space-y-6">
      {title && (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-charcoal mb-3">{title}</h3>
          {description && (
            <p className="text-gray-600 text-lg">{description}</p>
          )}
        </div>
      )}
      
      <RadioGroup 
        value={selectedValue?.toString()} 
        onValueChange={handleValueChange}
        name={name}
      >
        <div className="grid gap-4">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <label className={`
                flex items-center space-x-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-float
                ${selectedValue?.toString() === (option.value || option.id).toString()
                  ? 'border-neon-green bg-neon-green-50 shadow-neon' 
                  : 'border-gray-200 hover:border-neon-green-300 bg-white hover:bg-neon-green-50/30'
                }
              `}>
                <RadioGroupItem
                  value={(option.value || option.id).toString()}
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
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};
