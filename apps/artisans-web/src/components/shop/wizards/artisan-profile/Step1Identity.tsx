import React from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Video, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/shop/ai-upload/ImageUploader';
import { ArtisanProfileData } from '@/types/artisanProfile';

interface Step1IdentityProps {
  data: ArtisanProfileData;
  onChange: (data: Partial<ArtisanProfileData>) => void;
}

export const Step1Identity: React.FC<Step1IdentityProps> = ({ data, onChange }) => {
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
          <User className="w-10 h-10 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            ¿Quién eres?
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
            Cada artesano tiene una identidad única. Cuéntanos la tuya.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        {/* Photo uploader - prominent */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl p-6 border border-border/50"
        >
          <Label className="flex items-center gap-2 text-base font-semibold mb-4">
            <Camera className="w-5 h-5 text-primary" />
            Tu rostro, tu marca
            <span className="text-destructive">*</span>
          </Label>
          <ImageUploader
            value={data.artisanPhoto ? [data.artisanPhoto] : []}
            onChange={(urls) => onChange({ artisanPhoto: urls[0] })}
            maxFiles={1}
            bucket="artisan-profiles"
            folder="photos"
            aspectRatio="square"
            placeholder="Una foto donde se vea tu rostro claramente"
          />
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Los clientes conectan más con un rostro que con un logo
          </p>
        </motion.div>

        {/* Name fields */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="artisanName" className="text-sm font-medium">
              Nombre completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="artisanName"
              value={data.artisanName}
              onChange={(e) => onChange({ artisanName: e.target.value })}
              placeholder="Tu nombre completo"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artisticName" className="text-sm font-medium">
              Nombre artístico <span className="text-destructive">*</span>
            </Label>
            <Input
              id="artisticName"
              value={data.artisticName}
              onChange={(e) => onChange({ artisticName: e.target.value })}
              placeholder="Como te conocen"
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">
              Aparecerá destacado en tu perfil
            </p>
          </div>
        </motion.div>

        {/* Video optional */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Video className="w-4 h-4 text-muted-foreground" />
            Video de presentación
            <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <Input
            value={data.artisanVideo || ''}
            onChange={(e) => onChange({ artisanVideo: e.target.value })}
            placeholder="URL de YouTube o Vimeo"
            type="url"
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            Un video corto presentándote y hablando de tu oficio
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};