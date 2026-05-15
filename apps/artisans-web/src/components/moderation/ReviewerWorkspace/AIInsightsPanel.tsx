import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, AlertTriangle, Lightbulb, Info, Loader2, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyzeModerationProduct, type ModerationAnalyzeRequest, type ModerationInsight } from '@/services/agents.actions';
import { HealthScoreRing } from './HealthScoreRing';

interface AIInsightsPanelProps {
  productId: string;
  analysisData: ModerationAnalyzeRequest;
  className?: string;
}

const SEVERITY_CONFIG = {
  warning: {
    Icon: AlertTriangle,
    colors: 'border-amber-200 bg-amber-50 text-amber-700',
    iconColor: 'text-amber-500',
  },
  suggestion: {
    Icon: Lightbulb,
    colors: 'border-blue-200 bg-blue-50 text-blue-700',
    iconColor: 'text-blue-500',
  },
  info: {
    Icon: Info,
    colors: 'border-muted bg-muted/30 text-muted-foreground',
    iconColor: 'text-muted-foreground',
  },
} as const;

function InsightItem({ insight }: { insight: ModerationInsight }) {
  const cfg = SEVERITY_CONFIG[insight.severity] ?? SEVERITY_CONFIG.info;
  const { Icon } = cfg;

  return (
    <div className={cn('rounded-md border px-2.5 py-2 space-y-0.5', cfg.colors)}>
      <div className="flex items-start gap-1.5">
        <Icon className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0', cfg.iconColor)} />
        <p className="text-xs leading-snug">{insight.message}</p>
      </div>
      {insight.suggested_value && (
        <p className="text-[10px] pl-5 font-medium opacity-80">
          Sugerido: {insight.suggested_value}
        </p>
      )}
    </div>
  );
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  productId,
  analysisData,
  className,
}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ai-moderation-analysis', productId],
    queryFn: () => analyzeModerationProduct(analysisData),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Sparkles className="h-3.5 w-3.5 text-violet-500" />
        Análisis IA
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-4 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
          <span>Analizando calidad y coherencia...</span>
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-dashed px-3 py-4 text-center">
          <WifiOff className="mx-auto h-5 w-5 text-muted-foreground/50 mb-1.5" />
          <p className="text-xs text-muted-foreground">No se pudo conectar con el agente.</p>
          <button
            onClick={() => refetch()}
            className="mt-1.5 text-[10px] text-primary underline underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      )}

      {data && (
        <>
          {/* Score ring */}
          <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
            <HealthScoreRing score={data.quality_score} size="sm" />
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Calidad IA
              </p>
              <p className="text-xs text-foreground leading-snug mt-0.5">{data.summary}</p>
            </div>
          </div>

          {/* Suggested category */}
          {data.suggested_category && (
            <div className="rounded-md border border-violet-200 bg-violet-50 px-2.5 py-2 text-xs text-violet-700">
              <p className="font-medium">Categoría sugerida</p>
              <p className="mt-0.5">{data.suggested_category}</p>
            </div>
          )}

          {/* Insights */}
          {data.insights.length > 0 && (
            <div className="space-y-1.5">
              {data.insights.map((insight, i) => (
                <InsightItem key={i} insight={insight} />
              ))}
            </div>
          )}

          {data.insights.length === 0 && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs text-emerald-700">
              Sin inconsistencias detectadas por la IA.
            </div>
          )}
        </>
      )}
    </div>
  );
};
