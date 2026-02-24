import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingLoadingPhrasesProps {
  className?: string;
  intervalMs?: number;
  customPhrases?: string[];
}

const defaultPhrases = [
  "Tejiendo tu experiencia digital...",
  "Cada hilo cuenta una historia...",
  "La tradición encuentra la tecnología...",
  "Digitalizando el arte de tus manos...",
  "La inteligencia artificial aprende de tu oficio...",
  "Conectando tu taller con el mundo...",
  "Transformando tradición en innovación...",
  "Tu legado artesanal, ahora digital...",
  "Hilando datos para tu crecimiento...",
  "La IA teje junto a ti...",
  "Del telar al mundo digital...",
  "Preparando tu vitrina virtual...",
  "El arte de tus manos, ahora en línea...",
  "Tu tienda digital toma forma...",
  "Organizando tu espacio digital...",
  "La tecnología al servicio del artesano...",
  "Analizando para potenciar tu negocio...",
  "Tu oficio se encuentra con el futuro...",
];

export const RotatingLoadingPhrases: React.FC<RotatingLoadingPhrasesProps> = ({
  className = "text-muted-foreground text-sm",
  intervalMs = 3500,
  customPhrases
}) => {
  const phrases = customPhrases || defaultPhrases;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [phrases.length, intervalMs]);

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="text-center"
        >
          {phrases[currentIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
