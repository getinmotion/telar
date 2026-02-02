import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateBrandCompleteness } from '@/utils/brandValidation';
import { buildCulturalContext } from '@/utils/culturalContextBuilder';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
}

interface GenerationOptions {
  autoSave?: boolean;
  count?: number;
  referenceText?: string;
  referenceImageFile?: File;
}

export const useAutoHeroGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateHeroSlides = async (
    shopId: string,
    options: GenerationOptions = { autoSave: true, count: 1 }
  ): Promise<{
    success: boolean;
    slides?: HeroSlide[];
    needsBrandInfo?: boolean;
    missingFields?: string[];
    completionPercentage?: number;
  }> => {
    setIsGenerating(true);
    
    try {
      // 1. Obtener información de la tienda (incluyendo about_content y story)
      const { data: shop, error: shopError } = await supabase
        .from('artisan_shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (shopError || !shop) {
        throw new Error('No se pudo cargar la información de la tienda');
      }

      // 2. Validar completitud de marca
      const brandValidation = validateBrandCompleteness(shop);
      
      if (!brandValidation.isComplete) {
        toast({
          title: "⚠️ Completa tu Identidad de Marca",
          description: `Para generar hero slides automáticos, necesitas: ${brandValidation.missingFields.join(', ')}`,
          variant: "default",
        });
        
        return {
          success: false,
          needsBrandInfo: true,
          missingFields: brandValidation.missingFields,
          completionPercentage: brandValidation.completionPercentage
        };
      }

      // 3. Obtener productos con información completa (incluyendo técnicas, materiales, imágenes)
      const { data: products } = await supabase
        .from('products')
        .select('name, description, images, category, techniques, materials, tags')
        .eq('shop_id', shopId)
        .eq('active', true)
        .order('featured', { ascending: false })
        .limit(5);

      // 3.1. Construir contexto cultural enriquecido
      const culturalContext = buildCulturalContext(shop, products || []);

      // 4. Llamar a edge function para generar slides
      console.log('[AutoHeroGen] Iniciando generación:', {
        shopId,
        count: options.count,
        shopName: shop.shop_name
      });

      const { data: generatedData, error: genError } = await supabase.functions.invoke(
        'generate-shop-hero-slide',
        {
          body: {
            shopName: shop.shop_name,
            craftType: shop.craft_type,
            description: shop.description || '',
            brandColors: shop.primary_colors || [],
            brandClaim: shop.brand_claim || '',
            count: options.count || 1,
            culturalContext, // NUEVO: contexto cultural enriquecido
            products: products?.slice(0, 3).map(p => ({
              name: p.name,
              description: p.description
            })) || []
          }
        }
      );

      if (genError || !generatedData?.slides) {
        console.error('[AutoHeroGeneration] Edge function error:', genError);
        
        // Detectar error de créditos insuficientes
        const isNoCredits = generatedData?.error === 'NO_CREDITS' || 
                           genError?.message?.includes('402') ||
                           genError?.message?.includes('Payment Required');
        
        if (isNoCredits) {
          toast({
            title: "❌ Sin créditos de Lovable AI",
            description: "Ve a Settings → Workspace → Usage para agregar créditos y continuar generando slides.",
            variant: "destructive",
            duration: 8000
          });
        } else {
          const errorMessage = genError?.message || 'Error generando slides con IA';
          toast({
            title: "Error al generar slides",
            description: errorMessage,
            variant: "destructive"
          });
        }
        
        throw new Error(genError?.message || 'Error generando slides');
      }

      // 5. Generar imágenes SECUENCIALMENTE (no en paralelo) para evitar rate limits
      console.log('[AutoHeroGen] Slides generados:', generatedData.slides.length);
      
      toast({
        title: "🎨 Generando imágenes...",
        description: "Creando imágenes personalizadas con IA",
      });

      // 5.1. Si hay imagen de referencia, optimizarla y subirla primero
      let referenceImageUrl: string | undefined;
      if (options.referenceImageFile) {
        try {
          // Optimize reference image before upload
          console.log('[AutoHeroGen] Optimizing reference image...');
          const optimizedFile = await optimizeImage(options.referenceImageFile, ImageOptimizePresets.hero);
          
          const fileName = `${shopId}/reference-${Date.now()}.${optimizedFile.name.split('.').pop()}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('hero-images')
            .upload(fileName, optimizedFile, {
              contentType: optimizedFile.type,
              upsert: true
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('hero-images')
            .getPublicUrl(fileName);
          
          referenceImageUrl = publicUrl;
          console.log('[AutoHeroGen] Imagen de referencia optimizada y subida:', referenceImageUrl);
        } catch (error) {
          console.error('[AutoHeroGen] Error subiendo imagen de referencia:', error);
          // Continuar sin imagen de referencia
        }
      }

      const imageUrls: string[] = [];
      const placeholderUrls = [
        'https://images.unsplash.com/photo-1452860606245-08befc0ff44b',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
        'https://images.unsplash.com/photo-1515322734716-6e6ed8f2a152'
      ];

      for (let index = 0; index < generatedData.slides.length; index++) {
        const slide = generatedData.slides[index];
        
        toast({
          title: `🎨 Generando imagen ${index + 1}/${generatedData.slides.length}`,
          description: slide.title,
        });

        try {
          // Obtener URLs de imágenes de productos reales para usar como referencia visual
          const productImageUrls = products
            ?.filter(p => p.images && Array.isArray(p.images) && p.images.length > 0)
            .slice(0, 2)
            .map(p => p.images[0])
            .filter(Boolean) || [];

          const { data: imageData, error: imageError } = await supabase.functions.invoke(
            'generate-hero-slide-image',
            {
              body: {
                title: slide.title,
                subtitle: slide.subtitle,
                shopName: shop.shop_name,
                craftType: shop.craft_type,
                brandColors: shop.primary_colors || [],
                brandClaim: shop.brand_claim || '',
                slideIndex: index,
                referenceText: options.referenceText,
                referenceImageUrl,
                culturalContext, // NUEVO: contexto cultural
                productImageUrls // NUEVO: imágenes de productos como referencia
              }
            }
          );

          if (imageError || !imageData?.imageBase64) {
            console.warn(`[AutoHeroGen] Error generando imagen ${index + 1}:`, imageError);
            
            if (imageError?.message?.includes('RATE_LIMIT') || imageError?.message?.includes('429')) {
              toast({
                title: "Límite de generación alcanzado",
                description: "Espera unos minutos antes de generar más imágenes",
                variant: "default"
              });
            } else if (imageError?.message?.includes('NO_CREDITS') || imageError?.message?.includes('402')) {
              toast({
                title: "Sin créditos disponibles",
                description: "Contacta al administrador para recargar créditos",
                variant: "destructive"
              });
            }
            
            imageUrls.push(shop.logo_url || placeholderUrls[index]);
            continue;
          }

          const base64Data = imageData.imageBase64.split(',')[1] || imageData.imageBase64;
          const fileName = `${shopId}/hero-${Date.now()}-${index}.png`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('hero-images')
            .upload(fileName, 
              Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)), 
              {
                contentType: 'image/png',
                upsert: true
              }
            );

          if (uploadError) {
            console.error(`[AutoHeroGen] Error subiendo imagen ${index + 1}:`, uploadError);
            imageUrls.push(shop.logo_url || placeholderUrls[index]);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('hero-images')
            .getPublicUrl(fileName);

          console.log('[AutoHeroGen] Imagen procesada:', {
            index: index + 1,
            uploadSuccess: true,
            publicUrl
          });

          imageUrls.push(publicUrl);

          // Delay para evitar rate limits (solo si hay más slides pendientes)
          if (index < generatedData.slides.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

        } catch (error) {
          console.error(`[AutoHeroGen] Error procesando imagen ${index + 1}:`, error);
          imageUrls.push(shop.logo_url || placeholderUrls[index]);
        }
      }

      const slides: HeroSlide[] = generatedData.slides.map((slide: any, index: number) => ({
        id: `hero-${Date.now()}-${index}`,
        imageUrl: imageUrls[index],
        title: slide.title,
        subtitle: slide.subtitle,
        ctaText: slide.ctaText || 'Ver productos',
        ctaLink: slide.ctaLink || '#productos'
      }));

      // 6. Guardar en hero_config (solo si autoSave está habilitado)
      if (options.autoSave) {
        const { error: updateError } = await supabase
          .from('artisan_shops')
          .update({
            hero_config: {
              autoplay: true,
              duration: 5000,
              slides: slides as any
            } as any
          })
          .eq('id', shopId);

        if (updateError) {
          console.error('[AutoHeroGeneration] Update error:', updateError);
          throw new Error('Error guardando hero slides');
        }

        toast({
          title: "✨ Hero Slides Generados",
          description: "Se crearon 3 hero slides automáticamente para tu tienda",
        });
      }

      return {
        success: true,
        slides
      };

    } catch (error: any) {
      console.error('[AutoHeroGeneration] Error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar los hero slides",
        variant: "destructive",
      });
      
      return { success: false };
      
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateHeroSlides,
    isGenerating
  };
};
