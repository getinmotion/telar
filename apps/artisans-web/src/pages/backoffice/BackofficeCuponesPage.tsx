/**
 * BackofficeCuponesPage
 * Wrapper de Cupones y Gift Cards para el backoffice unificado.
 */
import React, { useState } from 'react';
import { CouponManagement } from '@/components/admin/CouponManagement';
import { GiftCardManagement } from '@/components/admin/GiftCardManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BackofficeCuponesPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Cupones y Gift Cards</h1>
      <Tabs defaultValue="cupones">
        <TabsList className="mb-4">
          <TabsTrigger value="cupones">Cupones de descuento</TabsTrigger>
          <TabsTrigger value="giftcards">Gift Cards</TabsTrigger>
        </TabsList>
        <TabsContent value="cupones">
          <CouponManagement />
        </TabsContent>
        <TabsContent value="giftcards">
          <GiftCardManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackofficeCuponesPage;
