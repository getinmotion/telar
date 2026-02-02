import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Heart, Globe, Home, Sparkles, Camera, 
  Edit3, Eye, RefreshCw, Loader2, ExternalLink,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArtisanProfileData, LEARNED_FROM_OPTIONS } from '@/types/artisanProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ArtisanProfileDashboardProps {
  data: ArtisanProfileData;
  shopId: string;
  shopSlug: string;
  onEdit: (section: string) => void;
  onRefresh: () => void;
}

interface SectionCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  sectionKey: string;
  children: React.ReactNode;
  onEdit: (section: string) => void;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  icon: Icon, 
  iconColor, 
  title, 
  sectionKey,
  children, 
  onEdit 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className={`p-2 rounded-lg ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3"
              onClick={(e) => { e.stopPropagation(); onEdit(sectionKey); }}
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Editar
            </Button>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </motion.div>
    </Card>
  );
};

export const ArtisanProfileDashboard: React.FC<ArtisanProfileDashboardProps> = ({
  data,
  shopId,
  shopSlug,
  onEdit,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const learnedFromLabel = LEARNED_FROM_OPTIONS.find(o => o.value === data.learnedFrom)?.label || data.learnedFrom;

  const handleRegenerateStory = async () => {
    setIsRegenerating(true);
    try {
      const { data: storyData, error } = await supabase.functions.invoke('generate-artisan-profile-story', {
        body: {
          profile: data,
          shopId,
        }
      });

      if (error) throw error;

      // Update profile with new story
      const updatedProfile = {
        ...data,
        generatedStory: storyData,
      };

      const { error: updateError } = await supabase
        .from('artisan_shops')
        .update({ artisan_profile: updatedProfile as any })
        .eq('id', shopId);

      if (updateError) throw updateError;

      toast({
        title: "Historia regenerada",
        description: "Tu perfil ha sido actualizado con una nueva narrativa",
      });

      onRefresh();
    } catch (error) {
      console.error('Error regenerating story:', error);
      toast({
        title: "Error",
        description: "No se pudo regenerar la historia",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleViewPublic = () => {
    window.open(`/tienda/${shopSlug}/perfil-artesanal`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-6 border"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {data.artisanPhoto && (
            <img 
              src={data.artisanPhoto} 
              alt={data.artisanName}
              className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {data.artisticName || data.artisanName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {data.generatedStory?.heroSubtitle || `Artesano desde los ${data.startAge} años`}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.techniques.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRegenerateStory}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Regenerar Historia
            </Button>
            <Button 
              size="sm" 
              onClick={handleViewPublic}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Perfil Público
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Section Cards */}
      <div className="grid gap-4">
        <SectionCard
          icon={User}
          iconColor="bg-primary/10 text-primary"
          title="Identidad"
          sectionKey="identity"
          onEdit={onEdit}
        >
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Nombre:</span> {data.artisanName}</p>
            <p><span className="font-medium">Nombre artístico:</span> {data.artisticName}</p>
            {data.artisanVideo && (
              <p><span className="font-medium">Video:</span> <a href={data.artisanVideo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver video</a></p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          icon={Heart}
          iconColor="bg-accent/10 text-accent"
          title="Origen del Oficio"
          sectionKey="origin"
          onEdit={onEdit}
        >
          <div className="space-y-3 text-sm">
            <p><span className="font-medium">Aprendí de:</span> {learnedFromLabel}</p>
            {data.learnedFromDetail && <p className="text-muted-foreground">{data.learnedFromDetail}</p>}
            <p><span className="font-medium">Edad de inicio:</span> {data.startAge} años</p>
            <div>
              <span className="font-medium">Significado cultural:</span>
              <p className="text-muted-foreground mt-1">{data.culturalMeaning}</p>
            </div>
            <div>
              <span className="font-medium">Motivación:</span>
              <p className="text-muted-foreground mt-1">{data.motivation}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Globe}
          iconColor="bg-secondary/10 text-secondary-foreground"
          title="Historia Cultural"
          sectionKey="cultural"
          onEdit={onEdit}
        >
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Historia de la tradición:</span>
              <p className="text-muted-foreground mt-1">{data.culturalHistory}</p>
            </div>
            <div>
              <span className="font-medium">Relación étnica/regional:</span>
              <p className="text-muted-foreground mt-1">{data.ethnicRelation}</p>
            </div>
            {data.ancestralKnowledge && (
              <div>
                <span className="font-medium">Conocimientos ancestrales:</span>
                <p className="text-muted-foreground mt-1">{data.ancestralKnowledge}</p>
              </div>
            )}
            <div>
              <span className="font-medium">Importancia territorial:</span>
              <p className="text-muted-foreground mt-1">{data.territorialImportance}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Home}
          iconColor="bg-primary/10 text-primary"
          title="El Taller"
          sectionKey="workshop"
          onEdit={onEdit}
        >
          <div className="space-y-3 text-sm">
            {data.workshopAddress && <p><span className="font-medium">Ubicación:</span> {data.workshopAddress}</p>}
            <div>
              <span className="font-medium">Descripción:</span>
              <p className="text-muted-foreground mt-1">{data.workshopDescription}</p>
            </div>
            {data.workshopPhotos.length > 0 && (
              <div>
                <span className="font-medium">Fotos ({data.workshopPhotos.length}):</span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {data.workshopPhotos.slice(0, 4).map((photo, i) => (
                    <img key={i} src={photo} alt={`Taller ${i+1}`} className="w-full h-16 object-cover rounded" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          icon={Sparkles}
          iconColor="bg-accent/10 text-accent"
          title="Tu Artesanía"
          sectionKey="craft"
          onEdit={onEdit}
        >
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Técnicas:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.techniques.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Materiales:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.materials.map((m) => (
                  <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                ))}
              </div>
            </div>
            <p><span className="font-medium">Tiempo promedio:</span> {data.averageTime}</p>
            <div>
              <span className="font-medium">Qué hace único tu trabajo:</span>
              <p className="text-muted-foreground mt-1">{data.uniqueness}</p>
            </div>
            <div>
              <span className="font-medium">Mensaje:</span>
              <p className="text-muted-foreground mt-1">{data.craftMessage}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Camera}
          iconColor="bg-secondary/10 text-secondary-foreground"
          title="Galería Humana"
          sectionKey="gallery"
          onEdit={onEdit}
        >
          <div className="space-y-3">
            {data.workingPhotos.length > 0 && (
              <div>
                <span className="text-sm font-medium">Trabajando ({data.workingPhotos.length}):</span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {data.workingPhotos.slice(0, 4).map((photo, i) => (
                    <img key={i} src={photo} alt={`Trabajando ${i+1}`} className="w-full h-16 object-cover rounded" />
                  ))}
                </div>
              </div>
            )}
            {data.communityPhotos.length > 0 && (
              <div>
                <span className="text-sm font-medium">Comunidad ({data.communityPhotos.length}):</span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {data.communityPhotos.slice(0, 4).map((photo, i) => (
                    <img key={i} src={photo} alt={`Comunidad ${i+1}`} className="w-full h-16 object-cover rounded" />
                  ))}
                </div>
              </div>
            )}
            {data.familyPhotos.length > 0 && (
              <div>
                <span className="text-sm font-medium">Familia/Maestros ({data.familyPhotos.length}):</span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {data.familyPhotos.slice(0, 4).map((photo, i) => (
                    <img key={i} src={photo} alt={`Familia ${i+1}`} className="w-full h-16 object-cover rounded" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Footer info */}
      <div className="text-center text-sm text-muted-foreground">
        Perfil completado el {data.completedAt ? new Date(data.completedAt).toLocaleDateString('es-CO') : 'N/A'}
      </div>
    </div>
  );
};