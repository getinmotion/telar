import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Star, MessageSquare, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArtisanProfileData } from '@/types/artisanProfile';
import { AITextArea } from './AITextArea';

interface Step5CraftProps {
  data: ArtisanProfileData;
  onChange: (data: Partial<ArtisanProfileData>) => void;
}

export const Step5Craft: React.FC<Step5CraftProps> = ({ data, onChange }) => {
  const [newTechnique, setNewTechnique] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  const addTechnique = () => {
    if (newTechnique.trim() && !data.techniques.includes(newTechnique.trim())) {
      onChange({ techniques: [...data.techniques, newTechnique.trim()] });
      setNewTechnique('');
    }
  };

  const removeTechnique = (technique: string) => {
    onChange({ techniques: data.techniques.filter(t => t !== technique) });
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !data.materials.includes(newMaterial.trim())) {
      onChange({ materials: [...data.materials, newMaterial.trim()] });
      setNewMaterial('');
    }
  };

  const removeMaterial = (material: string) => {
    onChange({ materials: data.materials.filter(m => m !== material) });
  };

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
          <Sparkles className="w-10 h-10 text-accent" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            El alma de tus creaciones
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
            Las técnicas y materiales que dan vida a tu arte.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        {/* Techniques */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Label className="text-sm font-medium">
            Técnicas que dominas <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              value={newTechnique}
              onChange={(e) => setNewTechnique(e.target.value)}
              placeholder="Ej: Tejido en telar, Cerámica a mano..."
              className="h-12"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnique())}
            />
            <Button type="button" onClick={addTechnique} size="icon" variant="secondary" className="h-12 w-12">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          {data.techniques.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {data.techniques.map((technique) => (
                <Badge key={technique} variant="secondary" className="pr-1 text-sm py-1">
                  {technique}
                  <button
                    type="button"
                    onClick={() => removeTechnique(technique)}
                    className="ml-2 hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Materials */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Label className="text-sm font-medium">
            Materiales que utilizas <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              placeholder="Ej: Lana de oveja, Arcilla, Fique..."
              className="h-12"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
            />
            <Button type="button" onClick={addMaterial} size="icon" variant="outline" className="h-12 w-12">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          {data.materials.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {data.materials.map((material) => (
                <Badge key={material} variant="outline" className="pr-1 text-sm py-1">
                  {material}
                  <button
                    type="button"
                    onClick={() => removeMaterial(material)}
                    className="ml-2 hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Average time */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 text-primary" />
            Tiempo promedio de elaboración <span className="text-destructive">*</span>
          </Label>
          <Input
            value={data.averageTime}
            onChange={(e) => onChange({ averageTime: e.target.value })}
            placeholder="Ej: 2-3 días por pieza, 1 semana para piezas grandes..."
            className="h-12"
          />
        </motion.div>

        {/* Uniqueness with AI */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-secondary mt-8" />
            <div className="flex-1">
              <AITextArea
                value={data.uniqueness}
                onChange={(value) => onChange({ uniqueness: value })}
                label="¿Qué hace única tu artesanía?"
                placeholder="¿Qué diferencia tu trabajo del de otros artesanos? ¿Tienes alguna técnica especial? ¿Un estilo propio?"
                rows={4}
                context="artisan_uniqueness"
                required
              />
            </div>
          </div>
        </motion.div>

        {/* Message with AI */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-accent mt-8" />
            <div className="flex-1">
              <AITextArea
                value={data.craftMessage}
                onChange={(value) => onChange({ craftMessage: value })}
                label="¿Qué mensaje transmites con tu arte?"
                placeholder="¿Qué quieres que la gente sienta o entienda cuando ve tu trabajo? ¿Qué historia cuenta cada pieza?"
                rows={4}
                context="artisan_message"
                required
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};