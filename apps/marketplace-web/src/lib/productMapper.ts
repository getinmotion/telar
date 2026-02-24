// Utilidad temporal para mapear productos desde la tabla 'products'
// hasta que se resuelva el problema con la vista marketplace_products

import { normalizeCraft } from './normalizationUtils';


export function mapArtisanCategory(artisanCategory: string | null | undefined): string {
  if (!artisanCategory) return 'Decoración del Hogar';
  
  const upper = artisanCategory.toUpperCase();
  
  // Joyería y Accesorios
  if (upper.includes('JOYERÍA') || upper.includes('JOYERIA') || 
      upper.includes('BISUTERÍA') || upper.includes('BISUTERIA')) {
    return 'Joyería y Accesorios';
  }
  
  // Textiles y Moda
  if (upper.includes('TEJED') || upper.includes('TEXTIL') || 
      upper.includes('TELAR') || upper.includes('ROPA') || 
      upper.includes('MODA') || upper.includes('BUFANDA')) {
    return 'Textiles y Moda';
  }
  
  // Bolsos y Carteras
  if (upper.includes('CESTE') || upper.includes('BOLSO') || 
      upper.includes('CARTERA') || upper.includes('MOCHILA') || 
      upper.includes('CANASTA') || upper.includes('MORRAL')) {
    return 'Bolsos y Carteras';
  }
  
  // Decoración del Hogar
  if (upper.includes('DECORACIÓN') || upper.includes('DECORACION') || 
      upper.includes('ADORNO') || upper.includes('TAPIZ')) {
    return 'Decoración del Hogar';
  }
  
  // Vajillas y Cocina
  if (upper.includes('CERÁMICA') || upper.includes('CERAMICA') || 
      upper.includes('VAJILLA') || upper.includes('ALFARERÍA') || 
      upper.includes('ALFARERIA') || upper.includes('COCINA')) {
    return 'Vajillas y Cocina';
  }
  
  // Muebles
  if (upper.includes('MUEBLE') || upper.includes('CARPINTERÍA') || 
      upper.includes('CARPINTERIA') || upper.includes('EBANISTERÍA') || 
      upper.includes('EBANISTERIA')) {
    return 'Muebles';
  }
  
  // Arte y Esculturas
  if (upper.includes('ESCULTURA') || upper.includes('TALLA') || 
      upper.includes('ARTE') || upper.includes('PINTURA')) {
    return 'Arte y Esculturas';
  }
  
  // Cosmética
  if (upper.includes('COSMET') || upper.includes('JABÓN') || upper.includes('JABON')) {
    return 'Decoración del Hogar';
  }
  
  // Otros
  if (upper.includes('OTROS') || upper.includes('OTHER')) {
    return 'Decoración del Hogar';
  }
  
  // Por defecto
  return 'Decoración del Hogar';
}

// export function mapProductToMarketplace(product: any): MarketplaceProduct {
//   const images = product.images || [];
//   // Priorizar image_url de la vista, luego primer elemento del array
//   const imageUrl = product.image_url || (Array.isArray(images) && images.length > 0 ? images[0] : null);
  
//   // Usar is_new de la vista si existe, sino calcular
//   const isNew = product.is_new ?? (product.created_at 
//     ? new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//     : false);
  
//   // Determinar si el producto puede ser comprado
//   // can_purchase requiere: tienda lista + stock disponible
//   const hasStock = (product.inventory ?? product.stock ?? 0) > 0;
//   const storeReady = product.can_purchase ?? (
//     product.store_bank_status === 'complete' && 
//     product.shipping_data_complete === true
//   );
//   const canPurchase = storeReady && hasStock;
  
//   return {
//     id: product.id,
//     shop_id: product.shop_id,
//     name: product.name,
//     description: product.description,
//     short_description: product.short_description,
//     price: product.price || 0,
//     compare_price: product.compare_price,
//     image_url: imageUrl,
//     images: product.images,
//     // Usar datos reales de la vista si existen, con fallbacks
//     store_name: product.store_name || 'Tienda Artesanal',
//     store_slug: product.store_slug || null,
//     store_logo: product.store_logo,
//     banner_url: product.banner_url,
//     craft: product.craft|| 'Artesanía',
//     region: product.region || 'Colombia',
//     store_description: product.store_description,
//     // Usar category de la vista (ya mapeada) o mapear manualmente
//     category: product.category || mapArtisanCategory(product.original_category),
//     original_category: product.original_category || product.category,
//     subcategory: product.subcategory,
//     tags: Array.isArray(product.tags) ? product.tags : [],
//     materials: Array.isArray(product.materials) ? product.materials : [],
//     techniques: Array.isArray(product.techniques) ? product.techniques : [],
//     is_new: isNew,
//     // IMPORTANTE: Priorizar inventory sobre stock porque la vista marketplace_products 
//     // puede tener stock desactualizado mientras que inventory es el valor real
//     stock: product.inventory ?? product.stock ?? 0,
//     customizable: product.customizable || false,
//     featured: product.featured || false,
//     made_to_order: product.made_to_order || false,
//     lead_time_days: product.lead_time_days,
//     created_at: product.created_at,
//     updated_at: product.updated_at,
//     sku: product.sku,
//     active: product.active ?? true,
//     free_shipping: product.free_shipping || false,
//     rating: product.rating || 0,
//     reviews_count: product.reviews_count || 0,
//     // Campos de control de compra
//     can_purchase: canPurchase,
//     store_bank_status: product.store_bank_status,
//     shipping_data_complete: product.shipping_data_complete,
//     ready_for_checkout: product.ready_for_checkout,
//     // Campo para retiro en local
//     allows_local_pickup: product.allows_local_pickup || false,
//   };
// }

