import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Upload, Check, Loader2, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useImageUpload } from '../hooks/useImageUpload';
import { WizardState } from '../hooks/useWizardState';
import { supabase } from '@/integrations/supabase/client';
import { deleteUploadedFile } from '@/services/fileUpload.actions';
import { toast } from 'sonner';
import { EventBus } from '@/utils/eventBus';
import { useGamificationRewards } from '@/hooks/useGamificationRewards';
import { XP_REWARDS } from '@/constants/gamification';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTaskRoutingAnalytics } from '@/hooks/analytics/useTaskRoutingAnalytics';
import { ProductSuccessModal } from '@/components/shop/upload/ProductSuccessModal';

interface Step5ReviewProps {
  wizardState: WizardState;
  onEdit: (step: number) => void;
  onPublish: () => void;
  onPrevious: () => void;
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
  wizardState,
  onEdit,
  onPublish,
  onPrevious,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedProductId, setPublishedProductId] = useState<string>('');
  const [publishedProductName, setPublishedProductName] = useState<string>('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get('taskId');
  const { uploadImages, uploadProgress, isUploading } = useImageUpload();
  const { awardXP } = useGamificationRewards();
  const { updateRoutingCompletion } = useTaskRoutingAnalytics();

  // Check if shipping data is complete
  const hasCompleteShippingData = !!(
    wizardState.weight &&
    wizardState.weight > 0 &&
    wizardState.dimensions?.length &&
    wizardState.dimensions?.width &&
    wizardState.dimensions?.height
  );

  // Comprehensive validation before publishing
  const validateForPublishing = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    console.log('🔍 VALIDACIÓN PRE-PUBLICACIÓN...');
    console.log('📋 Estado del wizard:', {
      imagesCount: wizardState.images.length,
      name: wizardState.name,
      description: wizardState.description?.length,
      price: wizardState.price,
      category: wizardState.category
    });

    if (!wizardState.images || wizardState.images.length === 0) {
      errors.push('Debes subir al menos una imagen');
    }

    if (!wizardState.name?.trim()) {
      errors.push('El nombre del producto es obligatorio');
    }

    if (!wizardState.description?.trim()) {
      errors.push('La descripción del producto es obligatoria');
    }

    if (!wizardState.price || wizardState.price <= 0) {
      errors.push('Debes establecer un precio válido');
    }

    if (!wizardState.category?.trim()) {
      errors.push('Debes seleccionar una categoría');
    }

    console.log('✅ Validación completada:', { isValid: errors.length === 0, errors });
    return { isValid: errors.length === 0, errors };
  };

  // Retry function with exponential backoff
  const retryOperation = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt}/${maxRetries}`);
        const result = await operation();
        console.log(`✅ Operación exitosa en intento ${attempt}`);
        return result;
      } catch (error) {
        console.log(`❌ Intento ${attempt} falló:`, error);

        if (attempt === maxRetries) {
          throw error;
        }

        const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏰ Esperando ${delay}ms antes del próximo intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Máximo número de intentos alcanzado');
  };

  const handlePublish = async () => {
    console.log('🚀 INICIANDO PROCESO DE PUBLICACIÓN ROBUSTO...');

    // Validación inicial
    const validation = validateForPublishing();
    if (!validation.isValid) {
      console.error('❌ VALIDACIÓN FALLIDA:', validation.errors);
      toast.error('Faltan datos obligatorios', {
        description: validation.errors.join(', ')
      });
      return;
    }

    setIsPublishing(true);
    let uploadedImageUrls: string[] = [];

    try {
      // PASO 1: Verificar autenticación con detalles completos
      console.log('🔐 VERIFICANDO AUTENTICACIÓN...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('❌ ERROR DE AUTENTICACIÓN:', authError);
        throw new Error(`Error de autenticación: ${authError.message}`);
      }

      if (!user) {
        console.error('❌ USUARIO NO AUTENTICADO');
        throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
      }

      console.log('✅ USUARIO AUTENTICADO:', {
        id: user.id,
        email: user.email,
        role: user.role || 'authenticated'
      });

      // PASO 2: Verificar tienda del usuario con logging detallado
      console.log('🏪 VERIFICANDO TIENDA DEL USUARIO...');
      const { data: shopData, error: shopError } = await supabase
        .from('artisan_shops')
        .select('id, shop_name, active, user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('🏪 RESULTADO CONSULTA TIENDA:', {
        shopData,
        shopError,
        userId: user.id
      });

      if (shopError) {
        console.error('❌ ERROR CONSULTANDO TIENDA:', shopError);
        throw new Error(`Error verificando tienda: ${shopError.message}`);
      }

      if (!shopData) {
        console.error('❌ TIENDA NO ENCONTRADA PARA USUARIO:', user.id);
        toast.error('No tienes una tienda activa', {
          description: 'Crea tu tienda antes de publicar productos',
          action: {
            label: 'Crear tienda',
            onClick: () => window.location.href = '/crear-tienda'
          }
        });
        throw new Error('No tienes una tienda activa. Crea tu tienda primero.');
      }

      console.log('✅ TIENDA VERIFICADA:', {
        id: shopData.id,
        name: shopData.shop_name,
        user_id: shopData.user_id
      });

      // PASO 3: Validar y subir imágenes
      console.log('📸 PROCESANDO IMÁGENES...');

      if (wizardState.images && wizardState.images.length > 0) {
        console.log(`📤 SUBIENDO ${wizardState.images.length} IMÁGENES...`);
        toast.info('Subiendo imágenes...', {
          description: `Procesando ${wizardState.images.length} imagen(es)`
        });

        try {
          uploadedImageUrls = await uploadImages(wizardState.images);
          console.log('✅ IMÁGENES SUBIDAS EXITOSAMENTE:', uploadedImageUrls);

          if (uploadedImageUrls.length === 0) {
            throw new Error('No se pudieron generar URLs válidas para las imágenes');
          }
        } catch (uploadError) {
          console.error('❌ ERROR SUBIENDO IMÁGENES:', uploadError);
          throw new Error(`Error subiendo imágenes: ${uploadError instanceof Error ? uploadError.message : 'Error desconocido'}`);
        }
      }

      // PASO 4: Preparar datos del producto con validación
      console.log('📦 PREPARANDO DATOS DEL PRODUCTO...');
      const productData = {
        shop_id: shopData.id,
        name: wizardState.name.trim(),
        description: wizardState.description?.trim() || '',
        short_description: wizardState.shortDescription?.trim() || wizardState.description?.trim().substring(0, 150) || '',
        price: Number(wizardState.price) || 0,
        category: wizardState.category?.trim() || '',
        tags: wizardState.tags || [],
        images: uploadedImageUrls,
        inventory: wizardState.inventory || 1,
        weight: wizardState.weight || null,
        dimensions: wizardState.dimensions || null,
        materials: wizardState.materials || [],
        production_time: wizardState.productionTime || null,
        compare_price: wizardState.comparePrice || null,
        sku: wizardState.sku || `PROD-${Date.now()}`,
        customizable: wizardState.customizable || false,
        made_to_order: wizardState.madeToOrder || false,
        lead_time_days: wizardState.leadTimeDays || 7,
        production_time_hours: wizardState.productionTimeHours || null,
        requires_customization: wizardState.requiresCustomization || false,
        active: true,
        featured: false
      };

      console.log('📝 DATOS FINALES DEL PRODUCTO:', {
        shop_id: productData.shop_id,
        name: productData.name,
        price: productData.price,
        category: productData.category,
        images_count: productData.images.length,
        user_id: user.id
      });

      // PASO 5: Insertar producto con manejo de errores RLS específico
      console.log('💾 INSERTANDO PRODUCTO EN BASE DE DATOS...');
      toast.info('Creando producto...', {
        description: 'Guardando en la base de datos'
      });

      // Llamar a la Edge Function para categorización automática y creación
      console.log('🤖 Llamando a edge function para categorización automática...');
      toast.info('Categorizando producto con IA...', {
        description: 'Analizando materiales, técnicas y categoría'
      });

      const { data: functionData, error: productError } = await supabase.functions.invoke('categorize-product', {
        body: {
          shop_id: productData.shop_id,
          name: productData.name,
          description: productData.description,
          short_description: productData.short_description,
          price: productData.price,
          images: productData.images,
          inventory: productData.inventory,
          weight: productData.weight,
          dimensions: productData.dimensions,
          production_time: productData.production_time,
          compare_price: productData.compare_price,
          sku: productData.sku,
          customizable: productData.customizable,
          made_to_order: productData.made_to_order,
          lead_time_days: productData.lead_time_days,
          production_time_hours: productData.production_time_hours,
          requires_customization: productData.requires_customization,
        }
      });

      const createdProduct = functionData?.product;

      console.log('✅ Producto categorizado automáticamente:', {
        id: createdProduct?.id,
        category: functionData?.marketplace_category,
        tags: functionData?.artisan_tags
      });

      if (functionData?.marketplace_category) {
        toast.success('¡Producto categorizado automáticamente!', {
          description: `Categoría: ${functionData.marketplace_category}`
        });
      }

      console.log('📦 RESULTADO INSERCIÓN:', {
        createdProduct,
        productError,
        insertData: productData
      });

      if (productError) {
        console.error('❌ ERROR INSERTANDO PRODUCTO:', {
          message: productError.message,
          details: productError.details,
          hint: productError.hint,
          code: productError.code
        });

        // Manejo específico de errores RLS
        if (productError.message?.includes('row-level security') ||
          productError.code === '42501' ||
          productError.message?.includes('policy')) {
          throw new Error('Error de permisos: No tienes autorización para crear productos en esta tienda');
        }

        // Otros errores específicos
        if (productError.code === '23503') {
          throw new Error('Error de referencia: La tienda especificada no existe');
        }

        if (productError.code === '23505') {
          throw new Error('Error de duplicado: Ya existe un producto con esos datos');
        }

        throw new Error(`Error creando producto: ${productError.message}`);
      }

      if (!createdProduct) {
        throw new Error('No se pudo crear el producto - respuesta vacía del servidor');
      }

      // PASO 6: Insertar variantes si existen
      if (wizardState.hasVariants && wizardState.variants && wizardState.variants.length > 0) {
        console.log('🎨 INSERTANDO VARIANTES...');
        toast.info('Guardando variantes...', {
          description: `Creando ${wizardState.variants.length} variante(s)`
        });

        const variantsToInsert = wizardState.variants.map((variant, index) => ({
          product_id: createdProduct.id,
          option_values: variant.optionValues,
          price: variant.price,
          stock: variant.stock,
          sku: variant.sku || `${productData.sku}-V${String(index + 1).padStart(3, '0')}`,
          status: 'active'
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (variantsError) {
          console.error('⚠️ Error insertando variantes:', variantsError);
          // No lanzar error, solo advertir - el producto ya se creó
          toast.warning('Variantes no guardadas', {
            description: 'El producto se creó pero hubo un error con las variantes'
          });
        } else {
          console.log('✅ Variantes insertadas:', variantsToInsert.length);
        }
      }

      // PASO 7: Verificar inserción con reintentos y timeout
      console.log('🔍 VERIFICANDO INSERCIÓN DEL PRODUCTO...');

      let verifyAttempts = 0;
      const maxVerifyAttempts = 5;
      let verificationSuccessful = false;

      while (verifyAttempts < maxVerifyAttempts && !verificationSuccessful) {
        try {
          const { data: verifyProduct, error: verifyError } = await supabase
            .from('products')
            .select('id, name, shop_id, active, created_at')
            .eq('id', createdProduct.id)
            .single();

          if (!verifyError && verifyProduct) {
            console.log('✅ PRODUCTO VERIFICADO EXITOSAMENTE:', {
              id: verifyProduct.id,
              name: verifyProduct.name,
              shop_id: verifyProduct.shop_id,
              created_at: verifyProduct.created_at
            });
            verificationSuccessful = true;
            break;
          }

          verifyAttempts++;
          console.log(`⏳ Intento de verificación ${verifyAttempts}/${maxVerifyAttempts}...`);

          if (verifyAttempts < maxVerifyAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } catch (verifyError) {
          console.error(`❌ Error en verificación ${verifyAttempts + 1}:`, verifyError);
          verifyAttempts++;
        }
      }

      if (!verificationSuccessful) {
        console.error('❌ NO SE PUDO VERIFICAR LA INSERCIÓN DEL PRODUCTO');
        throw new Error('El producto se creó pero no se puede verificar en la base de datos. Revisa tu tienda manualmente.');
      }

      // PASO 7: Registrar uso del agente de inventario
      console.log('📊 REGISTRANDO USO DEL AGENTE DE INVENTARIO...');
      try {
        const { error: usageError } = await supabase
          .from('agent_usage_metrics')
          .insert({
            user_id: user.id,
            agent_id: 'inventory-manager',
            messages_count: 1,
            session_duration: null
          });

        if (usageError) {
          console.error('⚠️ Error registrando uso del agente:', usageError);
        } else {
          console.log('✅ Uso del agente registrado exitosamente');
        }
      } catch (trackingError) {
        console.error('⚠️ Error en tracking del agente:', trackingError);
      }

      // Calcular si es el primer producto y contar productos después de publicación
      const { count: existingProductsCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', shopData.id);

      const isFirstProduct = (existingProductsCount || 0) === 0;
      const productCount = (existingProductsCount || 0) + 1;

      // PASO 9: 🎯 GAMIFICACIÓN - Otorgar XP por subir producto
      const xpAmount = isFirstProduct
        ? XP_REWARDS.PRODUCT_UPLOAD + XP_REWARDS.FIRST_PRODUCT
        : XP_REWARDS.PRODUCT_UPLOAD;

      const xpReason = isFirstProduct
        ? '¡Primer Producto Subido! 🎉'
        : 'Producto Subido';

      console.log(`🎯 Awarding ${xpAmount} XP for product upload (first: ${isFirstProduct})`);
      await awardXP(xpAmount, xpReason, true, 5);

      // PASO 10: Notify Master Coordinator
      console.log('📢 PUBLICANDO EVENTO AL MASTER COORDINATOR...');
      EventBus.publish('inventory.updated', {
        productId: createdProduct.id,
        shopId: shopData.id,
        action: 'product_created',
        productName: productData.name
      });
      console.log('✅ Evento publicado al Master Coordinator');

      // Publicar evento de milestone para progreso
      EventBus.publish('product.wizard.completed', {
        userId: user.id,
        taskId: taskId || 'inventory-first-products',
        productId: createdProduct.id,
        isFirstProduct,
        productCount: productCount
      });

      // Trigger progress recalculation
      EventBus.publish('master.full.sync', { source: 'product_upload' });

      // 🎯 MARCAR TAREA COMO COMPLETADA si viene desde una tarea
      if (taskId) {
        console.log('🎯 Marking product upload task as completed:', taskId);
        try {
          const { error: taskUpdateError } = await supabase
            .from('agent_tasks')
            .update({
              status: 'completed',
              progress_percentage: 100,
              completed_at: new Date().toISOString()
            })
            .eq('id', taskId)
            .eq('user_id', user.id);

          if (taskUpdateError) {
            console.error('❌ Error updating task status:', taskUpdateError);
          } else {
            console.log('✅ Task marked as completed successfully');
          }
        } catch (taskError) {
          console.error('❌ Error marking task as completed:', taskError);
        }

        // 📊 Update routing analytics
        console.log('📊 Updating routing analytics for task:', taskId);
        await updateRoutingCompletion({
          taskId,
          wasSuccessful: true,
          completionMethod: 'wizard'
        });
      }

      // PASO 11: Éxito confirmado - mostrar modal de éxito
      console.log('🎉 PRODUCTO PUBLICADO EXITOSAMENTE:', {
        id: createdProduct.id,
        name: createdProduct.name,
        shop_id: createdProduct.shop_id
      });

      setPublishedProductId(createdProduct.id);
      setPublishedProductName(productData.name);
      setShowSuccessModal(true);

      // Clear wizard state immediately after successful publish
      onPublish();

      toast.success('¡Producto publicado exitosamente!', {
        description: `"${productData.name}" ya está disponible en tu tienda`,
        duration: 4000
      });

      // Send email notification for product creation based on user preferences
      try {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            userId: user.id,
            type: 'product_created',
            title: '¡Producto creado exitosamente!',
            message: `Tu producto "${productData.name}" ha sido creado y enviado a revisión.`,
            actionUrl: '/mi-tienda'
          }
        });
        console.log('[Step5Review] Email notification sent for product creation');
      } catch (emailError) {
        console.error('[Step5Review] Error sending email notification:', emailError);
        // Don't throw - email failure shouldn't block the flow
      }

      // PASO 12: Producto publicado - modal permanece abierto hasta que usuario decida
      console.log('🏁 PUBLICACIÓN COMPLETADA - Modal de éxito abierto');

    } catch (error) {
      console.error('❌ ERROR CRÍTICO EN PUBLICACIÓN:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        uploadedImages: uploadedImageUrls.length,
        wizardState: {
          name: wizardState.name,
          price: wizardState.price,
          category: wizardState.category,
          images_count: wizardState.images?.length || 0
        }
      });

      // Rollback: limpiar imágenes subidas si el producto falló
      if (uploadedImageUrls.length > 0) {
        console.log('🗑️ INICIANDO ROLLBACK DE IMÁGENES...');
        await Promise.allSettled(
          uploadedImageUrls.map(url =>
            deleteUploadedFile(url).catch(err =>
              console.error('❌ ERROR EN ROLLBACK de imagen:', url, err)
            )
          )
        );
        console.log('✅ ROLLBACK COMPLETADO');
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al publicar producto', {
        description: errorMessage,
        duration: 10000,
        action: {
          label: 'Reintentar',
          onClick: () => handlePublish()
        }
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Save as draft function
  const handleSaveDraft = async () => {
    console.log('💾 GUARDANDO COMO BORRADOR...');

    // Minimal validation for draft
    if (!wizardState.images || wizardState.images.length === 0) {
      toast.error('Debes subir al menos una imagen');
      return;
    }

    if (!wizardState.name?.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }

    if (!wizardState.price || wizardState.price <= 0) {
      toast.error('Debes establecer un precio válido');
      return;
    }

    setIsSavingDraft(true);
    let uploadedImageUrls: string[] = [];

    try {
      // Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuario no autenticado');
      }

      // Get shop
      const { data: shopData, error: shopError } = await supabase
        .from('artisan_shops')
        .select('id, shop_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (shopError || !shopData) {
        throw new Error('No tienes una tienda activa');
      }

      // Upload images
      if (wizardState.images.length > 0) {
        toast.info('Subiendo imágenes...', { description: `Procesando ${wizardState.images.length} imagen(es)` });
        uploadedImageUrls = await uploadImages(wizardState.images);

        if (uploadedImageUrls.length === 0) {
          throw new Error('No se pudieron subir las imágenes');
        }
      }

      // Insert product as draft
      const { data: draftProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          shop_id: shopData.id,
          name: wizardState.name.trim(),
          description: wizardState.description?.trim() || '',
          short_description: wizardState.shortDescription?.trim() || wizardState.description?.trim().substring(0, 150) || '',
          price: Number(wizardState.price) || 0,
          category: wizardState.category?.trim() || '',
          tags: wizardState.tags || [],
          images: uploadedImageUrls,
          inventory: wizardState.inventory || 1,
          weight: wizardState.weight || null,
          dimensions: wizardState.dimensions || null,
          materials: wizardState.materials || [],
          production_time: wizardState.productionTime || null,
          compare_price: wizardState.comparePrice || null,
          sku: wizardState.sku || `DRAFT-${Date.now()}`,
          customizable: wizardState.customizable || false,
          made_to_order: wizardState.madeToOrder || false,
          lead_time_days: wizardState.leadTimeDays || 7,
          production_time_hours: wizardState.productionTimeHours || null,
          requires_customization: wizardState.requiresCustomization || false,
          active: false,
          featured: false,
          moderation_status: 'draft'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error details:', insertError);
        if (insertError.code === '42501' || insertError.message?.includes('policy')) {
          throw new Error('No tienes permisos para crear productos. Verifica que tu tienda esté configurada correctamente.');
        }
        throw new Error(`Error guardando borrador: ${insertError.message}`);
      }

      console.log('✅ BORRADOR GUARDADO:', draftProduct.id);

      // Clear wizard state after successful draft save
      onPublish();

      toast.success('Borrador guardado', {
        description: 'Puedes completar los datos de envío desde tu inventario',
        action: {
          label: 'Ver inventario',
          onClick: () => navigate('/dashboard/inventory')
        }
      });

      // Navigate to inventory
      navigate('/dashboard/inventory');

    } catch (error) {
      console.error('❌ ERROR GUARDANDO BORRADOR:', error);

      // Rollback images if needed
      if (uploadedImageUrls.length > 0) {
        await Promise.allSettled(
          uploadedImageUrls.map(url =>
            deleteUploadedFile(url).catch(err =>
              console.error('Error en rollback de imagen:', url, err)
            )
          )
        );
      }

      toast.error('Error al guardar borrador', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Revisión final</h2>
        <p className="text-muted-foreground">
          Revisa todos los detalles antes de publicar tu producto
        </p>
      </div>

      {/* Product Preview */}
      <Card className="overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Imágenes ({wizardState.images.length})</h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit(0)}>
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {wizardState.images.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Producto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Product Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Nombre del producto</h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-lg font-medium">{wizardState.name}</p>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Descripción</h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {wizardState.description}
            </p>
          </div>

          <Separator />

          {/* Price and Category */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Precio</h3>
                <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xl font-bold text-primary">
                ${wizardState.price?.toLocaleString()} COP
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Categoría</h3>
              <Badge variant="secondary">{wizardState.category}</Badge>
            </div>
          </div>

          {/* Tags */}
          {wizardState.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {wizardState.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Variants */}
          {wizardState.hasVariants && wizardState.variants && wizardState.variants.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Variantes ({wizardState.variants.length})</h3>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {wizardState.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="p-2 bg-muted/50 rounded-lg text-sm"
                    >
                      <div className="flex flex-wrap gap-1 mb-1">
                        {Object.entries(variant.optionValues).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {value}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${variant.price.toLocaleString()} · {variant.stock} unid.
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Stock total: {wizardState.variants.reduce((sum, v) => sum + v.stock, 0)} unidades
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Upload Progress */}
      {isUploading && uploadProgress.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Subiendo imágenes...</h3>
          <div className="space-y-2">
            {uploadProgress.map((progress, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{progress.fileName}</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${progress.status === 'error' ? 'bg-destructive' :
                          progress.status === 'completed' ? 'bg-success' :
                            'bg-primary'
                        }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {progress.status === 'completed' && <Check className="w-4 h-4 text-success" />}
                {progress.status === 'error' && <span className="text-xs text-destructive">{progress.error}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Publish Checklist */}
      <Card className="p-4 bg-muted/30">
        <h3 className="font-semibold mb-3">Lista de verificación</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {wizardState.images.length > 0 ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">Imágenes subidas ({wizardState.images.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {wizardState.name?.trim() ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">Nombre definido</span>
          </div>
          <div className="flex items-center gap-2">
            {wizardState.description?.trim() ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">Descripción completa</span>
          </div>
          <div className="flex items-center gap-2">
            {wizardState.price && wizardState.price > 0 ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">Precio establecido</span>
          </div>
          <div className="flex items-center gap-2">
            {wizardState.category?.trim() ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">Categoría seleccionada</span>
          </div>
          <div className="flex items-center gap-2">
            {hasCompleteShippingData ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 text-warning" />
            )}
            <span className={`text-sm ${!hasCompleteShippingData ? 'text-muted-foreground' : ''}`}>
              Datos de envío (peso y dimensiones)
              {!hasCompleteShippingData && ' - Opcional para borrador'}
            </span>
          </div>
        </div>

        {!hasCompleteShippingData && (
          <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> Puedes guardar como borrador ahora y completar el peso y dimensiones después desde tu inventario.
            </p>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isPublishing || isUploading}
            className="flex items-center gap-2"
          >
            {isSavingDraft ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSavingDraft ? 'Guardando...' : 'Guardar borrador'}
          </Button>

          <Button
            onClick={handlePublish}
            disabled={isPublishing || isUploading || isSavingDraft}
            className="flex items-center gap-2 bg-success hover:bg-success/90"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isPublishing ? 'Enviando...' : 'Enviar a revisión'}
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      <ProductSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onPublish(); // Reset wizard cuando cierra el modal
        }}
        productId={publishedProductId}
        productName={publishedProductName}
        onEditProduct={() => {
          setShowSuccessModal(false);
          navigate(`/productos/editar/${publishedProductId}`);
        }}
        onUploadAnother={() => {
          setShowSuccessModal(false);
          onPublish(); // Reset wizard para nueva carga
        }}
        onViewInventory={() => {
          setShowSuccessModal(false);
          navigate('/dashboard/inventory');
        }}
        onViewShop={() => {
          setShowSuccessModal(false);
          navigate('/mi-tienda');
        }}
      />
    </div>
  );
};