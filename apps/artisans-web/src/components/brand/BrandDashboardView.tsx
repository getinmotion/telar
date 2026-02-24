import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, TrendingUp, Award, Lightbulb, AlertTriangle, RefreshCw, Edit, Palette, Brush, Type, MessageSquare, Star } from 'lucide-react';
import { LogoEditModal } from './LogoEditModal';
import { ColorPaletteModal } from './ColorPaletteModal';
import { ClaimEditorModal } from './ClaimEditorModal';

interface BrandDashboardViewProps {
  diagnosis: any;
  generatedMissions: any[];
  brandName: string;
  logoUrl: string | null;
  colorSystem: {
    primary_colors: string[];
    secondary_colors: string[];
  };
  claim: string;
  onRedoDiagnosis: () => void;
  onElementUpdated: (element: 'logo' | 'colors' | 'claim', newDiagnosis: any) => void;
}

export const BrandDashboardView: React.FC<BrandDashboardViewProps> = ({
  diagnosis,
  generatedMissions,
  brandName,
  logoUrl,
  colorSystem,
  claim,
  onRedoDiagnosis,
  onElementUpdated
}) => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState<'logo' | 'colors' | 'claim' | null>(null);

  const averageScore = diagnosis?.average_score || 0;
  const scorePercentage = (averageScore / 5) * 100;

  const getScoreStatus = (score: number) => {
    if (score >= 4) return { label: 'Excelente', color: 'text-success', bg: 'bg-success/10' };
    if (score >= 3) return { label: 'Buena', color: 'text-primary', bg: 'bg-primary/10' };
    return { label: 'Necesita mejoras', color: 'text-warning', bg: 'bg-warning/10' };
  };

  const status = getScoreStatus(averageScore);

  const dimensions = [
    { key: 'logo', label: 'Logo', Icon: Palette },
    { key: 'color', label: 'Color', Icon: Brush },
    { key: 'typography', label: 'Tipografía', Icon: Type },
    { key: 'claim', label: 'Claim', Icon: MessageSquare },
    { key: 'global_identity', label: 'Identidad Global', Icon: Star }
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Hero Score Card */}
        <Card className={`border-2 ${status.bg}`}>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="mb-2">{brandName}</Badge>
              <h1 className="text-3xl font-bold">Identidad de Marca</h1>
              
              <div className="flex items-center justify-center gap-4 my-6">
                <div className={`text-6xl font-bold ${status.color}`}>
                  {averageScore.toFixed(1)}/5
                </div>
                <div className="text-left">
                  <div className={`text-xl font-semibold ${status.color}`}>{status.label}</div>
                  <div className="text-sm text-muted-foreground">
                    Evaluado el {new Date(diagnosis.evaluated_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
              
              <Progress value={scorePercentage} className="h-3" />
              
              <Button onClick={onRedoDiagnosis} variant="outline" className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-diagnosticar Todo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Editable Elements Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Logo Card */}
          <Card className="relative hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                {logoUrl && (
                  <img src={logoUrl} alt="Logo" className="w-full h-48 object-contain rounded" />
                )}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" /> Logo
                    </span>
                    <Badge variant="secondary" className={diagnosis?.scores?.logo ? getScoreStatus(diagnosis.scores.logo.score).color : ''}>
                      {diagnosis?.scores?.logo?.score?.toFixed(1) || '?'}/5
                    </Badge>
                  </div>
                  <Button onClick={() => setEditMode('logo')} variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Palette Card */}
          <Card className="relative hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <Brush className="w-4 h-4 text-primary" /> Colores
                  </span>
                  <Badge variant="secondary" className={diagnosis?.scores?.color ? getScoreStatus(diagnosis.scores.color.score).color : ''}>
                    {diagnosis?.scores?.color?.score?.toFixed(1) || '?'}/5
                  </Badge>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Primarios:</p>
                  <div className="flex gap-2 flex-wrap">
                    {colorSystem.primary_colors.map((color, idx) => (
                      <div 
                        key={idx} 
                        className="w-12 h-12 rounded-lg border-2 border-border shadow-sm" 
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                {colorSystem.secondary_colors.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Secundarios:</p>
                    <div className="flex gap-2 flex-wrap">
                      {colorSystem.secondary_colors.map((color, idx) => (
                        <div 
                          key={idx} 
                          className="w-12 h-12 rounded-lg border-2 border-border shadow-sm" 
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <Button onClick={() => setEditMode('colors')} variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Ajustar Colores
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Claim Card */}
          <Card className="relative hover:border-primary/50 transition-colors md:col-span-2">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> Claim
                  </span>
                  <Badge variant="secondary" className={diagnosis?.scores?.claim ? getScoreStatus(diagnosis.scores.claim.score).color : ''}>
                    {diagnosis?.scores?.claim?.score?.toFixed(1) || '?'}/5
                  </Badge>
                </div>
                
                <blockquote className="text-lg italic border-l-4 border-primary pl-4 py-2">
                  "{claim || 'Sin claim definido'}"
                </blockquote>
                
                <Button onClick={() => setEditMode('claim')} variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Mejorar Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análisis Detallado (Collapsibles) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Análisis por Dimensión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dimensions.map(({ key, label, Icon }) => {
              const dimensionData = diagnosis?.scores?.[key];
              if (!dimensionData) return null;
              
              const score = dimensionData.score || 0;
              const dimPercentage = (score / 5) * 100;
              const dimStatus = getScoreStatus(score);
              
              return (
                <Collapsible key={key}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={dimStatus.color}>
                          {score.toFixed(1)}/5
                        </Badge>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <Progress value={dimPercentage} className="h-2" />
                    <CollapsibleContent>
                      <div className="mt-3 p-4 bg-muted/50 rounded-lg text-sm">
                        {dimensionData.reasoning || 'Sin análisis detallado'}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>

        {/* Strengths, Opportunities, Risks */}
        {diagnosis?.strengths && diagnosis.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <Award className="w-5 h-5" />
                Fortalezas Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {diagnosis.strengths.map((strength: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
                    <span className="text-success font-bold">✓</span>
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {diagnosis?.opportunities && diagnosis.opportunities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Lightbulb className="w-5 h-5" />
                Oportunidades de Mejora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {diagnosis.opportunities.map((opportunity: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="text-primary font-bold">→</span>
                    <p className="text-sm">{opportunity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {diagnosis?.risks && diagnosis.risks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Riesgos Detectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {diagnosis.risks.map((risk: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                    <span className="text-destructive font-bold">!</span>
                    <p className="text-sm">{risk}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Misiones Generadas */}
        {generatedMissions && generatedMissions.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Misiones de Mejora Generadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {generatedMissions.map((mission: any) => (
                  <div key={mission.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{mission.title}</h4>
                      <Badge variant="outline" className="mt-1">{mission.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Ver Mis Misiones en el Taller Digital
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Modals */}
      {editMode === 'logo' && (
        <LogoEditModal
          currentLogoUrl={logoUrl}
          brandName={brandName}
          onClose={() => setEditMode(null)}
          onSave={(newLogoUrl, newDiagnosis) => {
            onElementUpdated('logo', newDiagnosis);
            setEditMode(null);
          }}
        />
      )}

      {editMode === 'colors' && (
        <ColorPaletteModal
          currentColors={colorSystem}
          brandName={brandName}
          logoUrl={logoUrl}
          onClose={() => setEditMode(null)}
          onSave={(newColors, newDiagnosis) => {
            onElementUpdated('colors', newDiagnosis);
            setEditMode(null);
          }}
        />
      )}

      {editMode === 'claim' && (
        <ClaimEditorModal
          currentClaim={claim}
          brandName={brandName}
          onClose={() => setEditMode(null)}
          onSave={(newClaim, newDiagnosis) => {
            onElementUpdated('claim', newDiagnosis);
            setEditMode(null);
          }}
        />
      )}
    </>
  );
};
