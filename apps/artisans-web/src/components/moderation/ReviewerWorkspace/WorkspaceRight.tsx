import React, { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModerationHistory } from '../ModerationHistory';
import { AIInsightsPanel } from './AIInsightsPanel';
import { HealthScoreRing } from './HealthScoreRing';
import { cn } from '@/lib/utils';
import { Image, FileText, Tag, Truck, History } from 'lucide-react';
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

  // Images: 0-30
  let imageScore = 0;
  if (images.length >= 3) imageScore = 30;
  else if (images.length === 2) imageScore = 20;
  else if (images.length === 1) imageScore = 10;

  // Description: 0-30
  const descLen = (product.description ?? '').trim().length;
  let descScore = 0;
  if (descLen >= 150) descScore = 30;
  else if (descLen >= 80) descScore = 22;
  else if (descLen >= 40) descScore = 12;
  else if (descLen > 0) descScore = 6;

  // Attributes: 0-25
  let attrScore = 0;
  if (product.materials && product.materials.length > 0) attrScore += 12;
  if (product.category && product.category !== 'all') attrScore += 13;

  // Logistics: 0-15
  const logisticsScore = product.shipping_data_complete ? 15 : 0;

  return {
    images: imageScore,
    description: descScore,
    attributes: attrScore,
    logistics: logisticsScore,
  };
}

const SCORE_DIMENSIONS: ScoreDimension[] = [
  { label: 'Fotos',       key: 'images',      icon: Image,    max: 30, color: '#6366f1' },
  { label: 'Historia',    key: 'description', icon: FileText, max: 30, color: '#8b5cf6' },
  { label: 'Atributos',   key: 'attributes',  icon: Tag,      max: 25, color: '#a78bfa' },
  { label: 'Logística',   key: 'logistics',   icon: Truck,    max: 15, color: '#c4b5fd' },
];

function DimensionBar({
  label,
  icon: Icon,
  value,
  max,
  color,
}: {
  label: string;
  icon: React.ElementType;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.round((value / max) * 100);
  const isLow = pct < 40;
  const isMid = pct >= 40 && pct < 75;

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}30` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-white/80">{label}</span>
          <span
            className={cn(
              'text-[10px] font-semibold tabular-nums',
              isLow ? 'text-red-400' : isMid ? 'text-amber-300' : 'text-emerald-400',
            )}
          >
            {value}/{max}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: isLow ? '#ef4444' : isMid ? '#f59e0b' : color,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export const WorkspaceRight: React.FC<WorkspaceRightProps> = ({ product, history }) => {
  const breakdown = useMemo(() => computeScoreBreakdown(product), [product]);
  const totalScore = useMemo(
    () => Object.values(breakdown).reduce((a, b) => a + b, 0),
    [breakdown],
  );

  const analysisData: ModerationAnalyzeRequest = useMemo(
    () => ({
      product_id: product.id,
      name: product.name,
      short_description: product.short_description,
      category_name: product.category,
      materials: product.materials ?? [],
      image_urls: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
      price: product.price,
      shop_name: product.artisan_shops?.shop_name,
      shop_region: product.artisan_shops?.region,
    }),
    [product],
  );

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-0">

        {/* ── Health Score Card ──────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#151b2d] to-[#1e2842] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-3">
            Calidad del producto
          </p>
          <div className="flex items-center gap-4">
            <HealthScoreRing score={totalScore} size="lg" dark className="flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
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
          {/* Score interpretation */}
          <div className={cn(
            'mt-3 rounded-lg px-3 py-2 text-xs',
            totalScore >= 75 ? 'bg-emerald-500/15 text-emerald-300' :
            totalScore >= 50 ? 'bg-amber-500/15 text-amber-300' :
            'bg-red-500/15 text-red-300',
          )}>
            {totalScore >= 75
              ? 'Este producto cumple con los criterios de calidad del marketplace TELAR.'
              : totalScore >= 50
              ? 'El producto necesita mejoras antes de destacarse en el marketplace.'
              : 'Calidad insuficiente — requiere revisión antes de aprobarse.'}
          </div>
        </div>

        {/* ── AI Insights ───────────────────────────────────── */}
        <div className="p-4 border-b border-gray-100">
          <AIInsightsPanel
            productId={product.id}
            analysisData={analysisData}
          />
        </div>

        {/* ── Historial ─────────────────────────────────────── */}
        {history.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <History className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-xs font-semibold text-gray-700">Historial de moderación</p>
              <span className="ml-auto rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
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
