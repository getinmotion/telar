import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Upload, Check, Loader2, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useImageUpload } from '../hooks/useImageUpload';
import { WizardState } from '../hooks/useWizardState';
import { deleteUploadedFile } from '@/services/fileUpload.actions';
import { useAuth } from '@/context/AuthContext';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';
import { createProduct, getProductsByShopId, getProductById } from '@/services/products.actions';
import { createVariant } from '@/services/productVariants.actions';
import { updateAgentTask } from '@/services/agentTasks.actions';
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
  const { user } = useAuth();

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
    console.log('🚀 INICIANDO PROCESO DE PUBLICACIÓN...');

    const validation = validateForPublishing();
    if (!validation.isValid) {
      toast.error('Faltan datos obligatorios', { description: validation.errors.join(', ') });
      return;
    }

    if (!user) {
      toast.error('Usuario no autenticado. Por favor, inicia sesión.');
      return;
    }

    setIsPublishing(true);
    let uploadedImageUrls: string[] = [];

    try {
      // PASO 1: Verificar tienda del usuario
      console.log('🏪 VERIFICANDO TIENDA DEL USUARIO...');
      const shopData = await getArtisanShopByUserId(user.id);

      if (!shopData) {
        toast.error('No tienes una tienda activa', {
          description: 'Crea tu tienda antes de publicar productos',
          action: { label: 'Crear tienda', onClick: () => window.location.href = '/crear-tienda' }
        });
        throw new Error('No tienes una tienda activa. Crea tu tienda primero.');
      }

      console.log('✅ TIENDA VERIFICADA:', { id: shopData.id, name: shopData.shopName });

      // PASO 2: Subir imágenes
      if (wizardState.images && wizardState.images.length > 0) {
        console.log(`📤 SUBIENDO ${wizardState.images.length} IMÁGENES...`);
        toast.info('Subiendo imágenes...', { description: `Procesando ${wizardState.images.length} imagen(es)` });

        try {
          uploadedImageUrls = await uploadImages(wizardState.images);
          if (uploadedImageUrls.length === 0) {
            throw new Error('No se pudieron generar URLs válidas para las imágenes');
          }
          console.log('✅ IMÁGENES SUBIDAS:', uploadedImageUrls);
        } catch (uploadError) {
          throw new Error(`Error subiendo imágenes: ${uploadError instanceof Error ? uploadError.message : 'Error desconocido'}`);
        }
      }

      // PASO 3: Crear producto
      console.log('💾 CREANDO PRODUCTO...');
      toast.info('Creando producto...', { description: 'Guardando en la base de datos' });

      const productData = {
        shop_id: shopData.id,
        name: wizardState.name.trim(),
        description: wizardState.description?.trim() || '',
        short_description: wizardState.shortDescription?.trim() || wizardState.description?.trim().substring(0, 150) || '',
        price: Number(wizardState.price) || 0,
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
        featured: false,
      };

      const createdProduct = await createProduct(productData);
      console.log('✅ PRODUCTO CREADO:', { id: createdProduct.id, name: createdProduct.name });

      // PASO 4: Insertar variantes si existen
      if (wizardState.hasVariants && wizardState.variants && wizardState.variants.length > 0) {
        console.log('🎨 INSERTANDO VARIANTES...');
        toast.info('Guardando variantes...', { description: `Creando ${wizardState.variants.length} variante(s)` });

        try {
          await Promise.all(
            wizardState.variants.map((variant, index) =>
              createVariant({
                product_id: createdProduct.id,
                option_values: variant.optionValues,
                price: variant.price,
                stock: variant.stock,
                sku: variant.sku || `${productData.sku}-V${String(index + 1).padStart(3, '0')}`,
                status: 'active',
              })
            )
          );
          console.log('✅ Variantes insertadas:', wizardState.variants.length);
        } catch (variantsError) {
          console.error('⚠️ Error insertando variantes:', variantsError);
          toast.warning('Variantes no guardadas', {
            description: 'El producto se creó pero hubo un error con las variantes'
          });
        }
      }

      // PASO 5: Contar productos para gamificación
      let isFirstProduct = false;
      let productCount = 1;
      try {
        const existingProducts = await getProductsByShopId(shopData.id);
        isFirstProduct = existingProducts.length <= 1;
        productCount = existingProducts.length;
      } catch {
        // No bloquear el flujo si falla el conteo
      }

      // PASO 6: Gamificación — otorgar XP
      const xpAmount = isFirstProduct
        ? XP_REWARDS.PRODUCT_UPLOAD + XP_REWARDS.FIRST_PRODUCT
        : XP_REWARDS.PRODUCT_UPLOAD;
      const xpReason = isFirstProduct ? '¡Primer Producto Subido! 🎉' : 'Producto Subido';
      console.log(`🎯 Awarding ${xpAmount} XP (first: ${isFirstProduct})`);
      await awardXP(xpAmount, xpReason, true, 5);

      // PASO 7: Publicar eventos al Master Coordinator
      EventBus.publish('inventory.updated', {
        productId: createdProduct.id,
        shopId: shopData.id,
        action: 'product_created',
        productName: productData.name
      });
      EventBus.publish('product.wizard.completed', {
        userId: user.id,
        taskId: taskId || 'inventory-first-products',
        productId: createdProduct.id,
        isFirstProduct,
        productCount,
      });
      EventBus.publish('master.full.sync', { source: 'product_upload' });

      // PASO 8: Marcar tarea como completada si viene desde una tarea
      if (taskId) {
        try {
          await updateAgentTask(taskId, {
            status: 'completed',
            progressPercentage: 100,
          });
          console.log('✅ Task marked as completed');
        } catch (taskError) {
          console.error('❌ Error marking task as completed:', taskError);
        }

        await updateRoutingCompletion({ taskId, wasSuccessful: true, completionMethod: 'wizard' });
      }

      // PASO 9: Éxito
      console.log('🎉 PRODUCTO PUBLICADO EXITOSAMENTE:', createdProduct.id);
      setPublishedProductId(createdProduct.id);
      setPublishedProductName(productData.name);
      setShowSuccessModal(true);
      onPublish();

      toast.success('¡Producto publicado exitosamente!', {
        description: `"${productData.name}" ya está disponible en tu tienda`,
        duration: 4000
      });

    } catch (error) {
      console.error('❌ ERROR CRÍTICO EN PUBLICACIÓN:', error instanceof Error ? error.message : error);

      // Rollback imágenes si el producto falló
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

      toast.error('Error al publicar producto', {
        description: error instanceof Error ? error.message : 'Error desconocido',
        duration: 10000,
        action: { label: 'Reintentar', onClick: () => handlePublish() }
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Save as draft function
  const handleSaveDraft = async () => {
    console.log('💾 GUARDANDO COMO BORRADOR...');

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
    if (!user) {
      toast.error('Usuario no autenticado. Por favor, inicia sesión.');
      return;
    }

    setIsSavingDraft(true);
    let uploadedImageUrls: string[] = [];

    try {
      // Verificar tienda
      const shopData = await getArtisanShopByUserId(user.id);
      if (!shopData) throw new Error('No tienes una tienda activa');

      // Subir imágenes
      if (wizardState.images.length > 0) {
        toast.info('Subiendo imágenes...', { description: `Procesando ${wizardState.images.length} imagen(es)` });
        uploadedImageUrls = await uploadImages(wizardState.images);
        if (uploadedImageUrls.length === 0) throw new Error('No se pudieron subir las imágenes');
      }

      // Crear producto como borrador
      const draftProduct = await createProduct({
        shop_id: shopData.id,
        name: wizardState.name.trim(),
        description: wizardState.description?.trim() || '',
        short_description: wizardState.shortDescription?.trim() || wizardState.description?.trim().substring(0, 150) || '',
        price: Number(wizardState.price) || 0,
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
        moderation_status: 'draft',
      });

      console.log('✅ BORRADOR GUARDADO:', draftProduct.id);
      onPublish();

      toast.success('Borrador guardado', {
        description: 'Puedes completar los datos de envío desde tu inventario',
        action: { label: 'Ver inventario', onClick: () => navigate('/dashboard/inventory') }
      });

      navigate('/dashboard/inventory');

    } catch (error) {
      console.error('❌ ERROR GUARDANDO BORRADOR:', error);

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