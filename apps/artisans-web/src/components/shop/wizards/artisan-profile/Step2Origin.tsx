import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArtisanProfileData, LEARNED_FROM_OPTIONS } from '@/types/artisanProfile';
import { AITextArea } from './AITextArea';

interface Step2OriginProps {
  data: ArtisanProfileData;
  onChange: (data: Partial<ArtisanProfileData>) => void;
}

export const Step2Origin: React.FC<Step2OriginProps> = ({ data, onChange }) => {
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
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto shadow-lg"
        >
          <Heart className="w-10 h-10 text-accent" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Tu camino como artesano
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
            Cada maestro tiene un origen. ¿Cuál es el tuyo?
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        {/* Who taught you */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-primary" />
              ¿De quién aprendiste? <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.learnedFrom}
              onValueChange={(value) => onChange({ learnedFrom: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {LEARNED_FROM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-primary" />
              ¿Desde qué edad? <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={data.startAge || ''}
              onChange={(e) => onChange({ startAge: parseInt(e.target.value) || 0 })}
              placeholder="Edad"
              className="h-12"
            />
          </div>
        </motion.div>

        {/* Detail about who taught */}
        {data.learnedFrom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <AITextArea
              value={data.learnedFromDetail || ''}
              onChange={(value) => onChange({ learnedFromDetail: value })}
              label="Cuéntanos más sobre esta persona o experiencia"
              placeholder="¿Quién te enseñó? ¿Cómo fue esa experiencia? ¿Qué recuerdos tienes?"
              rows={3}
              context="artisan_profile_origin"
              hint="Comparte los detalles que hacen especial tu aprendizaje"
            />
          </motion.div>
        )}

        {/* Cultural meaning */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AITextArea
            value={data.culturalMeaning}
            onChange={(value) => onChange({ culturalMeaning: value })}
            label="¿Qué significa este oficio en tu vida?"
            placeholder="¿Qué representa para ti? ¿Cómo conecta con tu identidad? ¿Qué emociones te genera?"
            rows={4}
            context="artisan_profile_meaning"
            required
            hint="Esta es una de las partes más importantes de tu historia"
          />
        </motion.div>

        {/* Motivation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AITextArea
            value={data.motivation}
            onChange={(value) => onChange({ motivation: value })}
            label="¿Qué te motivó a dedicarte a esta artesanía?"
            placeholder="¿Por qué elegiste este camino? ¿Qué te inspira cada día a seguir creando?"
            rows={4}
            context="artisan_profile_motivation"
            required
          />
        </motion.div>
      </div>
    </motion.div>
  );
};