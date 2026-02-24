import React from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, Camera, Video, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/shop/ai-upload/ImageUploader';
import { ArtisanProfileData } from '@/types/artisanProfile';
import { AITextArea } from './AITextArea';

interface Step4WorkshopProps {
  data: ArtisanProfileData;
  onChange: (data: Partial<ArtisanProfileData>) => void;
}

export const Step4Workshop: React.FC<Step4WorkshopProps> = ({ data, onChange }) => {
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
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto shadow-lg"
        >
          <Home className="w-10 h-10 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            El corazón de tu oficio
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
            Tu taller es donde la magia sucede. Muéstralo.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        {/* Location */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4 text-primary" />
            Ubicación del taller
            <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <Input
            value={data.workshopAddress || ''}
            onChange={(e) => onChange({ workshopAddress: e.target.value })}
            placeholder="Ciudad, región o dirección general"
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            Solo comparte lo que te sientas cómodo mostrando
          </p>
        </motion.div>

        {/* Description with AI */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AITextArea
            value={data.workshopDescription}
            onChange={(value) => onChange({ workshopDescription: value })}
            label="Describe tu taller"
            placeholder="¿Cómo es tu espacio de trabajo? ¿Qué herramientas usas? ¿Qué ambiente tiene? ¿Qué se siente estar ahí?"
            rows={4}
            context="artisan_workshop"
            required
          />
        </motion.div>

        {/* Workshop Photos */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl p-6 border border-border/50"
        >
          <Label className="flex items-center gap-2 text-base font-semibold mb-4">
            <Camera className="w-5 h-5 text-primary" />
            Fotos de tu taller
            <span className="text-destructive">*</span>
          </Label>
          <ImageUploader
            value={data.workshopPhotos}
            onChange={(urls) => onChange({ workshopPhotos: urls })}
            maxFiles={6}
            bucket="artisan-profiles"
            folder="workshop"
            placeholder="Interior, exterior, herramientas, proceso de trabajo"
          />
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Mínimo 2 fotos: interior y proceso de trabajo
          </p>
        </motion.div>

        {/* Video */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Video className="w-4 h-4 text-muted-foreground" />
            Video del taller en acción
            <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <Input
            value={data.workshopVideo || ''}
            onChange={(e) => onChange({ workshopVideo: e.target.value })}
            placeholder="URL de YouTube o Vimeo"
            type="url"
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            Un video mostrando tu proceso de trabajo cautiva más que mil fotos
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};