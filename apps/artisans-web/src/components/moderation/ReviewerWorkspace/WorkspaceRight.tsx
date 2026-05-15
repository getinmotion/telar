import React, { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ModerationHistory } from '../ModerationHistory';
import { AIInsightsPanel } from './AIInsightsPanel';
import { HealthScoreRing } from './HealthScoreRing';
import type { ModerationProduct, ModerationHistory as ModerationHistoryType } from '@/hooks/useProductModeration';
import type { ModerationAnalyzeRequest } from '@/services/agents.actions';

interface WorkspaceRightProps {
  product: ModerationProduct;
  history: ModerationHistoryType[];
}

function computeLocalHealthScore(product: ModerationProduct): number {
  let score = 60;
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];

  // Imágenes (0-30)
  if (images.length === 0) score -= 20;
  else if (images.length >= 3) score += 15;
  else score += 5;

  // Historia/descripción (0-20)
  const descLen = (product.description ?? '').trim().length;
  if (descLen === 0) score -= 15;
  else if (descLen >= 100) score += 15;
  else if (descLen >= 40) score += 8;

  // Atributos (0-20)
  if (product.materials && product.materials.length > 0) score += 10;
  if (product.category && product.category !== 'all') score += 10;

  // Logística (0-15)
  if (product.shipping_data_complete) score += 15;
  else score -= 5;

  return Math.max(0, Math.min(100, score));
}

export const WorkspaceRight: React.FC<WorkspaceRightProps> = ({ product, history }) => {
  const localScore = useMemo(() => computeLocalHealthScore(product), [product]);

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
      <div className="flex flex-col gap-5 p-4">
        {/* Health Score local */}
        <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-3">
          <HealthScoreRing score={localScore} size="sm" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Calidad estimada
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Basado en completitud de campos
            </p>
          </div>
        </div>

        <Separator />

        {/* AI Insights */}
        <AIInsightsPanel
          productId={product.id}
          analysisData={analysisData}
        />

        {/* History */}
        {history.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold mb-2">Historial de moderación</p>
              <ModerationHistory history={history} />
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
};
