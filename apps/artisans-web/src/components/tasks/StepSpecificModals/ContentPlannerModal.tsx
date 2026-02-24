import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VoiceInput } from '@/components/ui/voice-input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Image, Video, FileText, Sparkles, Download, Instagram, Facebook } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ContentPlannerModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  stepTitle: string;
}

interface ContentPost {
  day: string;
  type: 'product' | 'tutorial' | 'story' | 'testimonial' | 'behind-scenes';
  description: string;
  time: string;
}

const CONTENT_TYPES = [
  { id: 'product', label: 'Producto', icon: Image, color: 'bg-blue-500' },
  { id: 'tutorial', label: 'Tutorial', icon: Video, color: 'bg-green-500' },
  { id: 'story', label: 'Historia', icon: FileText, color: 'bg-purple-500' },
  { id: 'testimonial', label: 'Testimonio', icon: Sparkles, color: 'bg-yellow-500' },
  { id: 'behind-scenes', label: 'Detrás de Cámaras', icon: Calendar, color: 'bg-pink-500' }
];

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ContentPlannerModal: React.FC<ContentPlannerModalProps> = ({
  open,
  onClose,
  onComplete,
  stepTitle
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('product');
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [currentDescription, setCurrentDescription] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[0]);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [businessContext, setBusinessContext] = useState<any>(null);

  useEffect(() => {
    if (open && user) {
      loadBusinessContext();
    }
  }, [open, user]);

  useEffect(() => {
    const completedFields = [
      posts.length > 0,
      hashtags.length > 0
    ].filter(Boolean).length;
    setProgress((completedFields / 2) * 100);
  }, [posts, hashtags]);

  const loadBusinessContext = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_master_context')
      .select('conversation_insights, business_context')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setBusinessContext(data);
      generateHashtags(data);
    }
  };

  const generateHashtags = (context: any) => {
    const insights = context?.conversation_insights || {};
    const craftType = insights.tipo_artesania || 'artesanía';
    const businessName = insights.nombre_marca || '';
    
    const generatedHashtags = [
      `#${craftType.replace(/\s+/g, '')}`,
      '#ArtesaníaColombiana',
      '#HechoAMano',
      '#Artesano',
      businessName ? `#${businessName.replace(/\s+/g, '')}` : null,
      '#ApoyaLocal',
      '#ProductoArtesanal'
    ].filter(Boolean) as string[];

    setHashtags(generatedHashtags);
  };

  const addPost = () => {
    if (!currentDescription.trim()) {
      toast({
        title: 'Descripción requerida',
        description: 'Por favor describe el contenido de la publicación',
        variant: 'destructive'
      });
      return;
    }

    const newPost: ContentPost = {
      day: selectedDay,
      type: selectedType as any,
      description: currentDescription,
      time: selectedTime
    };

    setPosts([...posts, newPost]);
    setCurrentDescription('');
    
    toast({
      title: '✅ Publicación agregada',
      description: `${selectedDay} a las ${selectedTime}`
    });
  };

  const handleComplete = () => {
    if (posts.length === 0) {
      toast({
        title: 'Plan incompleto',
        description: 'Agrega al menos una publicación a tu plan',
        variant: 'destructive'
      });
      return;
    }

    const contentPlan = {
      posts,
      hashtags,
      weeklyDistribution: posts.reduce((acc, post) => {
        acc[post.day] = (acc[post.day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast({
      title: '🎉 ¡Plan de contenido creado!',
      description: `${posts.length} publicaciones programadas`
    });

    onComplete(contentPlan);
    onClose();
  };

  const exportPlan = () => {
    const planText = posts.map(post => 
      `${post.day} ${post.time} - ${CONTENT_TYPES.find(t => t.id === post.type)?.label}: ${post.description}`
    ).join('\n');

    const blob = new Blob([planText + '\n\nHashtags: ' + hashtags.join(' ')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plan-contenido.txt';
    a.click();

    toast({
      title: '📥 Plan exportado',
      description: 'Archivo descargado exitosamente'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-primary" />
            Planificador de Contenido para Redes Sociales
          </DialogTitle>
          <DialogDescription>
            Crea un plan semanal de publicaciones para {businessContext?.conversation_insights?.nombre_marca || 'tu negocio'}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2 mb-4" />

        {/* Content Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Contenido</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {CONTENT_TYPES.map(type => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? 'default' : 'outline'}
                onClick={() => setSelectedType(type.id)}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <type.icon className="w-5 h-5" />
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Schedule Selector */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Día</label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hora</label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['09:00', '10:00', '12:00', '15:00', '18:00', '20:00'].map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Post Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Descripción de la Publicación</label>
          <div className="relative">
            <Textarea
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
              placeholder="Describe qué vas a publicar..."
              rows={3}
              className="pr-12"
            />
            <div className="absolute right-2 top-2">
              <VoiceInput
                onTranscript={(transcript) => {
                  const newText = currentDescription ? `${currentDescription} ${transcript}` : transcript;
                  setCurrentDescription(newText);
                }}
                language="es"
                className="h-8 w-8 p-0"
              />
            </div>
          </div>
          <Button onClick={addPost} className="w-full">
            Agregar al Plan
          </Button>
        </div>

        {/* Posts List */}
        {posts.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Publicaciones Programadas ({posts.length})</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {posts.map((post, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <Badge variant="secondary">{post.day} {post.time}</Badge>
                  <Badge>{CONTENT_TYPES.find(t => t.id === post.type)?.label}</Badge>
                  <p className="text-sm flex-1">{post.description}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPosts(posts.filter((_, i) => i !== idx))}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Hashtags Sugeridos</label>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-primary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-between pt-4 border-t">
          <Button variant="outline" onClick={exportPlan} disabled={posts.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleComplete}>Completar Paso</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
