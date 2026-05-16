import React, { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModerationHistory } from '../ModerationHistory';
import { AIInsightsPanel } from './AIInsightsPanel';
import { HealthScoreRing } from './HealthScoreRing';
import { Image, FileText, Tag, Truck, History } from 'lucide-react';
import { SANS } from '@/components/dashboard/dashboardStyles';
import type { ModerationProduct, ModerationHistory as ModerationHistoryType } from '@/hooks/useProductModeration';
import type { ModerationAnalyzeRequest } from '@/services/agents.actions';

interface WorkspaceRightProps {
  product: ModerationProduct;
  history: ModerationHistoryType[];
}

interface ScoreDimension {
  label: string;
  key: keyof ScoreBreakdown;
  icon: React.ElementType;
  max: number;
  color: string;
}

interface ScoreBreakdown {
  images: number;
  description: number;
  attributes: number;
  logistics: number;
}

function computeScoreBreakdown(product: ModerationProduct): ScoreBreakdown {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];

  let imageScore = 0;
  if (images.length >= 3) imageScore = 30;
  else if (images.length === 2) imageScore = 20;
  else if (images.length === 1) imageScore = 10;

  const descLen = (product.description ?? '').trim().length;
  let descScore = 0;
  if (descLen >= 150) descScore = 30;
  else if (descLen >= 80) descScore = 22;
  else if (descLen >= 40) descScore = 12;
  else if (descLen > 0) descScore = 6;

  let attrScore = 0;
  if (product.materials && product.materials.length > 0) attrScore += 12;
  if (product.category && product.category !== 'all') attrScore += 13;

  const logisticsScore = product.shipping_data_complete ? 15 : 0;

  return { images: imageScore, description: descScore, attributes: attrScore, logistics: logisticsScore };
}

const SCORE_DIMENSIONS: ScoreDimension[] = [
  { label: 'Fotos',       key: 'images',      icon: Image,    max: 30, color: '#6366f1' },
  { label: 'Historia',    key: 'description', icon: FileText, max: 30, color: '#8b5cf6' },
  { label: 'Atributos',   key: 'attributes',  icon: Tag,      max: 25, color: '#a78bfa' },
  { label: 'Logística',   key: 'logistics',   icon: Truck,    max: 15, color: '#c4b5fd' },
];

function scoreColor(pct: number): string {
  if (pct < 40) return '#f87171';   // red-400
  if (pct < 75) return '#fbbf24';   // amber-400
  return '#34d399';                  // emerald-400
}

function DimensionBar({ label, icon: Icon, value, max, color }: { label: string; icon: React.ElementType; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: `${color}30` }}>
        <Icon style={{ width: 14, height: 14, color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{label}</span>
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: scoreColor(pct) }}>
            {value}/{max}
          </span>
        </div>
        <div style={{ height: 6, width: '100%', borderRadius: 9999, background: 'rgba(255,255,255,0.1)' }}>
          <div style={{ height: '100%', borderRadius: 9999, transition: 'width 0.5s', width: `${pct}%`, backgroundColor: pct < 40 ? '#ef4444' : pct < 75 ? '#f59e0b' : color }} />
        </div>
      </div>
    </div>
  );
}

function scoreInterpretation(score: number): { bg: string; color: string; text: string } {
  if (score >= 75) return { bg: 'rgba(52,211,153,0.12)', color: '#34d399', text: 'Este producto cumple con los criterios de calidad del marketplace TELAR.' };
  if (score >= 50) return { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', text: 'El producto necesita mejoras antes de destacarse en el marketplace.' };
  return { bg: 'rgba(248,113,113,0.12)', color: '#f87171', text: 'Calidad insuficiente — requiere revisión antes de aprobarse.' };
}

export const WorkspaceRight: React.FC<WorkspaceRightProps> = ({ product, history }) => {
  const breakdown = useMemo(() => computeScoreBreakdown(product), [product]);
  const totalScore = useMemo(() => Object.values(breakdown).reduce((a, b) => a + b, 0), [breakdown]);
  const interp = scoreInterpretation(totalScore);

  const analysisData: ModerationAnalyzeRequest = useMemo(() => ({
    product_id: product.id,
    name: product.name,
    short_description: product.short_description,
    category_name: product.category,
    materials: product.materials ?? [],
    image_urls: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
    price: product.price,
    shop_name: product.artisan_shops?.shop_name,
    shop_region: product.artisan_shops?.region,
  }), [product]);

  return (
    <ScrollArea className="h-full">
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* ── Health Score Card ──────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg, #151b2d 0%, #1e2842 100%)', padding: 16 }}>
          <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
            Calidad del producto
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <HealthScoreRing score={totalScore} size="lg" dark className="flex-shrink-0" />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SCORE_DIMENSIONS.map((dim) => (
                <DimensionBar
                  key={dim.key}
                  label={dim.label}
                  icon={dim.icon}
                  value={breakdown[dim.key]}
                  max={dim.max}
                  color={dim.color}
                />
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12, borderRadius: 8, padding: '8px 12px', fontFamily: SANS, fontSize: 11, background: interp.bg, color: interp.color }}>
            {interp.text}
          </div>
        </div>

        {/* ── AI Insights ───────────────────────────────────── */}
        <div style={{ padding: 16, borderBottom: '1px solid rgba(84,67,62,0.06)' }}>
          <AIInsightsPanel productId={product.id} analysisData={analysisData} />
        </div>

        {/* ── Historial ─────────────────────────────────────── */}
        {history.length > 0 && (
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <History style={{ width: 13, height: 13, color: 'rgba(84,67,62,0.35)' }} />
              <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'rgba(84,67,62,0.7)', margin: 0 }}>Historial de moderación</p>
              <span style={{ marginLeft: 'auto', borderRadius: 9999, background: 'rgba(84,67,62,0.06)', padding: '1px 6px', fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.5)' }}>
                {history.length}
              </span>
            </div>
            <ModerationHistory history={history} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
