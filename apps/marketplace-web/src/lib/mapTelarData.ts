// // Map telar.co product data to marketplace format
// export interface TelarProduct {
//   id: string;
//   shop_id: string;
//   name: string;
//   description: string;
//   short_description?: string;
//   price: number;
//   compare_price?: number;
//   images: any; // JSONB - array in JSON
//   category: string;
//   subcategory?: string;
//   tags?: any; // JSONB
//   inventory: number;
//   sku?: string;
//   weight?: number;
//   dimensions?: any;
//   materials?: any; // JSONB
//   techniques?: any; // JSONB
//   production_time?: string;
//   customizable: boolean;
//   active: boolean;
//   featured: boolean;
//   created_at: string;
//   updated_at: string;
//   made_to_order: boolean;
//   lead_time_days?: number;
// }

// export interface TelarShop {
//   id: string;
//   shop_name: string;
//   shop_slug: string;
//   description?: string;
//   logo_url?: string;
//   banner_url?: string;
//   craft_type?: string;
//   region?: string;
//   featured: boolean;
//   active: boolean;
// }

// // export interface MarketplaceProduct {
// //   id: string;
// //   name: string;
// //   description?: string;
// //   short_description?: string;
// //   price: number;
// //   compare_price?: number;
// //   image_url?: string;
// //   images?: string[];
// //   store_name?: string;
// //   store_slug?: string;
// //   store_logo?: string;
// //   category?: string;
// //   subcategory?: string;
// //   craft?: string;
// //   tags?: string[];
// //   materials?: string[];
// //   techniques?: string[];
// //   is_new?: boolean;
// //   stock?: number;
// //   customizable?: boolean;
// //   featured?: boolean;
// //   made_to_order?: boolean;
// //   lead_time_days?: number;
// //   created_at?: string;
// //   rating?: number;
// //   reviews_count?: number;
// //   free_shipping?: boolean;
// //   // Campos de control de compra
// //   can_purchase?: boolean;
// //   store_bank_status?: string;
// //   shipping_data_complete?: boolean;
// //   ready_for_checkout?: boolean;
// // }

// export const mapTelarProduct = (
//   telarProduct: TelarProduct, 
//   shop?: TelarShop
// ): MarketplaceProduct => {
//   // Parse JSONB fields safely
//   const parseJsonbArray = (field: any): string[] => {
//     if (!field) return [];
//     if (Array.isArray(field)) return field;
//     try {
//       const parsed = typeof field === 'string' ? JSON.parse(field) : field;
//       return Array.isArray(parsed) ? parsed : [];
//     } catch {
//       return [];
//     }
//   };

//   const images = parseJsonbArray(telarProduct.images);
  
//   const createdDate = new Date(telarProduct.created_at);
//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
//   return {
//     id: telarProduct.id,
//     name: telarProduct.name,
//     description: telarProduct.description,
//     short_description: telarProduct.short_description,
//     price: Number(telarProduct.price),
//     compare_price: telarProduct.compare_price ? Number(telarProduct.compare_price) : undefined,
//     image_url: images[0] || undefined,
//     images: images,
//     store_name: shop?.shop_name || 'Tienda',
//     store_slug: shop?.shop_slug,
//     store_logo: shop?.logo_url,
//     category: telarProduct.category,
//     subcategory: telarProduct.subcategory,
//     tags: parseJsonbArray(telarProduct.tags),
//     materials: parseJsonbArray(telarProduct.materials),
//     techniques: parseJsonbArray(telarProduct.techniques),
//     is_new: createdDate > thirtyDaysAgo,
//     stock: telarProduct.inventory,
//     customizable: telarProduct.customizable,
//     featured: telarProduct.featured,
//     made_to_order: telarProduct.made_to_order,
//     lead_time_days: telarProduct.lead_time_days,
//     created_at: telarProduct.created_at,
//   };
// };

// export const mapTelarProducts = (
//   telarProducts: TelarProduct[], 
//   shop?: TelarShop
// ): MarketplaceProduct[] => {
//   return telarProducts.map(product => mapTelarProduct(product, shop));
// };
