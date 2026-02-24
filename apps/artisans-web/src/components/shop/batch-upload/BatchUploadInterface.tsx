import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Package, Loader2, AlertCircle, CheckCircle, X, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDropzone } from 'react-dropzone';
import { useBatchUpload } from '@/hooks/useBatchUpload';
import { EventBus } from '@/utils/eventBus';
import { supabase } from '@/integrations/supabase/client';
import { BatchSuccessPanel } from '@/components/shop/upload/BatchSuccessPanel';

interface BatchItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'analyzing' | 'uploading' | 'completed' | 'error';
  aiData?: {
    name: string;
    description: string;
    category: string;
    price: number;
  };
  productId?: string;
  error?: string;
  progress: number;
}

export const BatchUploadInterface: React.FC = () => {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessPanel, setShowSuccessPanel] = useState(false);
  
  const {
    processBatch,
    batchProgress,
    completedCount,
    errorCount,
    isRunning
  } = useBatchUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: BatchItem[] = acceptedFiles.slice(0, 20).map((file, index) => ({
      id: `${Date.now()}_${index}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0
    }));

    setBatchItems(prev => [...prev, ...newItems].slice(0, 20));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 20,
    multiple: true
  });

  const removeItem = (id: string) => {
    setBatchItems(prev => {
      const item = prev.find(item => item.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const clearAll = () => {
    batchItems.forEach(item => URL.revokeObjectURL(item.preview));
    setBatchItems([]);
  };

  const retryFailedItems = () => {
    setBatchItems(prev => prev.map(item => 
      item.status === 'error' 
        ? { ...item, status: 'pending', error: undefined, progress: 0 }
        : item
    ));
  };

  const startBatchProcess = async () => {
    if (batchItems.length === 0) return;

    setIsProcessing(true);
    
    const updateItemStatus = (id: string, status: BatchItem['status'], progress: number, aiData?: any, error?: string, productId?: string) => {
      setBatchItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, status, progress, aiData, error, productId }
          : item
      ));
    };

    await processBatch(batchItems, updateItemStatus);
    
    // Show success panel after batch completes
    setShowSuccessPanel(true);
    
    // Notify Master Coordinator about batch completion
    const completedItems = batchItems.filter(item => item.status === 'completed');
    if (completedItems.length > 0) {
      EventBus.publish('inventory.updated', { 
        action: 'batch_created',
        count: completedItems.length
      });
      
      // Register agent usage
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('agent_usage_metrics').insert({
            user_id: user.id,
            agent_id: 'inventory-manager',
            messages_count: completedItems.length
          });
        }
      } catch (error) {
        console.error('Error tracking agent usage:', error);
      }
    }
    
    setIsProcessing(false);
  };

  const handleUploadMore = () => {
    clearAll();
    setShowSuccessPanel(false);
  };

  const pendingCount = batchItems.filter(item => item.status === 'pending').length;
  const processingCount = batchItems.filter(item => ['analyzing', 'uploading'].includes(item.status)).length;
  const canStartProcess = batchItems.length > 0 && !isProcessing && pendingCount > 0;

  const completedProducts = batchItems
    .filter(item => item.status === 'completed' || item.status === 'error')
    .map(item => ({
      id: item.productId || item.id,
      name: item.aiData?.name || 'Producto sin nombre',
      image: item.preview,
      status: item.status as 'completed' | 'error',
      error: item.error
    }));

  if (showSuccessPanel && !isRunning) {
    return (
      <BatchSuccessPanel
        completedProducts={completedProducts}
        completedCount={completedCount}
        errorCount={errorCount}
        onUploadMore={handleUploadMore}
      />
    );
  }

  return (
    <Card className="p-6 bg-gradient-subtle border-primary/20 shadow-card">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Package className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Publicación en Lotes</h3>
              <p className="text-muted-foreground text-sm">
                Hasta 20 productos simultáneos
              </p>
            </div>
          </div>
          
          {batchItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={isProcessing}
            >
              Limpiar todo
            </Button>
          )}
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-300 hover:border-secondary/50 hover:bg-secondary/5
            ${isDragActive ? 'border-secondary bg-secondary/10' : 'border-border'}
            ${batchItems.length >= 20 ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={batchItems.length >= 20} />
          
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium">
                {batchItems.length >= 20 
                  ? 'Límite de 20 productos alcanzado'
                  : isDragActive 
                  ? 'Suelta las imágenes aquí' 
                  : 'Arrastra múltiples imágenes o haz click'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG o WEBP • Máx. 20 productos • 10MB cada uno
              </p>
            </div>
            
            {batchItems.length > 0 && (
              <Badge variant="secondary">
                {batchItems.length}/20 productos agregados
              </Badge>
            )}
          </div>
        </div>

        {/* Batch Stats */}
        {isRunning && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progreso del lote</span>
              <span>{Math.round(batchProgress)}%</span>
            </div>
            <Progress value={batchProgress} className="h-2" />
            
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>{completedCount} completados</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                <span>{processingCount} procesando</span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span>{errorCount} errores</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Summary */}
        {errorCount > 0 && !isRunning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorCount} productos fallaron. Puedes reintentar o revisarlos individualmente.
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={retryFailedItems}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reintentar errores
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Items Grid */}
        <AnimatePresence>
          {batchItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto"
            >
              {batchItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                    <img
                      src={item.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.status === 'pending' && (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                      {item.status === 'analyzing' && (
                        <div className="flex flex-col items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <Badge variant="secondary">Analizando</Badge>
                        </div>
                      )}
                      {item.status === 'uploading' && (
                        <div className="flex flex-col items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <Badge variant="secondary">Subiendo</Badge>
                        </div>
                      )}
                      {item.status === 'completed' && (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completo
                        </Badge>
                      )}
                      {item.status === 'error' && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeItem(item.id)}
                      disabled={isProcessing && ['analyzing', 'uploading'].includes(item.status)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    {/* Progress Bar */}
                    {item.progress > 0 && item.status !== 'completed' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* AI Generated Name */}
                  {item.aiData && (
                    <p className="text-xs text-center mt-1 truncate">
                      {item.aiData.name}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <Button
          onClick={startBatchProcess}
          disabled={!canStartProcess}
          className="w-full bg-gradient-secondary hover:shadow-glow transition-all duration-300"
          size="lg"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Package className="h-4 w-4 mr-2" />
          )}
          {isProcessing 
            ? `Procesando ${processingCount} productos...` 
            : `Procesar ${pendingCount} productos`
          }
        </Button>

        {batchItems.length > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Los productos serán analizados con IA y publicados automáticamente con precios predeterminados de $50,000.
          </p>
        )}
      </div>
    </Card>
  );
};