
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  FileText, 
  Download, 
  Share2,
  Settings,
  Target,
  BarChart3
} from 'lucide-react';

interface PremiumSidebarProps {
  profile: { name: string; email: string };
  maturityScores: {
    ideaValidation: number;
    userExperience: number;
    marketFit: number;
    monetization: number;
  };
  language: 'en' | 'es';
}

export const PremiumSidebar: React.FC<PremiumSidebarProps> = ({
  profile,
  maturityScores,
  language
}) => {
  const t = {
    en: {
      insights: 'Creative Insights',
      quickActions: 'Quick Actions',
      maturityScores: 'Maturity Scores',
      ideaValidation: 'Idea Validation',
      userExperience: 'User Experience',
      marketFit: 'Market Fit',
      monetization: 'Monetization',
      documents: 'Documents',
      onePager: 'One Pager',  
      downloadPortfolio: 'Download Portfolio',
      shareProject: 'Share Project',
      settings: 'Settings'
    },
    es: {
      insights: 'Insights Creativos',
      quickActions: 'Acciones Rápidas',
      maturityScores: 'Puntuaciones de Madurez',
      ideaValidation: 'Validación de Idea',
      userExperience: 'Experiencia de Usuario',
      marketFit: 'Encaje de Mercado',
      monetization: 'Monetización',
      documents: 'Documentos',
      onePager: 'One Pager',
      downloadPortfolio: 'Descargar Portfolio',
      shareProject: 'Compartir Proyecto',
      settings: 'Configuración'
    }
  };

  return (
    <div className="space-y-6">
      {/* Creative Insights */}
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            {t[language].insights}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm">{t[language].ideaValidation}</span>
              <span className="text-white text-sm font-medium">{maturityScores.ideaValidation}%</span>
            </div>
            <Progress value={maturityScores.ideaValidation} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm">{t[language].userExperience}</span>
              <span className="text-white text-sm font-medium">{maturityScores.userExperience}%</span>
            </div>
            <Progress value={maturityScores.userExperience} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm">{t[language].marketFit}</span>
              <span className="text-white text-sm font-medium">{maturityScores.marketFit}%</span>
            </div>
            <Progress value={maturityScores.marketFit} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm">{t[language].monetization}</span>
              <span className="text-white text-sm font-medium">{maturityScores.monetization}%</span>
            </div>
            <Progress value={maturityScores.monetization} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            {t[language].quickActions}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border-white/10">
            <FileText className="w-4 h-4 mr-3" />
            {t[language].onePager}
          </Button>
          
          <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border-white/10">
            <Download className="w-4 h-4 mr-3" />
            {t[language].downloadPortfolio}
          </Button>
          
          <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border-white/10">
            <Share2 className="w-4 h-4 mr-3" />
            {t[language].shareProject}
          </Button>
          
          <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border-white/10">
            <Settings className="w-4 h-4 mr-3" />
            {t[language].settings}
          </Button>
        </CardContent>
      </Card>

      {/* Mini Analytics */}
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Resumen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round((maturityScores.ideaValidation + maturityScores.userExperience + 
                          maturityScores.marketFit + maturityScores.monetization) / 4)}%
            </div>
            <div className="text-white/70 text-sm">Progreso General</div>
            <Progress 
              value={Math.round((maturityScores.ideaValidation + maturityScores.userExperience + 
                               maturityScores.marketFit + maturityScores.monetization) / 4)} 
              className="mt-3" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
