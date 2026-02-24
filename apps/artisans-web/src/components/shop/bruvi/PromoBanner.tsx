import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoBannerProps {
  region?: string;
  craftType?: string;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ region, craftType }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const messages = [
    `Piezas hechas a mano${region ? ` en ${region}` : ' en Colombia'}`,
    'Series limitadas · Envío seguro a todo el país',
    'Conoce el taller detrás de cada pieza',
    craftType ? `Artesanía de ${craftType} con tradición` : 'Técnicas tradicionales colombianas'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="bg-primary text-primary-foreground py-2.5 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium tracking-wide text-center"
            >
              {messages[currentIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
