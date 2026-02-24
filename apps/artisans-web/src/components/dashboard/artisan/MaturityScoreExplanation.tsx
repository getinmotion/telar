import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { 
  Lightbulb, 
  Users, 
  Target, 
  DollarSign, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreExplanation {
  category: string;
  score: number;
  icon: React.ReactNode;
  color: string;
  explanation: string;
  calculation: string;
  improvements: string[];
  recommendedAgent?: {
    id: string;
    name: string;
    icon: string;
  };
}

interface MaturityScoreExplanationProps {
  isOpen: boolean;
  onClose: () => void;
  category?: 'ideaValidation' | 'userExperience' | 'marketFit' | 'monetization';
  score: number;
  hasCompletedTest: boolean;
}

const categoryDetails: Record<string, {
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  explanations: {
    pending: string;
    low: string;
    medium: string;
    high: string;
  };
  calculation: string;
  improvements: string[];
  agent?: { id: string; name: string; icon: string };
}> = {
  ideaValidation: {
    title: 'Validación de Idea',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    explanations: {
      pending: 'Completa el test de madurez para descubrir qué tan validada está tu idea de negocio.',
      low: 'Tu idea aún necesita validación. No has probado suficiente con clientes reales o no tienes clara tu propuesta de valor.',
      medium: 'Has validado algunos aspectos de tu idea, pero aún hay áreas por explorar. Tienes feedback inicial pero necesitas más datos.',
      high: '¡Excelente! Tu idea está bien validada. Tienes evidencia clara de que tu producto resuelve un problema real y hay demanda.',
    },
    calculation: 'Se calcula en base a: si has vendido productos, tienes clientes recurrentes, conoces tu mercado objetivo, y has recibido feedback positivo.',
    improvements: [
      'Vende tus primeros 5 productos a clientes diferentes',
      'Recolecta feedback directo de tus compradores',
      'Define claramente quién es tu cliente ideal',
      'Identifica qué problema específico resuelves'
    ],
    agent: { id: 'market-researcher', name: 'Investigador de Mercado', icon: 'Search' }
  },
  userExperience: {
    title: 'Experiencia de Usuario',
    icon: <Users className="w-6 h-6" />,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
    explanations: {
      pending: 'Completa el test para evaluar cómo tus clientes experimentan tu producto y marca.',
      low: 'La experiencia que ofreces necesita mejoras. Tus clientes no tienen un viaje fluido desde el descubrimiento hasta la compra.',
      medium: 'Ofreces una experiencia aceptable, pero hay puntos de fricción. Algunos aspectos están bien, otros necesitan pulirse.',
      high: '¡Fantástico! Tus clientes tienen una experiencia memorable. Tu marca es consistente y el proceso de compra es fácil.',
    },
    calculation: 'Evaluamos: si tienes presencia en redes sociales, packaging profesional, proceso de compra claro, y comunicación consistente con clientes.',
    improvements: [
      'Crea una tienda en línea o mejora tu catálogo',
      'Diseña un empaque distintivo para tus productos',
      'Establece presencia consistente en redes sociales',
      'Facilita el proceso de pedido y entrega'
    ],
    agent: { id: 'brand-consultant', name: 'Consultor de Marca', icon: 'Palette' }
  },
  marketFit: {
    title: 'Ajuste al Mercado',
    icon: <Target className="w-6 h-6" />,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/30',
    explanations: {
      pending: 'Completa el test para medir qué tan bien encajas en tu mercado objetivo.',
      low: 'Aún no has encontrado tu lugar en el mercado. No está claro quién compra tus productos o por qué te eligen a ti.',
      medium: 'Tienes cierto ajuste al mercado. Algunos clientes te encuentran y compran, pero no hay crecimiento consistente.',
      high: '¡Perfecto! Hay un claro ajuste producto-mercado. Tus clientes te buscan activamente y recomiendan tus productos.',
    },
    calculation: 'Consideramos: si conoces tu competencia, tienes diferenciadores claros, sabes dónde están tus clientes, y tienes ventas consistentes.',
    improvements: [
      'Investiga quién más hace productos similares',
      'Define qué te hace único y diferente',
      'Identifica los lugares donde están tus clientes',
      'Busca feedback sobre por qué compran contigo'
    ],
    agent: { id: 'market-researcher', name: 'Investigador de Mercado', icon: 'Search' }
  },
  monetization: {
    title: 'Monetización',
    icon: <DollarSign className="w-6 h-6" />,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    explanations: {
      pending: 'Completa el test para conocer tu nivel de madurez en generación de ingresos.',
      low: 'No has logrado monetizar consistentemente. No tienes ventas regulares o no conoces tus costos reales.',
      medium: 'Estás generando algunos ingresos, pero hay inconsistencia. Tienes ventas pero no un sistema claro de precios o finanzas.',
      high: '¡Excelente! Tienes un sistema de monetización sólido. Vendes regularmente, conoces tus márgenes, y controlas tus finanzas.',
    },
    calculation: 'Medimos: si has tenido ventas, cómo defines precios, si llevas control financiero, y si conoces tu rentabilidad por producto.',
    improvements: [
      'Registra tus primeras 3 ventas',
      'Calcula el costo real de cada producto',
      'Define precios que cubran costos + utilidad',
      'Lleva un registro simple de ingresos y gastos'
    ],
    agent: { id: 'price-consultant', name: 'Consultor de Precios', icon: 'DollarSign' }
  }
};

export const MaturityScoreExplanation: React.FC<MaturityScoreExplanationProps> = ({
  isOpen,
  onClose,
  category = 'ideaValidation',
  score,
  hasCompletedTest
}) => {
  const navigate = useNavigate();
  const details = categoryDetails[category];

  const getScoreLevel = (score: number) => {
    if (!hasCompletedTest) return 'pending';
    if (score < 40) return 'low';
    if (score < 70) return 'medium';
    return 'high';
  };

  const level = getScoreLevel(score);
  const explanation = details.explanations[level as keyof typeof details.explanations];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent variant="neumorphic" className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-3 text-2xl font-display", details.color)}>
            {details.icon}
            {details.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Score Display */}
          <div className={cn("neumorphic-inset p-6 rounded-xl", details.bgColor)}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">
                  {hasCompletedTest ? 'Tu Puntuación' : 'Sin Evaluar'}
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {hasCompletedTest ? `${score}%` : '—'}
                </p>
              </div>
              <div className="text-right">
                <Badge 
                  className={cn(
                    "text-sm font-semibold px-3 py-1 shadow-neumorphic-inset",
                    !hasCompletedTest && "bg-muted text-muted-foreground",
                    level === 'low' && "bg-destructive/10 text-destructive border-destructive/30",
                    level === 'medium' && "bg-warning/10 text-warning-foreground border-warning/30",
                    level === 'high' && "bg-success/10 text-success border-success/30"
                  )}
                >
                  {!hasCompletedTest && '⊘ Pendiente de Test'}
                  {level === 'low' && <AlertCircle className="w-4 h-4 inline mr-1" />}
                  {level === 'medium' && <TrendingUp className="w-4 h-4 inline mr-1" />}
                  {level === 'high' && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                  {level === 'low' && 'Nivel Inicial'}
                  {level === 'medium' && 'Nivel Intermedio'}
                  {level === 'high' && 'Nivel Avanzado'}
                </Badge>
              </div>
            </div>
            {hasCompletedTest && (
              <Progress value={score} className="h-2" />
            )}
          </div>

          {/* Explanation */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {hasCompletedTest ? '¿Qué significa este score?' : '¿Qué evalúa esta categoría?'}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          </div>

          {/* Calculation Method */}
          {hasCompletedTest && (
            <div className="neumorphic-inset rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                📊 Cómo se calculó
              </h4>
              <p className="text-sm text-muted-foreground">
                {details.calculation}
              </p>
            </div>
          )}

          {/* Improvements */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              💡 Cómo mejorar este score
            </h3>
            <ul className="space-y-2">
              {details.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
