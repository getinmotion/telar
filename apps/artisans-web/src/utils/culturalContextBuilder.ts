/**
 * Construye un contexto cultural detallado para generación de contenido con IA
 * Extrae información de la historia, región, productos y técnicas del artesano
 */

import { ArtisanShop } from "@/types/artisanShop.types";
import { Product } from "@/types/product.types";



export function buildCulturalContext(shop: ArtisanShop, products?: Product[]): string {
  const parts: string[] = [];

  // 1. Extraer historia del artesano (máxima prioridad)
  const story = shop.aboutContent?.story || shop.story;
  if (story && story.length > 20) {
    // Tomar las primeras 400 caracteres de la historia
    const storyExcerpt = story.slice(0, 400);
    parts.push(`HISTORIA DEL ARTESANO: ${storyExcerpt}`);
  }

  // 2. Región específica (crucial para contexto cultural)
  if (shop.region) {
    parts.push(`UBICACIÓN: ${shop.region}`);
  }

  // 3. Tipo de artesanía específica
  if (shop.craftType) {
    parts.push(`ESPECIALIDAD: ${shop.craftType}`);
  }

  // 4. Descripción general de la tienda
  if (shop.description && shop.description !== shop.craftType) {
    parts.push(`DESCRIPCIÓN: ${shop.description.slice(0, 200)}`);
  }

  // 5. Productos específicos con sus características
  if (products && products.length > 0) {
    const productDetails = products
      .slice(0, 5)
      .map(p => {
        const details: string[] = [p.name];

        if (p.description) {
          details.push(p.description.slice(0, 100));
        }

        if (p.category) {
          details.push(`(${p.category})`);
        }

        return details.join(' - ');
      })
      .join(', ');

    parts.push(`PRODUCTOS ESPECÍFICOS: ${productDetails}`);
  }

  // 6. Técnicas artesanales específicas
  if (products && products.length > 0) {
    const allTechniques = products
      .flatMap(p => p.techniques || [])
      .filter(Boolean)
      .filter((t, i, arr) => arr.indexOf(t) === i) // únicos
      .join(', ');

    if (allTechniques) {
      parts.push(`TÉCNICAS ARTESANALES: ${allTechniques}`);
    }
  }

  // 7. Materiales utilizados
  if (products && products.length > 0) {
    const allMaterials = products
      .flatMap(p => p.materials || [])
      .filter(Boolean)
      .filter((m, i, arr) => arr.indexOf(m) === i) // únicos
      .join(', ');

    if (allMaterials) {
      parts.push(`MATERIALES: ${allMaterials}`);
    }
  }

  return parts.join('\n\n');
}
