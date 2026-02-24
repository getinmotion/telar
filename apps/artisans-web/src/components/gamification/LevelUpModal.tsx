import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Trophy, Star } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  levelsGained?: number;
  benefits?: string[];
}

const levelTitles: Record<number, string> = {
  1: 'Aprendiz Artesano',
  2: 'Artesano en Formación',
  3: 'Artesano Competente',
  4: 'Maestro Artesano',
  5: 'Gran Maestro',
  6: 'Maestro Legendario',
  7: 'Artesano Virtuoso',
  8: 'Maestro Supremo',
  9: 'Guardián del Arte',
  10: 'Leyenda Artesanal'
};

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  levelsGained = 1,
  benefits = []
}) => {
  useEffect(() => {
    if (isOpen) {
      // Epic confetti celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B']
        });
        
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen]);

  const defaultBenefits = [
    'Nuevas funcionalidades desbloqueadas',
    'Mayor visibilidad en el mercado',
    'Acceso a recursos exclusivos',
    'Insignias especiales'
  ];

  const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-gradient-to-b from-background to-accent/5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center py-6 space-y-6"
        >
          {/* Icon */}
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg"
          >
            <Crown className="w-12 h-12 text-primary-foreground" />
          </motion.div>

          {/* Title */}
          <div className="space-y-2">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ¡Nivel {newLevel}!
              </h2>
              {levelsGained > 1 && (
                <p className="text-sm text-muted-foreground">
                  Subiste {levelsGained} niveles
                </p>
              )}
            </motion.div>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold text-foreground"
            >
              {levelTitles[newLevel] || `Nivel ${newLevel}`}
            </motion.p>
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Nuevos Beneficios</h3>
            </div>
            
            <ul className="space-y-2 text-left">
              {displayBenefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Star className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Close Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              size="lg"
            >
              <Trophy className="w-4 h-4 mr-2" />
              ¡Continuar!
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
