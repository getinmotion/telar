import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Users, Heart, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/shop/ai-upload/ImageUploader';
import { ArtisanProfileData } from '@/types/artisanProfile';

interface Step6HumanGalleryProps {
  data: ArtisanProfileData;
  onChange: (data: Partial<ArtisanProfileData>) => void;
}

export const Step6HumanGallery: React.FC<Step6HumanGalleryProps> = ({ data, onChange }) => {
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
          <Camera className="w-10 h-10 text-secondary-foreground" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            El lado humano
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
            Las fotos más auténticas son las que más conectan.
          </p>
        </div>
      </div>

      <div className="space-y-8 max-w-xl mx-auto">
        {/* Working Photos */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-6 border border-primary/10"
        >
          <Label className="flex items-center gap-2 text-base font-semibold mb-2">
            <Camera className="w-5 h-5 text-primary" />
            Tú trabajando
            <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Imágenes que muestren tu proceso creativo, tus manos en acción
          </p>
          <ImageUploader
            value={data.workingPhotos}
            onChange={(urls) => onChange({ workingPhotos: urls })}
            maxFiles={6}
            bucket="artisan-profiles"
            folder="working"
            placeholder="Creando, diseñando, terminando piezas..."
          />
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Las fotos en acción generan 3x más conexión emocional
          </p>
        </motion.div>

        {/* Community Photos */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-accent/5 to-transparent rounded-2xl p-6 border border-accent/10"
        >
          <Label className="flex items-center gap-2 text-base font-semibold mb-2">
            <Users className="w-5 h-5 text-accent" />
            Tu comunidad
            <span className="text-xs text-muted-foreground font-normal ml-2">(opcional)</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Tu conexión con el lugar donde creas
          </p>
          <ImageUploader
            value={data.communityPhotos}
            onChange={(urls) => onChange({ communityPhotos: urls })}
            maxFiles={4}
            bucket="artisan-profiles"
            folder="community"
            placeholder="Tu comunidad, paisajes, eventos locales..."
          />
        </motion.div>

        {/* Family/Mentor Photos */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-destructive/5 to-transparent rounded-2xl p-6 border border-destructive/10"
        >
          <Label className="flex items-center gap-2 text-base font-semibold mb-2">
            <Heart className="w-5 h-5 text-destructive" />
            Tus maestros y familia
            <span className="text-xs text-muted-foreground font-normal ml-2">(opcional)</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Honra a quienes te transmitieron el oficio
          </p>
          <ImageUploader
            value={data.familyPhotos}
            onChange={(urls) => onChange({ familyPhotos: urls })}
            maxFiles={4}
            bucket="artisan-profiles"
            folder="family"
            placeholder="Con tu maestro, familia, comunidad artesanal..."
          />
        </motion.div>
      </div>

      {/* Tip */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-secondary/10 via-primary/5 to-accent/10 rounded-xl p-4 text-center max-w-xl mx-auto"
      >
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-medium text-foreground">Consejo:</span> Las fotos naturales y espontáneas conectan más que las poses perfectas
        </p>
      </motion.div>
    </motion.div>
  );
};