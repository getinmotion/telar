import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BrandAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: string;
  }[];
  next_steps: string[];
}

interface BrandEvaluationResultsProps {
  analysis: BrandAnalysis;
  onClose: () => void;
}

export const BrandEvaluationResults: React.FC<BrandEvaluationResultsProps> = ({
  analysis,
  onClose
}) => {
  const navigate = useNavigate();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-moss-green-600';
    if (score >= 50) return 'text-golden-hour-600';
    return 'text-terracotta-600';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 50) return 'Buena Base';
    return 'Necesita Mejoras';
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Score Card */}
      <Card variant="glass" className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className={`text-6xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}%
              </div>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="text-lg px-4 py-1">
                {getScoreLabel(analysis.score)}
              </Badge>
              <Progress value={analysis.score} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {analysis.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-moss-green-600" />
              Fortalezas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-moss-green-600 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-golden-hour-600" />
              Áreas de Mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-golden-hour-600 mt-1">!</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Top Recommendations */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recomendaciones Prioritarias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm">{rec.title}</h4>
                  <Badge variant={getPriorityBadge(rec.priority)}>
                    {getPriorityLabel(rec.priority)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>💡 Impacto: {rec.impact}</span>
                  <span>⏱️ Esfuerzo: {rec.effort}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => {
            onClose();
            navigate('/marca');
          }}
          className="flex-1"
        >
          Ver Plan Completo de Mejora
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};
