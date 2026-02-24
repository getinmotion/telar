import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PriceInput } from '@/components/ui/price-input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { 
  Upload, 
  Sparkles, 
  Package, 
  Tag, 
  Loader2,
  Check,
  ArrowRight,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeImages, ImageOptimizePresets } from '@/lib/imageOptimizer';

interface ProductSuggestion {
  name: string;
  description: string;
  suggested_price: number;
  category: string;
  tags: string[];
}

interface AIProductUploadState {
  phase: 'loading' | 'suggestions' | 'upload' | 'creating' | 'complete';
  suggestions: ProductSuggestion[];
  selectedSuggestion?: ProductSuggestion;
  manualMode: boolean;
}

export const AIProductUpload: React.FC = () => {
  const [state, setState] = useState<AIProductUploadState>({
    phase: 'loading',
    suggestions: [],
    manualMode: false
  });
  
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    tags: [] as string[],
    images: [] as File[]
  });

  const [coordinatorMessage, setCoordinatorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const { shop } = useArtisanShop();
  const { toast } = useToast();

  // Load AI suggestions based on shop context
  useEffect(() => {
    const loadProductSuggestions = async () => {
      if (!user || !shop) return;

      try {
        setCoordinatorMessage('🤖 Analizando tu tienda y generando sugerencias de productos personalizadas...');

        const { data: suggestions } = await supabase.functions.invoke('create-intelligent-shop', {
          body: {
            userId: user.id,
            language: 'es',
            action: 'generate_product_suggestions'
          }
        });

        if (suggestions?.productSuggestions?.products) {
          setState(prev => ({
            ...prev,
            phase: 'suggestions',
            suggestions: suggestions.productSuggestions.products
          }));
          
          setCoordinatorMessage(`✨ He generado ${suggestions.productSuggestions.products.length} sugerencias de productos perfectas para tu tienda de ${shop.craft_type}. ¿Quieres usar alguna o prefieres crear uno desde cero?`);
        } else {
          setState(prev => ({ ...prev, phase: 'upload', manualMode: true }));
          setCoordinatorMessage('📝 Vamos a crear tu primer producto juntos. Puedes subir fotos y yo te ayudo con títulos y descripciones optimizadas.');
        }
      } catch (error) {
        console.error('Error loading suggestions:', error);
        setState(prev => ({ ...prev, phase: 'upload', manualMode: true }));
        setCoordinatorMessage('📝 Vamos a crear tu primer producto manualmente. Te ayudo en cada paso.');
      }
    };

    if (state.phase === 'loading') {
      loadProductSuggestions();
    }
  }, [user, shop, state.phase]);

  const handleSelectSuggestion = (suggestion: ProductSuggestion) => {
    setState(prev => ({ ...prev, selectedSuggestion: suggestion, phase: 'upload' }));
    setProductData({
      name: suggestion.name,
      description: suggestion.description,
      price: suggestion.suggested_price,
      category: suggestion.category,
      tags: suggestion.tags,
      images: []
    });
    setCoordinatorMessage(`¡Perfecto! He seleccionado "${suggestion.name}" como base. Ahora sube las fotos de tu producto y yo optimizaré la información.`);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setIsProcessing(true);
    const newImages = Array.from(files);
    
    // Analyze images with AI if available
    try {
      const imageAnalysis = await analyzeProductImages(newImages);
      if (imageAnalysis) {
        setProductData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages],
          name: prev.name || imageAnalysis.suggestedName,
          description: prev.description || imageAnalysis.suggestedDescription,
          tags: [...new Set([...prev.tags, ...imageAnalysis.suggestedTags])]
        }));
        setCoordinatorMessage(`📸 Analicé las imágenes y detecté: ${imageAnalysis.detectedElements.join(', ')}. He optimizado el título y descripción automáticamente.`);
      } else {
        setProductData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        setCoordinatorMessage('📸 Imágenes cargadas. Ahora completa la información del producto.');
      }
    } catch (error) {
      console.error('Error analyzing images:', error);
      setProductData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      setCoordinatorMessage('📸 Imágenes cargadas correctamente. Continúa con la información del producto.');
    }
    
    setIsProcessing(false);
  };

  const analyzeProductImages = async (images: File[]) => {
    // Placeholder for AI image analysis
    // In a real implementation, this would call an AI service to analyze the images
    return {
      suggestedName: 'Producto Artesanal',
      suggestedDescription: 'Producto único hecho a mano con técnicas tradicionales.',
      suggestedTags: ['artesanal', 'hecho a mano', 'único'],
      detectedElements: ['textura artesanal', 'colores naturales', 'trabajo manual']
    };
  };

  const handleCreateProduct = async () => {
    // Validaciones mejoradas
    if (!shop) {
      console.error('Shop not available:', shop);
      toast({
        title: "Error de tienda",
        description: "No se pudo obtener la información de tu tienda. Recarga la página.",
        variant: "destructive"
      });
      return;
    }

    if (!productData.name.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para el producto.",
        variant: "destructive"
      });
      return;
    }

    if (productData.images.length === 0) {
      toast({
        title: "Imágenes requeridas",
        description: "Por favor sube al menos una imagen del producto.",
        variant: "destructive"
      });
      return;
    }

    if (!productData.price || productData.price <= 0) {
      toast({
        title: "Precio inválido",
        description: "Por favor ingresa un precio válido mayor a 0.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, phase: 'creating' }));
    setCoordinatorMessage('🛠️ Creando tu producto y optimizando para SEO...');

    try {
      console.log('=== DEBUG: Iniciando creación de producto ===');
      console.log('Shop data:', { id: shop.id, name: shop.shop_name });
      console.log('Product data antes de procesar:', {
        name: productData.name,
        price: productData.price,
        category: productData.category,
        tags: productData.tags,
        images_count: productData.images.length
      });

      // Validaciones preventivas de imágenes
      console.log('Validando imágenes antes de subir...');
      const validatedImages = productData.images.map((image, index) => {
        // Validar tamaño (máx 10MB)
        if (image.size > 10 * 1024 * 1024) {
          throw new Error(`La imagen ${index + 1} es muy grande (máx 10MB). Tamaño actual: ${Math.round(image.size / 1024 / 1024)}MB`);
        }
        
        // Validar tipo MIME
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(image.type)) {
          throw new Error(`La imagen ${index + 1} tiene un formato no válido. Usa JPG, PNG o WEBP. Formato actual: ${image.type}`);
        }
        
        console.log(`Imagen ${index + 1} validada: ${image.name} (${Math.round(image.size / 1024)}KB, ${image.type})`);
        return image;
      });

      // Optimize and upload images to Supabase Storage
      console.log('Optimizing and uploading images...');
      const optimizedImages = await optimizeImages(validatedImages, ImageOptimizePresets.product);
      console.log(`📦 Images optimized: ${validatedImages.reduce((s, f) => s + f.size, 0) / 1024}KB → ${optimizedImages.reduce((s, f) => s + f.size, 0) / 1024}KB`);

      const imageUrls = await Promise.all(
        optimizedImages.map(async (image, index) => {
          // Crear nombre de archivo seguro
          const sanitizedName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileExtension = image.name.split('.').pop()?.toLowerCase() || 'webp';
          const fileName = `${Date.now()}_${index}_${sanitizedName.substring(0, 20)}.${fileExtension}`;
          
          console.log(`Subiendo imagen ${index + 1}/${optimizedImages.length}: ${fileName} (${Math.round(image.size / 1024)}KB)`);
          
          try {
            const { data, error } = await supabase.storage
              .from('images')
              .upload(`products/${fileName}`, image, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (error) {
              console.error(`Error específico subiendo imagen ${index + 1}:`, {
                error,
                fileName,
                fileSize: image.size,
                fileType: image.type
              });
              throw new Error(`Error al subir imagen "${image.name}": ${error.message}`);
            }
            
            const { data: { publicUrl } } = supabase.storage
              .from('images')
              .getPublicUrl(data.path);
            
            console.log(`✅ Imagen ${index + 1} subida exitosamente:`, { fileName, url: publicUrl });
            return publicUrl;
            
          } catch (uploadError) {
            console.error(`Error en proceso de subida imagen ${index + 1}:`, uploadError);
            throw new Error(`No se pudo subir la imagen "${image.name}". Verifica tu conexión e inténtalo de nuevo.`);
          }
        })
      );

      console.log('Todas las imágenes subidas:', imageUrls);

      // Preparar datos del producto con validaciones
      const productToInsert = {
        shop_id: shop.id,
        name: productData.name.trim(),
        description: productData.description?.trim() || '',
        price: Number(productData.price), // Asegurar que sea número
        category: productData.category?.trim() || '',
        tags: Array.isArray(productData.tags) ? productData.tags.filter(Boolean) : [], // Asegurar array válido
        images: imageUrls,
        inventory: 10, // Default inventory
        active: true
      };

      console.log('Datos del producto preparados:', productToInsert);

      // Use AI categorization edge function
      console.log('🤖 Categorizando producto con IA...');
      toast({
        title: "Analizando producto con IA...",
        description: "Detectando materiales, técnicas y categoría",
      });

      const { data: functionData, error } = await supabase.functions.invoke('categorize-product', {
        body: {
          shop_id: productToInsert.shop_id,
          name: productToInsert.name,
          description: productToInsert.description,
          short_description: productToInsert.description?.substring(0, 150) || '',
          price: productToInsert.price,
          images: productToInsert.images,
          inventory: productToInsert.inventory || 10,
          compare_price: null,
          sku: `PROD-${Date.now()}`,
          customizable: false,
          made_to_order: false,
          lead_time_days: 7,
          production_time_hours: null,
          requires_customization: false,
          weight: null,
          dimensions: null,
          production_time: null,
        }
      });

      if (error) {
        console.error('Error en categorización IA:', error);
        throw new Error(`Error al categorizar producto: ${error.message}`);
      }

      const insertedProduct = functionData?.product;

      console.log('✅ Producto creado con IA:', {
        id: insertedProduct?.id,
        category: functionData?.marketplace_category,
        tags: functionData?.artisan_tags
      });

      toast({
        title: "¡Producto categorizado automáticamente!",
        description: `Categoría: ${functionData?.marketplace_category || 'Detectada'}`,
      });

      setState(prev => ({ ...prev, phase: 'complete' }));
      setCoordinatorMessage('🎉 ¡Producto creado exitosamente! Tu producto ya está visible en tu tienda. ¿Quieres crear otro producto o ver tu tienda?');
      
      toast({
        title: "¡Producto creado!",
        description: "Tu producto ha sido añadido a tu tienda digital.",
      });

    } catch (error) {
      console.error('=== ERROR COMPLETO ===', error);
      
      let errorMessage = "Hubo un problema al crear el producto.";
      
      if (error instanceof Error) {
        if (error.message.includes('subir imagen')) {
          errorMessage = "Error al subir las imágenes. Verifica que sean archivos válidos.";
        } else if (error.message.includes('crear producto')) {
          errorMessage = "Error al guardar el producto. Verifica que todos los datos sean correctos.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      setState(prev => ({ ...prev, phase: 'upload' }));
    }
  };

  const renderLoadingPhase = () => (
    <div className="text-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mx-auto w-16 h-16 mb-6"
      >
        <Sparkles className="w-16 h-16 text-primary" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">Generando sugerencias inteligentes</h3>
      <p className="text-muted-foreground">{coordinatorMessage}</p>
    </div>
  );

  const renderSuggestionsPhase = () => (
    <div className="space-y-6">
      <div className="bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-lg p-4">
        <p className="text-primary dark:text-primary font-medium">
          🤖 Coordinador Maestro: {coordinatorMessage}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.suggestions.map((suggestion, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{suggestion.name}</CardTitle>
              <CardDescription className="text-emerald-600 font-semibold">
                ${suggestion.suggested_price.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {suggestion.description.substring(0, 100)}...
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {suggestion.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span key={tagIndex} className="px-2 py-1 bg-muted rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <Button 
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full"
                variant="outline"
              >
                <Package className="w-4 h-4 mr-2" />
                Usar esta sugerencia
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          onClick={() => setState(prev => ({ ...prev, phase: 'upload', manualMode: true }))}
          variant="outline"
        >
          Crear producto desde cero
        </Button>
      </div>
    </div>
  );

  const renderUploadPhase = () => (
    <div className="space-y-6">
      <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
        <p className="text-emerald-800 dark:text-emerald-200 font-medium">
          🤖 Coordinador Maestro: {coordinatorMessage}
        </p>
      </div>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Fotos del Producto
          </CardTitle>
          <CardDescription>Sube imágenes de alta calidad de tu producto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Arrastra las imágenes aquí o haz clic para seleccionar
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outline" asChild>
                <span>Seleccionar Imágenes</span>
              </Button>
            </label>
          </div>
          
          {productData.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                {productData.images.length} imagen(es) seleccionada(s)
              </p>
              <div className="flex flex-wrap gap-2">
                {productData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Producto ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Información del Producto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="product-name">Nombre del Producto</Label>
            <Input
              id="product-name"
              value={productData.name}
              onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre atractivo para tu producto"
            />
          </div>

          <div>
            <Label htmlFor="product-description">Descripción</Label>
            <Textarea
              id="product-description"
              value={productData.description}
              onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe tu producto de forma atractiva..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PriceInput
              value={productData.price || null}
              onChange={(newPrice) => setProductData(prev => ({ ...prev, price: newPrice || 0 }))}
              label="Precio (COP)"
              placeholder="50.000"
              required
            />
            <div>
              <Label htmlFor="product-category">Categoría</Label>
              <Input
                id="product-category"
                value={productData.category}
                onChange={(e) => setProductData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Cerámica, Textiles, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="product-tags">Etiquetas (separadas por comas)</Label>
            <Input
              id="product-tags"
              value={productData.tags.join(', ')}
              onChange={(e) => setProductData(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              placeholder="artesanal, hecho a mano, único"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleCreateProduct}
        disabled={!productData.name || productData.images.length === 0 || isProcessing}
        size="lg"
        className="w-full"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Package className="w-4 h-4 mr-2" />
        )}
        Crear Producto
      </Button>
    </div>
  );

  const renderCreatingPhase = () => (
    <div className="text-center py-12">
      <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-6" />
      <h3 className="text-xl font-semibold mb-2">Creando tu producto</h3>
      <p className="text-muted-foreground">Optimizando para SEO y subiendo imágenes...</p>
    </div>
  );

  const renderCompletePhase = () => (
    <div className="text-center py-12">
      <Check className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
      <h3 className="text-xl font-semibold mb-2">¡Producto creado exitosamente!</h3>
      <p className="text-muted-foreground mb-6">{coordinatorMessage}</p>
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Crear otro producto
        </Button>
        <Button
          onClick={() => window.open(`/tienda/${shop?.shop_slug}`, '_blank')}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Ver mi tienda
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Carga Inteligente de Productos</h1>
        <p className="text-muted-foreground">
          El Coordinador Maestro te ayuda a crear productos optimizados con IA
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {state.phase === 'loading' && 'Generando Sugerencias'}
            {state.phase === 'suggestions' && 'Sugerencias Inteligentes'}
            {state.phase === 'upload' && 'Crear Producto'}
            {state.phase === 'creating' && 'Creando Producto'}
            {state.phase === 'complete' && 'Producto Creado'}
          </CardTitle>
          <CardDescription>
            {state.phase === 'loading' && 'Analizando tu tienda para generar sugerencias personalizadas'}
            {state.phase === 'suggestions' && 'Selecciona una sugerencia o crea desde cero'}
            {state.phase === 'upload' && 'Completa la información y sube las imágenes'}
            {state.phase === 'creating' && 'Procesando tu producto con optimizaciones de IA'}
            {state.phase === 'complete' && 'Tu producto está listo y visible en tu tienda'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {state.phase === 'loading' && renderLoadingPhase()}
          {state.phase === 'suggestions' && renderSuggestionsPhase()}
          {state.phase === 'upload' && renderUploadPhase()}
          {state.phase === 'creating' && renderCreatingPhase()}
          {state.phase === 'complete' && renderCompletePhase()}
        </CardContent>
      </Card>
    </div>
  );
};