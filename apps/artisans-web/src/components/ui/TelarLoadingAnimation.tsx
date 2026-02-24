import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TelarLoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { width: 32, height: 32, threads: 5, strokeWidth: 1.5 },
  md: { width: 48, height: 48, threads: 7, strokeWidth: 2 },
  lg: { width: 64, height: 64, threads: 9, strokeWidth: 2.5 },
};

export const TelarLoadingAnimation: React.FC<TelarLoadingAnimationProps> = ({
  size = 'md',
  className,
}) => {
  const config = sizeConfig[size];
  const { width, height, threads, strokeWidth } = config;
  
  const verticalSpacing = width / (threads + 1);
  const horizontalRows = 4;
  const rowSpacing = height / (horizontalRows + 1);

  return (
    <div className={cn("relative", className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Hilos verticales (urdimbre) - estáticos */}
        {Array.from({ length: threads }).map((_, i) => (
          <motion.line
            key={`vertical-${i}`}
            x1={verticalSpacing * (i + 1)}
            y1={2}
            x2={verticalSpacing * (i + 1)}
            y2={height - 2}
            stroke="currentColor"
            strokeWidth={strokeWidth * 0.6}
            className="text-primary/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          />
        ))}

        {/* Hilos horizontales (trama) - animados */}
        {Array.from({ length: horizontalRows }).map((_, i) => (
          <motion.line
            key={`horizontal-${i}`}
            x1={2}
            y1={rowSpacing * (i + 1)}
            x2={width - 2}
            y2={rowSpacing * (i + 1)}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-primary"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: [0, 1, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Lanzadera */}
        <motion.rect
          width={width * 0.15}
          height={height * 0.12}
          rx={2}
          fill="currentColor"
          className="text-accent"
          initial={{ x: 0, y: height / 2 - (height * 0.06) }}
          animate={{ 
            x: [0, width - (width * 0.15), 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-primary/10 rounded-lg blur-xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.8, 1.1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
