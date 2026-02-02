import React, { useEffect, useState } from 'react';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Palette, Award, Sparkles, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { BrandEvaluationData } from '@/lib/brand/brandEvaluator';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';

export const MasterBrandView: React.FC = () => {
  const { masterState, refreshModule, isLoading } = useMasterAgent();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { context, updateContext, loading: contextLoading } = useUnifiedUserData();
  const [brandEvaluation, setBrandEvaluation] = useState<BrandEvaluationData | null>(null);
  const [loadingEvaluation, setLoadingEvaluation] = useState(true);

  useEffect(() => {
    refreshModule('marca');
    loadBrandEvaluation();
  }, [refreshModule, context]);

  const loadBrandEvaluation = () => {
    setLoadingEvaluation(true);
    try {
      // ✅ FASE 4: Priorizar brand_diagnosis sobre brand_evaluation
      const businessContext = context?.conversationInsights as any;
      
      // Si existe diagnosis, convertir a formato compatible con evaluation
      if (businessContext?.brand_diagnosis) {
        const diagnosis = businessContext.brand_diagnosis;
        const convertedEval: BrandEvaluationData = {
          has_logo: true,
          logo_url: businessContext.brand_evaluation?.logo_url || '',
          logo_quality: 'excellent',
          has_colors: true,
          colors: businessContext.brand_evaluation?.primary_colors || businessContext.brand_evaluation?.colors || [],
          color_consistency: 'high',
          has_claim: true,
          claim: businessContext.brand_evaluation?.claim || '',
          claim_quality: 'clear',
          score: Math.round((diagnosis.average_score / 5) * 100),
          evaluated_at: diagnosis.evaluated_at || new Date().toISOString(),
          recommendations: diagnosis.opportunities?.map((opp: string, idx: number) => ({
            title: `Oportunidad ${idx + 1}`,
            description: opp,
            priority: 'medium'
          })) || [],
          usage_channels: []
        };
        setBrandEvaluation(convertedEval);
      } else if (businessContext?.brand_evaluation) {
        setBrandEvaluation(businessContext.brand_evaluation);
      }
    } catch (error) {
      console.error('Error loading brand evaluation:', error);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  // ✅ NUEVA: Aplicar marca a tienda automáticamente
  const applyBrandToShop = async () => {
    if (!user) return;

    try {
      // 1. Obtener datos de marca desde unified data (ya en cache)
      const businessContext = context?.conversationInsights as any;
      const brandEval = businessContext?.brand_evaluation;
      const businessProfile = context?.businessProfile as any;

      if (!brandEval && !masterState.marca.logo) {
        toast({
          title: "Sin Marca Definida",
          description: "Define tu logo y colores primero.",
          variant: "destructive"
        });
        return;
      }

      // 2. Actualizar automáticamente la tienda con logo y colores
      const { data: shop } = await supabase
        .from('artisan_shops')
        .select('id, shop_name')
        .eq('user_id', user.id)
        .single();

      if (shop) {
        const primaryColor = brandEval?.colors?.[0] || masterState.marca.colores[0] || '#000000';
        const secondaryColor = brandEval?.colors?.[1] || masterState.marca.colores[1] || '#FFFFFF';
        
        await supabase
          .from('artisan_shops')
          .update({
            logo_url: brandEval?.logo_url || masterState.marca.logo,
            shop_name: businessProfile.brand_name || shop.shop_name,
            theme: {
              primary_color: primaryColor,
              secondary_color: secondaryColor,
              colors: brandEval?.colors || masterState.marca.colores
            }
          })
          .eq('id', shop.id);

        // 3. Sincronizar con Master Agent Context
        await refreshModule('marca');
        await refreshModule('tienda');

        toast({
          title: "¡Marca Aplicada!",
          description: "Tu tienda ahora usa tu identidad visual.",
        });
      } else {
        toast({
          title: "Sin Tienda",
          description: "Crea tu tienda primero para aplicar tu marca.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error applying brand to shop:', error);
      toast({
        title: "Error",
        description: "No se pudo aplicar la marca a la tienda.",
        variant: "destructive"
      });
    }
  };

  const hasBrandData = brandEvaluation || masterState.marca.logo || masterState.marca.colores.length > 0 || masterState.marca.claim;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 50) return 'Buena';
    return 'Necesita Mejoras';
  };

  const getRecommendations = () => {
    // ✅ FASE 4: Priorizar opportunities de diagnosis
    const businessContext = context?.conversationInsights as any;
    const diagnosis = businessContext?.brand_diagnosis;
    
    // Si hay diagnosis, usar sus opportunities
    if (diagnosis?.opportunities && diagnosis.opportunities.length > 0) {
      return diagnosis.opportunities;
    }
    
    // Si hay evaluación del AI, usar esas recomendaciones priorizadas
    if (brandEvaluation?.recommendations && brandEvaluation.recommendations.length > 0) {
      return brandEvaluation.recommendations
        .sort((a: any, b: any) => {
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .map((r: any) => `${r.title} - ${r.description}`);
    }

    // Fallback a lógica manual basada en evaluación básica
    const recs: string[] = [];
    
    if (brandEvaluation) {
      // Use evaluation-based recommendations
      if (!brandEvaluation.has_logo) {
        recs.push('Crea un logo profesional que represente tu esencia artesanal');
      } else if (brandEvaluation.logo_quality === 'needs_improvement') {
        recs.push('Considera simplificar tu logo para mejor legibilidad en diferentes tamaños');
      }
      
      if (!brandEvaluation.has_colors) {
        recs.push('Define una paleta de 3-5 colores que representen tu marca');
      } else if (brandEvaluation.color_consistency === 'medium') {
        recs.push('Establece una paleta de colores oficial y úsala consistentemente');
      } else if (brandEvaluation.colors.length < 3) {
        recs.push('Amplía tu paleta con 1-2 colores complementarios para mayor versatilidad');
      }
      
      if (!brandEvaluation.has_claim) {
        recs.push('Crea un claim memorable que comunique tu propuesta de valor única');
      } else if (brandEvaluation.claim_quality === 'needs_work') {
        recs.push('Refina tus ideas en una frase de 5-10 palabras que conecte emocionalmente');
      }
      
      if (brandEvaluation.usage_channels.length < 3) {
        recs.push('Expande la presencia de tu marca a más puntos de contacto con clientes');
      }
    } else {
      // Fallback to original logic
      if (!masterState.marca.logo) {
        recs.push('Añade un logo profesional para dar identidad a tu marca');
      }
      
      if (masterState.marca.colores.length === 0) {
        recs.push('Define tu paleta de colores corporativos');
      } else if (masterState.marca.colores.length < 3) {
        recs.push('Amplía tu paleta de colores (recomendado: 3-5 colores)');
      }
      
      if (!masterState.marca.claim) {
        recs.push('Crea un claim o slogan que represente tu propuesta de valor');
      }
    }

    return recs.length > 0 ? recs : ['✨ Tu identidad visual está completa. Mantenla consistente.'];
  };

  if (isLoading || contextLoading || loadingEvaluation) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const displayScore = brandEvaluation?.score || masterState.marca.score || 0;

  // No brand data - Show minimal setup
  if (!hasBrandData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Configurar Tu Marca</CardTitle>
                <CardDescription>
                  Define la identidad visual de tu negocio
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Tu marca es la primera impresión que tus clientes tendrán de tu negocio.
                Configura estos elementos básicos para empezar:
              </p>
              
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Logo</h4>
                    <p className="text-sm text-muted-foreground">
                      Sube tu logo o crea uno simple con nuestro generador
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Colores Corporativos</h4>
                    <p className="text-sm text-muted-foreground">
                      Elige 3-5 colores que representen tu marca
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Claim o Slogan</h4>
                    <p className="text-sm text-muted-foreground">
                      Una frase corta que comunique tu propuesta de valor
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full">
              <Sparkles className="mr-2 h-5 w-5" />
              Evaluar Mi Marca
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Brand exists - Show review
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Brand Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Análisis de Tu Marca</CardTitle>
                <CardDescription>
                  Evaluación de la identidad visual de tu negocio
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(displayScore)}`}>
                {displayScore}%
              </div>
              <div className="text-sm text-muted-foreground">
                {getScoreLabel(displayScore)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={displayScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Current Brand */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tu Marca Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(brandEvaluation?.has_logo || masterState.marca.logo) && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Logo</label>
                <div className="mt-2 p-4 border rounded-lg flex items-center justify-center bg-secondary/20">
                  {masterState.marca.logo ? (
                    <img src={masterState.marca.logo} alt="Logo" className="max-h-24" loading="lazy" />
                  ) : (
                    <p className="text-sm text-muted-foreground">Logo evaluado pero no visible aquí</p>
                  )}
                </div>
                {brandEvaluation?.logo_quality && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Calidad: {brandEvaluation.logo_quality === 'excellent' ? 'Excelente' : 
                              brandEvaluation.logo_quality === 'good' ? 'Buena' : 'Necesita mejora'}
                  </p>
                )}
              </div>
            )}

            {(brandEvaluation?.colors.length || masterState.marca.colores.length) > 0 && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Colores Corporativos</label>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {(brandEvaluation?.colors || masterState.marca.colores).map((color, idx) => (
                  <div
                      key={idx}
                      className="w-16 h-16 rounded-lg border-2 border-border"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                {brandEvaluation?.color_consistency && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Consistencia: {brandEvaluation.color_consistency === 'high' ? 'Alta' : 
                                  brandEvaluation.color_consistency === 'medium' ? 'Media' : 'Baja'}
                  </p>
                )}
              </div>
            )}

            {(brandEvaluation?.claim || masterState.marca.claim) && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Claim</label>
                <p className="mt-2 p-4 border rounded-lg bg-secondary/20">
                  "{brandEvaluation?.claim || masterState.marca.claim}"
                </p>
                {brandEvaluation?.claim_quality && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Calidad: {brandEvaluation.claim_quality === 'memorable' ? 'Memorable' : 
                             brandEvaluation.claim_quality === 'clear' ? 'Clara' : 'Necesita trabajo'}
                  </p>
                )}
              </div>
            )}
            
            {brandEvaluation?.usage_channels && brandEvaluation.usage_channels.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Canales de Uso</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {brandEvaluation.usage_channels.map((channel, idx) => (
                    <span key={idx} className="px-3 py-1 bg-secondary rounded-full text-xs">
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {getRecommendations().map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2">
              <Button onClick={() => { loadBrandEvaluation(); navigate('/dashboard'); }} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Re-evaluar Mi Marca
              </Button>
              
              {masterState.tienda.has_shop && (
              <Button
                onClick={applyBrandToShop}
                variant="outline"
                className="w-full"
              >
                Aplicar Marca a Tienda
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
