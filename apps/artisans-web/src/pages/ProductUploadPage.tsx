import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Package, Wand2 } from 'lucide-react';
import { AIProductUploadWizard } from '@/components/shop/ai-upload/AIProductUploadWizard';
import { QuickPublishCard } from '@/components/shop/quick-publish/QuickPublishCard';
import { BatchUploadInterface } from '@/components/shop/batch-upload/BatchUploadInterface';
import { ProductUploadHeader } from '@/components/shop/ProductUploadHeader';
import { UploadMethodSelector } from '@/components/shop/upload/UploadMethodSelector';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

export const ProductUploadPage: React.FC = () => {
  const userLocalStorage = useUserLocalStorage();
  const [showSelector, setShowSelector] = useState(false);
  const [activeTab, setActiveTab] = useState('wizard');

  useEffect(() => {
    const hasSeenSelector = userLocalStorage.getItem('product-upload-method-selected');
    if (!hasSeenSelector) {
      setShowSelector(true);
    }
  }, [userLocalStorage]);

  const handleMethodSelect = (method: 'wizard' | 'quick' | 'batch') => {
    setActiveTab(method);
    setShowSelector(false);
    userLocalStorage.setItem('product-upload-method-selected', 'true');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <ProductUploadHeader />
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {showSelector ? (
          <UploadMethodSelector onSelectMethod={handleMethodSelect} />
        ) : (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Publicar Productos
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Elige la modalidad que mejor se adapte a tus necesidades
              </p>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="wizard" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Asistente Guiado
                </TabsTrigger>
                <TabsTrigger value="quick" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Súper Rápido
                </TabsTrigger>
                <TabsTrigger value="batch" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Carga Masiva
                </TabsTrigger>
              </TabsList>

          <TabsContent value="wizard" className="mt-0">
            <motion.div
              key="wizard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AIProductUploadWizard />
            </motion.div>
          </TabsContent>

          <TabsContent value="quick" className="mt-0">
            <motion.div
              key="quick"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <QuickPublishCard />
            </motion.div>
          </TabsContent>

          <TabsContent value="batch" className="mt-0">
            <motion.div
              key="batch"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <BatchUploadInterface />
            </motion.div>
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>
    </div>
  );
};