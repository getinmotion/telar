import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, WifiOff } from 'lucide-react';
import { SANS } from '@/components/dashboard/dashboardStyles';
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

type Severity = 'warning' | 'suggestion' | 'info';

const SEVERITY_STYLES: Record<Severity, { color: string; bg: string; border: string; icon: string }> = {
  warning:    { color: '#b45309', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.18)', icon: 'warning' },
  suggestion: { color: '#1d4ed8', bg: 'rgba(37,99,235,0.07)',  border: 'rgba(37,99,235,0.18)',  icon: 'lightbulb' },
  info:       { color: 'rgba(84,67,62,0.55)', bg: 'rgba(84,67,62,0.04)', border: 'rgba(84,67,62,0.1)', icon: 'info' },
};

function InsightItem({ insight }: { insight: ModerationInsight }) {
  const s = SEVERITY_STYLES[insight.severity] ?? SEVERITY_STYLES.info;

  return (
    <div style={{ borderRadius: 10, border: `1px solid ${s.border}`, background: s.bg, padding: '8px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: s.color, flexShrink: 0, marginTop: 1 }}>
          {s.icon}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontFamily: SANS, fontSize: 11, lineHeight: 1.45, fontWeight: 500, color: s.color, margin: 0 }}>{insight.message}</p>
          {insight.suggested_value && (
            <p style={{ fontFamily: SANS, fontSize: 10, marginTop: 3, opacity: 0.75, color: s.color }}>
              → {insight.suggested_value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ productId, analysisData, className }) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ai-moderation-analysis', productId],
    queryFn: () => analyzeModerationProduct(analysisData),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className={className}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'rgba(124,58,237,0.1)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#7c3aed' }}>auto_awesome</span>
          </div>
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: 'rgba(84,67,62,0.8)' }}>Análisis IA</span>
        </div>
        {isLoading && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: 9999, background: 'rgba(124,58,237,0.06)', padding: '2px 8px', fontFamily: SANS, fontSize: 10, color: '#7c3aed' }}>
            <Loader2 style={{ width: 10, height: 10 }} className="animate-spin" />
            Analizando…
          </span>
        )}
        {data && (
          <span style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.4)' }}>
            {data.insights.length} hallazgo{data.insights.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 48, borderRadius: 10, background: 'rgba(84,67,62,0.06)' }} className="animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, borderRadius: 10, border: '1px dashed rgba(84,67,62,0.15)', background: 'rgba(84,67,62,0.03)', padding: '20px 16px', textAlign: 'center' }}>
          <WifiOff style={{ width: 24, height: 24, color: 'rgba(84,67,62,0.25)' }} />
          <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.5)', margin: 0 }}>No se pudo conectar con el agente IA.</p>
          <button
            onClick={() => refetch()}
            style={{ borderRadius: 9999, border: '1px solid rgba(84,67,62,0.15)', background: 'white', padding: '4px 12px', fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(84,67,62,0.6)', cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* AI result */}
      {data && (
        <>
          {/* Quality score + summary */}
          <div style={{ borderRadius: 10, border: '1px solid rgba(124,58,237,0.15)', background: 'linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(109,40,217,0.04) 100%)', padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9999, background: 'white', boxShadow: '0 1px 4px rgba(21,27,45,0.08)', border: '1px solid rgba(124,58,237,0.12)' }}>
                <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 800, color: '#7c3aed' }}>{data.quality_score}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(124,58,237,0.6)', marginBottom: 2 }}>Calidad IA</p>
                <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(124,58,237,0.9)', lineHeight: 1.4, margin: 0 }}>{data.summary}</p>
              </div>
            </div>
          </div>

          {/* Suggested category */}
          {data.suggested_category && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, border: '1px solid rgba(124,58,237,0.18)', background: 'rgba(124,58,237,0.05)', padding: '8px 12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#7c3aed', flexShrink: 0 }}>sell</span>
              <div>
                <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(124,58,237,0.6)' }}>Categoría sugerida</span>
                <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#7c3aed', margin: 0 }}>{data.suggested_category}</p>
              </div>
            </div>
          )}

          {/* Insights list */}
          {data.insights.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.insights.map((insight, i) => (
                <InsightItem key={i} insight={insight} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, border: '1px solid rgba(21,128,61,0.18)', background: 'rgba(21,128,61,0.06)', padding: '8px 12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#15803d', flexShrink: 0 }}>check_circle</span>
              <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, color: '#15803d', margin: 0 }}>
                Sin inconsistencias detectadas. Producto listo para revisión.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
