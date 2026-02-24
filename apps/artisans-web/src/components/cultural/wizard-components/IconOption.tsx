
import React from 'react';
import { motion } from 'framer-motion';

interface IconOptionProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: (value: string) => void;
  isMobile?: boolean;
}

export const IconOption: React.FC<IconOptionProps> = ({
  id,
  label,
  icon,
  selected,
  onClick,
  isMobile = false
}) => {
  return (
    <motion.div
      whileHover={!isMobile ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
      className={`
        cursor-pointer rounded-xl border-2 transition-all duration-200
        ${selected 
          ? 'border-purple-400 bg-purple-50 shadow-md' 
          : 'border-border hover:border-primary hover:bg-muted'
        }
        ${isMobile ? 'p-4 min-h-[60px]' : 'p-6 min-h-[80px]'}
      `}
      onClick={() => onClick(id)}
    >
      <div className="flex items-center space-x-3">
        {icon && (
          <div className={`flex-shrink-0 ${
            selected ? 'text-purple-600' : 'text-muted-foreground'
          }`}>
            {icon}
          </div>
        )}
        <span className={`${
          isMobile ? 'text-sm' : 'text-base'
        } font-medium ${
          selected ? 'text-purple-800' : 'text-foreground'
        }`}>
          {label}
        </span>
      </div>
    </motion.div>
  );
};
