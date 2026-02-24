import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Search, TrendingUp, Users, DollarSign, Download, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface MarketResearchModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  stepTitle: string;
}

interface MarketInsight {
  category: string;
  title: string;
  content: string;
  icon: any;
}

export const MarketResearchModal: React.FC<MarketResearchModalProps> = ({
  open,
  onClose,
  onComplete,
  stepTitle
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [craftType, setCraftType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && user) {
      loadBusinessContext();
    }
  }, [open, user]);

  useEffect(() => {
    const completedSteps = [
      craftType.trim(),
      insights.length > 0,
      notes.length > 50
    ].filter(Boolean).length;
    setProgress((completedSteps / 3) * 100);
  }, [craftType, insights, notes]);

  const loadBusinessContext = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_master_context')
      .select('conversation_insights')
      .eq('user_id', user.id)
      .single();

    if (data?.conversation_insights) {
      const ci = data.conversation_insights as any;
      setCraftType(ci.tipo_artesania || '');
      setBusinessName(ci.nombre_marca || '');
    }
  };

  const performMarketResearch = async () => {
    if (!craftType.trim()) {
      toast({
        title: 'Tipo de artesanía requerido',
        description: 'Especifica qué tipo de productos produces',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('intelligent-web-search', {
        body: {
          query: `mercado ${craftType} artesanal Colombia 2024 tendencias precios canales venta`,
          context: `Investigación de mercado para ${businessName || 'negocio de ' + craftType}`
        }
      });

      if (error) throw error;

      if (data?.summary) {
        const parsedInsights: MarketInsight[] = [
          {
            category: 'Tendencias',
            title: 'Tendencias del Mercado',
            content: data.summary,
            icon: TrendingUp
          },
          {
            category: 'Precios',
            title: 'Rango de Precios',
            content: 'Analiza la información obtenida para identificar rangos de precios en tu categoría',
            icon: DollarSign
          },
          {
            category: 'Competencia',
            title: 'Panorama Competitivo',
            content: 'Identifica quiénes son tus principales competidores y qué los diferencia',
            icon: Users
          }
        ];

        setInsights(parsedInsights);

        toast({
          title: '🔍 Investigación completada',
          description: 'Datos de mercado obtenidos exitosamente'
        });
      }
    } catch (error) {
      console.error('Error performing market research:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la investigación de mercado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (insights.length === 0) {
      toast({
        title: 'Realiza la investigación',
        description: 'Primero busca información del mercado',
        variant: 'destructive'
      });
      return;
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast({
      title: '📊 ¡Investigación completada!',
      description: 'Insights de mercado registrados'
    });

    onComplete({
      craftType,
      insights: insights.map(i => ({
        category: i.category,
        title: i.title,
        content: i.content
      })),
      notes,
      researchDate: new Date().toISOString()
    });

    onClose();
  };

  const exportResearch = () => {
    const report = `
INVESTIGACIÓN DE MERCADO
${craftType.toUpperCase()}
${businessName ? `Negocio: ${businessName}` : ''}

${insights.map(insight => `
${insight.category.toUpperCase()}
${insight.title}
${insight.content}
`).join('\n')}

NOTAS Y CONCLUSIONES
${notes}

---
Generado el ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investigacion-mercado-${craftType.replace(/\s+/g, '-')}.txt`;
    a.click();

    toast({
      title: '📥 Reporte exportado',
      description: 'Investigación descargada exitosamente'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Search className="w-5 h-5 text-primary" />
            Investigador de Mercado
          </DialogTitle>
          <DialogDescription>
            Obtén insights sobre tu mercado, competencia y tendencias actuales
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2 mb-4" />

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Tipo de Artesanía</label>
                <input
                  type="text"
                  value={craftType}
                  onChange={(e) => setCraftType(e.target.value)}
                  placeholder="Ej: cerámica, textiles, joyería..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <Button
                onClick={performMarketResearch}
                disabled={loading || !craftType.trim()}
                className="mt-auto"
              >
                {loading ? (
                  <>Buscando...</>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Investigar
                  </>
                )}
              </Button>
            </div>

            {businessName && (
              <p className="text-sm text-muted-foreground">
                Investigando para: <span className="font-semibold">{businessName}</span>
              </p>
            )}
          </div>

          {/* Market Insights */}
          {insights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Insights de Mercado</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <insight.icon className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">{insight.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {insight.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Notas y Conclusiones de tu Investigación
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe tus conclusiones, oportunidades identificadas, decisiones a tomar..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Documenta tus hallazgos clave y cómo aplicarlos a tu negocio
            </p>
          </div>

          {/* SWOT Suggestions */}
          {insights.length > 0 && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">💡 Análisis Recomendado</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Identifica tus <strong>fortalezas</strong> frente a la competencia</li>
                <li>• Reconoce áreas de <strong>mejora</strong> en tu oferta</li>
                <li>• Detecta <strong>oportunidades</strong> en el mercado</li>
                <li>• Anticipa posibles <strong>amenazas</strong> o riesgos</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={exportResearch}
            disabled={insights.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
            <Button onClick={handleComplete}>Completar Investigación</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
