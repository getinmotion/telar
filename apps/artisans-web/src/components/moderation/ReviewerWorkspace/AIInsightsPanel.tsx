import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles, AlertTriangle, Lightbulb, Info,
  Loader2, WifiOff, CheckCircle2, Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  analyzeModerationProduct,
  type ModerationAnalyzeRequest,
  type ModerationInsight,
} from '@/services/agents.actions';

interface AIInsightsPanelProps {
  productId: string;
  analysisData: ModerationAnalyzeRequest;
  className?: string;
}

const SEVERITY_CONFIG = {
  warning: {
    Icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    dot: 'bg-amber-400',
  },
  suggestion: {
    Icon: Lightbulb,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
    dot: 'bg-blue-400',
  },
  info: {
    Icon: Info,
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    iconColor: 'text-gray-400',
    dot: 'bg-gray-300',
  },
} as const;

function InsightItem({ insight }: { insight: ModerationInsight }) {
  const cfg = SEVERITY_CONFIG[insight.severity] ?? SEVERITY_CONFIG.info;
  const { Icon } = cfg;

  return (
    <div className={cn('rounded-xl border px-3 py-2.5', cfg.bg, cfg.border)}>
      <div className="flex items-start gap-2">
        <div className={cn('mt-0.5 h-5 w-5 flex-shrink-0 rounded-full flex items-center justify-center', cfg.bg)}>
          <Icon className={cn('h-3.5 w-3.5', cfg.iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-xs leading-snug font-medium', cfg.text)}>{insight.message}</p>
          {insight.suggested_value && (
            <p className={cn('text-[10px] mt-1 opacity-75', cfg.text)}>
              → {insight.suggested_value}
            </p>
          )}
        </div>
      </div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100">
            <Sparkles className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <span className="text-xs font-semibold text-gray-800">Análisis IA</span>
        </div>
        {isLoading && (
          <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] text-violet-600">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Analizando…
          </span>
        )}
        {data && (
          <span className="text-[10px] text-gray-400">
            {data.insights.length} hallazgo{data.insights.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center">
          <WifiOff className="h-6 w-6 text-gray-300" />
          <p className="text-xs text-gray-500">No se pudo conectar con el agente IA.</p>
          <button
            onClick={() => refetch()}
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* AI result */}
      {data && (
        <>
          {/* Quality score + summary */}
          <div className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-violet-100">
                <span className="text-lg font-bold text-violet-600 tabular-nums">{data.quality_score}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 mb-0.5">
                  Calidad IA
                </p>
                <p className="text-xs text-violet-900 leading-snug">{data.summary}</p>
              </div>
            </div>
          </div>

          {/* Suggested category */}
          {data.suggested_category && (
            <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2">
              <Tag className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-semibold text-violet-500 uppercase tracking-wide">Categoría sugerida</span>
                <p className="text-xs font-medium text-violet-800">{data.suggested_category}</p>
              </div>
            </div>
          )}

          {/* Insights list */}
          {data.insights.length > 0 ? (
            <div className="space-y-1.5">
              {data.insights.map((insight, i) => (
                <InsightItem key={i} insight={insight} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <p className="text-xs font-medium text-emerald-700">
                Sin inconsistencias detectadas. Producto listo para revisión.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
