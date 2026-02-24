import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface DiagnosisScore {
  score: number;
  reasoning: string;
}

interface BrandDiagnosisResultsProps {
  diagnosis: {
    scores: {
      logo: DiagnosisScore;
      color: DiagnosisScore;
      typography: DiagnosisScore;
      claim: DiagnosisScore;
      global_identity: DiagnosisScore;
    };
    average_score: number;
    summary: string;
    strengths: string[];
    opportunities: string[];
    risks: string[];
  };
  generatedMissions: {
    title: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  onViewMissions?: () => void;
}

export const BrandDiagnosisResults: React.FC<BrandDiagnosisResultsProps> = ({
  diagnosis,
  generatedMissions,
  onViewMissions
}) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Celebrate with confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-success';
    if (score >= 3) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 4) return <CheckCircle2 className="w-5 h-5 text-success" />;
    if (score >= 3) return <AlertTriangle className="w-5 h-5 text-warning" />;
    return <XCircle className="w-5 h-5 text-destructive" />;
  };

  const getOverallStatus = () => {
    const avg = diagnosis.average_score;
    if (avg >= 4) return { text: 'Excelente', color: 'bg-success text-white', emoji: '🌟' };
    if (avg >= 3) return { text: 'Buena', color: 'bg-warning text-white', emoji: '👍' };
    if (avg >= 2) return { text: 'Mejorable', color: 'bg-amber-500 text-white', emoji: '🔧' };
    return { text: 'Necesita Trabajo', color: 'bg-destructive text-white', emoji: '🚧' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overall Score Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Award className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl">Diagnóstico de Marca Completo</CardTitle>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`px-6 py-3 rounded-full ${overallStatus.color} text-2xl font-bold`}>
              {overallStatus.emoji} {diagnosis.average_score.toFixed(1)}/5
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {overallStatus.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground text-lg">
            {diagnosis.summary}
          </p>
        </CardContent>
      </Card>

      {/* Scores by Area */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Evaluación por Dimensión</CardTitle>
          <CardDescription>
            Análisis detallado de cada aspecto de tu identidad de marca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(diagnosis.scores.logo.score)}
                <span className="font-semibold">Logo</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(diagnosis.scores.logo.score)}`}>
                {diagnosis.scores.logo.score}/5
              </span>
            </div>
            <Progress value={diagnosis.scores.logo.score * 20} className="h-2" />
            <p className="text-sm text-muted-foreground">{diagnosis.scores.logo.reasoning}</p>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(diagnosis.scores.color.score)}
                <span className="font-semibold">Sistema de Color</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(diagnosis.scores.color.score)}`}>
                {diagnosis.scores.color.score}/5
              </span>
            </div>
            <Progress value={diagnosis.scores.color.score * 20} className="h-2" />
            <p className="text-sm text-muted-foreground">{diagnosis.scores.color.reasoning}</p>
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(diagnosis.scores.typography.score)}
                <span className="font-semibold">Tipografía</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(diagnosis.scores.typography.score)}`}>
                {diagnosis.scores.typography.score}/5
              </span>
            </div>
            <Progress value={diagnosis.scores.typography.score * 20} className="h-2" />
            <p className="text-sm text-muted-foreground">{diagnosis.scores.typography.reasoning}</p>
          </div>

          {/* Claim */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(diagnosis.scores.claim.score)}
                <span className="font-semibold">Claim / Mensaje</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(diagnosis.scores.claim.score)}`}>
                {diagnosis.scores.claim.score}/5
              </span>
            </div>
            <Progress value={diagnosis.scores.claim.score * 20} className="h-2" />
            <p className="text-sm text-muted-foreground">{diagnosis.scores.claim.reasoning}</p>
          </div>

          {/* Global Identity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(diagnosis.scores.global_identity.score)}
                <span className="font-semibold">Identidad Global</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(diagnosis.scores.global_identity.score)}`}>
                {diagnosis.scores.global_identity.score}/5
              </span>
            </div>
            <Progress value={diagnosis.scores.global_identity.score * 20} className="h-2" />
            <p className="text-sm text-muted-foreground">{diagnosis.scores.global_identity.reasoning}</p>
          </div>
        </CardContent>
      </Card>

      {/* Strengths, Opportunities, Risks */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Strengths */}
        <Card className="border-success/30 bg-success/5">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Fortalezas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnosis.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-warning flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnosis.opportunities.map((opportunity, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-warning mt-0.5">→</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Risks */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Riesgos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnosis.risks.map((risk, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-destructive mt-0.5">!</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Generated Missions */}
      {generatedMissions.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Misiones Generadas ({generatedMissions.length})
            </CardTitle>
            <CardDescription>
              Hemos creado misiones específicas para mejorar tu identidad de marca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {generatedMissions.map((mission, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-background border"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={mission.priority === 'high' ? 'destructive' : mission.priority === 'medium' ? 'default' : 'secondary'}
                  >
                    {mission.priority === 'high' ? 'Alta' : mission.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                  <span className="font-medium">{mission.title}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          size="lg"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          Ver Misiones en Taller Digital
          <ArrowRight className="w-4 h-4" />
        </Button>
        {onViewMissions && (
          <Button
            size="lg"
            variant="outline"
            onClick={onViewMissions}
          >
            Ver Detalles de Misiones
          </Button>
        )}
      </div>
    </div>
  );
};
