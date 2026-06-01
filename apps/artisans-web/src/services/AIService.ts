/**
 * AIService — frontend abstraction layer for all AI calls.
 * UI components never import ai.actions directly; they use this service.
 * Context (artisan profile, craft type, region) is always injected automatically.
 */

import {
  refineContent,
  analyzeImage,
  generateShopHeroSlide,
} from './ai.actions';
import type { AnalyzeImageResponse } from './ai.actions';

// ─── Context ──────────────────────────────────────────────────────────────────

export interface AIContext {
  shopName: string;
  craftType: string;
  region: string;        // same as department
  municipality: string;
  brandClaim: string;
  artisanProfile: any;   // full artisanProfile JSONB from artisan_shops
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIHeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  suggestedImage?: string;
  imageUrl?: string;
}

export interface AIFaqItem {
  q: string;
  a: string;
}

// ─── Service class ────────────────────────────────────────────────────────────

class AIService {
  constructor(private ctx: AIContext) {}

  /**
   * Suggest 3 brand taglines based on artisan context.
   * Uses shop_description context with a creative userPrompt.
   */
  async suggestTagline(current = 'sin tagline'): Promise<string[]> {
    const { ctx } = this;
    const location = ctx.municipality || ctx.region || 'Colombia';
    const craft = ctx.craftType || 'artesanía';

    const res = await refineContent({
      context: 'shop_description',
      currentValue: current,
      userPrompt: `Sugiere exactamente 3 taglines creativos de máximo 8 palabras para una tienda artesanal colombiana de ${craft} en ${location}. Devuelve solo las 3 opciones separadas por salto de línea, sin numeración ni puntos ni guiones.`,
      additionalContext: {
        craftType: ctx.craftType,
        region: ctx.region,
        municipality: ctx.municipality,
      },
    });

    return res.refinedContent
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length <= 80)
      .slice(0, 3);
  }

  /**
   * Analyze uploaded hero/banner images for coherence with craft type.
   */
  async analyzeHeroImages(urls: string[]): Promise<AnalyzeImageResponse> {
    return analyzeImage({ images: urls.slice(0, 3) });
  }

  /**
   * Generate hero slide content using artisan context.
   */
  async generateHeroSlides(count = 3): Promise<AIHeroSlide[]> {
    const { ctx } = this;
    const res = await generateShopHeroSlide({
      shopName: ctx.shopName,
      craftType: ctx.craftType,
      description:
        ctx.artisanProfile?.shortBio ??
        ctx.artisanProfile?.learnedFromDetail ??
        '',
      brandClaim: ctx.brandClaim,
      count,
    });

    return ((res as any).slides ?? []).map((s: any, i: number) => ({
      id: `ai-${Date.now()}-${i}`,
      ...s,
    }));
  }

  /**
   * Generate a return policy from structured Q&A answers.
   * Uses shop_mission context to get professional, aspirational text.
   */
  async generateReturnPolicy(answers: {
    days: string;
    acceptCustom: boolean;
  }): Promise<string> {
    const { ctx } = this;
    const customNote = answers.acceptCustom
      ? 'Se aceptan devoluciones en piezas personalizadas con condiciones especiales'
      : 'No se aceptan devoluciones en piezas personalizadas';

    const res = await refineContent({
      context: 'shop_mission',
      currentValue: `Política de devoluciones. Días para solicitar: ${answers.days}. Piezas personalizadas: ${customNote}.`,
      userPrompt:
        'Redacta una política de devoluciones completa, clara y profesional en español para esta tienda artesanal colombiana. Incluye: ventana de tiempo, condiciones del producto, proceso de solicitud, y excepciones. Máximo 200 palabras. Usa un tono cálido y cercano.',
      additionalContext: {
        craftType: ctx.craftType,
        shopName: ctx.shopName,
      },
    });

    return res.refinedContent;
  }

  /**
   * Generate FAQ suggestions based on artisan context.
   * Parses response using P:/R: block format.
   */
  async generateFAQ(): Promise<AIFaqItem[]> {
    const { ctx } = this;
    const craft = ctx.craftType || 'artesanía';
    const location = ctx.region || 'Colombia';

    const res = await refineContent({
      context: 'shop_description',
      currentValue: 'Preguntas frecuentes de tienda artesanal',
      userPrompt: `Genera exactamente 4 preguntas frecuentes con respuestas para una tienda artesanal de ${craft} en ${location}. Usa este formato estricto sin variaciones:\nP: [pregunta]\nR: [respuesta]\n---`,
      additionalContext: {
        craftType: ctx.craftType,
        region: ctx.region,
      },
    });

    const raw = res.refinedContent;
    const blocks = raw
      .split('---')
      .map(b => b.trim())
      .filter(Boolean);

    const parsed: AIFaqItem[] = blocks
      .map(block => {
        const pMatch = block.match(/P:\s*(.+)/i);
        const rMatch = block.match(/R:\s*([\s\S]+)/i);
        return {
          q: pMatch?.[1]?.trim() ?? '',
          a: rMatch?.[1]?.trim() ?? '',
        };
      })
      .filter(item => item.q && item.a)
      .slice(0, 4);

    // Fallback: if no '---' separators found, try regex extraction
    if (parsed.length === 0) {
      const fallbackMatches = [
        ...raw.matchAll(/P:\s*(.+?)\s*R:\s*([\s\S]+?)(?=P:|$)/gi),
      ];
      return fallbackMatches
        .map(m => ({ q: m[1]?.trim() ?? '', a: m[2]?.trim() ?? '' }))
        .filter(item => item.q && item.a)
        .slice(0, 4);
    }

    return parsed;
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export const createAIService = (ctx: AIContext): AIService =>
  new AIService(ctx);

export type { AIService };
