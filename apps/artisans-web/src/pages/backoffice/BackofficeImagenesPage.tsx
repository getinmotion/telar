/**
 * BackofficeImagenesPage
 * Wrapper de gestión de imágenes del sitio para el backoffice unificado.
 */
import React, { useState } from 'react';
import { ImageManager } from '@/components/admin/ImageManager';
import { SiteImageManager } from '@/components/admin/SiteImageManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BackofficeImagenesPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Gestión de Imágenes</h1>
      <Tabs defaultValue="site">
        <TabsList className="mb-4">
          <TabsTrigger value="site">Imágenes del sitio</TabsTrigger>
          <TabsTrigger value="products">Imágenes de productos</TabsTrigger>
        </TabsList>
        <TabsContent value="site">
          <SiteImageManager />
        </TabsContent>
        <TabsContent value="products">
          <ImageManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackofficeImagenesPage;
