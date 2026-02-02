
import React from 'react';
import { motion } from 'framer-motion';

export const WizardBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50 to-indigo-100 opacity-40" />
      
      {/* Abstract shapes */}
      <motion.div 
        className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-purple-200 to-indigo-300 opacity-20 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, -20, 0], 
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
      
      <motion.div 
        className="absolute bottom-0 left-0 w-1/3 h-1/3 rounded-full bg-gradient-to-tr from-violet-300 to-purple-200 opacity-20 blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1],
          x: [0, -10, 0],
          y: [0, 10, 0], 
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
      
      <motion.div 
        className="absolute top-1/4 left-1/4 w-1/4 h-1/4 rounded-full bg-gradient-to-br from-indigo-200 to-purple-100 opacity-15 blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, 30, 0],
          y: [0, 30, 0], 
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
    </div>
  );
};
