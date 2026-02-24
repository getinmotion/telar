import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, Sparkles, Clock, MapPin, Heart, Camera, Star, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArtisanProfileData, LEARNED_FROM_OPTIONS } from '@/types/artisanProfile';

interface Step7PreviewProps {
  data: ArtisanProfileData;
  generatedStory?: {
    heroTitle: string;
    heroSubtitle: string;
    originNarrative: string;
    culturalNarrative?: string;
    craftNarrative?: string;
    closingMessage?: string;
  };
  isGenerating?: boolean;
}

export const Step7Preview: React.FC<Step7PreviewProps> = ({ data, generatedStory, isGenerating }) => {
  const learnedFromLabel = LEARNED_FROM_OPTIONS.find(o => o.value === data.learnedFrom)?.label || data.learnedFrom;

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
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center mx-auto shadow-lg"
        >
          <Eye className="w-10 h-10 text-success" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Tu historia está lista
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-md mx-auto">
            Así verán los clientes tu Perfil Artesanal
          </p>
        </div>
      </div>

      {isGenerating ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-xl mx-auto"
        >
          <Card className="p-8 text-center bg-gradient-to-br from-secondary/5 to-primary/5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-secondary mx-auto mb-4" />
            </motion.div>
            <p className="text-lg font-medium">Creando tu narrativa con IA...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Estamos transformando tu información en una historia hermosa
            </p>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6 max-w-xl mx-auto">
          {/* Hero Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className="relative h-56 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30">
                {data.artisanPhoto && (
                  <img 
                    src={data.artisanPhoto} 
                    alt={data.artisanName}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-foreground">
                    {generatedStory?.heroTitle || data.artisticName || data.artisanName}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {generatedStory?.heroSubtitle || `Artesano desde los ${data.startAge} años`}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {data.techniques.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Content Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 h-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Heart className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Mi Origen</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Aprendí de: {learnedFromLabel}
                    </p>
                    <p className="text-sm line-clamp-3">
                      {generatedStory?.originNarrative || data.culturalMeaning}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="p-4 h-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Star className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Mi Arte</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {data.materials.slice(0, 3).map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {data.uniqueness}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 h-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Mi Taller</h4>
                    {data.workshopAddress && (
                      <p className="text-xs text-muted-foreground">{data.workshopAddress}</p>
                    )}
                    <p className="text-sm mt-1 line-clamp-2">{data.workshopDescription}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Card className="p-4 h-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Clock className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Tiempo de Creación</h4>
                    <p className="text-sm text-muted-foreground">{data.averageTime}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Gallery Preview */}
          {(data.workshopPhotos.length > 0 || data.workingPhotos.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-semibold">Galería</h4>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[...data.workshopPhotos, ...data.workingPhotos].slice(0, 4).map((photo, i) => (
                    <img 
                      key={i} 
                      src={photo} 
                      alt={`Galería ${i + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Message */}
          {(generatedStory?.closingMessage || data.craftMessage) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Card className="p-4 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-accent mt-0.5" />
                  <p className="text-sm italic">
                    "{generatedStory?.closingMessage || data.craftMessage}"
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-4 bg-success/5 border-success/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                Todo listo para publicar
              </h4>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${data.artisanName ? 'text-success' : 'text-muted-foreground'}`} />
                  <span>Identidad completa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${data.culturalMeaning ? 'text-success' : 'text-muted-foreground'}`} />
                  <span>Historia de origen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${data.culturalHistory ? 'text-success' : 'text-muted-foreground'}`} />
                  <span>Contexto cultural</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${data.workshopPhotos.length > 0 ? 'text-success' : 'text-muted-foreground'}`} />
                  <span>Fotos del taller ({data.workshopPhotos.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${data.techniques.length > 0 ? 'text-success' : 'text-muted-foreground'}`} />
                  <span>Técnicas y materiales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${data.workingPhotos.length > 0 ? 'text-success' : 'text-muted-foreground'}`} />
                  <span>Galería ({data.workingPhotos.length + data.communityPhotos.length + data.familyPhotos.length} fotos)</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};