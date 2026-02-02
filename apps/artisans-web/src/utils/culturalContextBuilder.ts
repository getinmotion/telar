/**
 * Construye un contexto cultural detallado para generación de contenido con IA
 * Extrae información de la historia, región, productos y técnicas del artesano
 */

interface Product {
  name: string;
  description?: string | null;
  category?: string | null;
  techniques?: any;
  materials?: any;
  tags?: any;
  images?: any;
}

interface Shop {
  about_content?: any;
  story?: string | null;
  region?: string | null;
  craft_type?: string | null;
  description?: string | null;
}

export function buildCulturalContext(shop: Shop, products?: Product[]): string {
  const parts: string[] = [];
  
  // 1. Extraer historia del artesano (máxima prioridad)
  const story = shop.about_content?.story || shop.story;
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
  if (shop.craft_type) {
    parts.push(`ESPECIALIDAD: ${shop.craft_type}`);
  }
  
  // 4. Descripción general de la tienda
  if (shop.description && shop.description !== shop.craft_type) {
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
