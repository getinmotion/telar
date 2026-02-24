import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, BookOpen, Feather } from 'lucide-react';
import { ArtisanProfileData } from '@/types/artisanProfile';
import { AITextArea } from './AITextArea';

interface Step3CulturalHistoryProps {
  data: ArtisanProfileData;
  onChange: (data: Partial<ArtisanProfileData>) => void;
}

export const Step3CulturalHistory: React.FC<Step3CulturalHistoryProps> = ({ data, onChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Storytelling Header */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center mx-auto shadow-lg"
        >
          <Globe className="w-10 h-10 text-secondary-foreground" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Raíces y tradición
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
            Tu arte lleva siglos de historia. Compártela.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        {/* Cultural History */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-muted/30 to-transparent rounded-xl p-5 border border-border/30"
        >
          <div className="flex items-start gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <AITextArea
                value={data.culturalHistory}
                onChange={(value) => onChange({ culturalHistory: value })}
                label="Historia de tu tradición artesanal"
                placeholder="¿Cuál es la historia de este tipo de artesanía? ¿Desde cuándo existe? ¿Cómo ha evolucionado a través del tiempo?"
                rows={5}
                context="artisan_cultural_history"
                required
                hint="Comparte la historia ancestral de la tradición que practicas"
              />
            </div>
          </div>
        </motion.div>

        {/* Ethnic Relation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AITextArea
            value={data.ethnicRelation}
            onChange={(value) => onChange({ ethnicRelation: value })}
            label="Conexión con tu etnia, región o comunidad"
            placeholder="¿Cómo se relaciona tu artesanía con tu comunidad o cultura? ¿Perteneces a algún grupo étnico o comunidad artesanal?"
            rows={4}
            context="artisan_ethnic_relation"
            required
          />
        </motion.div>

        {/* Ancestral Knowledge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-accent/5 to-transparent rounded-xl p-5 border border-accent/10"
        >
          <div className="flex items-start gap-3 mb-3">
            <Feather className="w-5 h-5 text-accent mt-0.5" />
            <div className="flex-1">
              <AITextArea
                value={data.ancestralKnowledge}
                onChange={(value) => onChange({ ancestralKnowledge: value })}
                label="Conocimientos ancestrales o rituales"
                placeholder="¿Hay técnicas ancestrales, rituales o conocimientos especiales que forman parte de tu práctica? ¿Significados simbólicos en tus piezas?"
                rows={4}
                context="artisan_ancestral_knowledge"
                hint="Esto puede incluir técnicas transmitidas por generaciones, rituales, o significados simbólicos"
              />
            </div>
          </div>
        </motion.div>

        {/* Territorial Importance */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-8" />
            <div className="flex-1">
              <AITextArea
                value={data.territorialImportance}
                onChange={(value) => onChange({ territorialImportance: value })}
                label="Importancia para tu territorio"
                placeholder="¿Por qué tu artesanía es importante para tu región? ¿Qué papel juega en la identidad local? ¿Cómo impacta en tu comunidad?"
                rows={4}
                context="artisan_territorial"
                required
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};