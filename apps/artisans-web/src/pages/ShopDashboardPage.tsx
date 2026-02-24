import React, { useEffect } from 'react';
import { ShopDashboard } from '@/components/shop/ShopDashboard';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { EventBus } from '@/utils/eventBus';
import { useBrandSyncValidator } from '@/hooks/useBrandSyncValidator';

export const ShopDashboardPage: React.FC = () => {
  const { refreshModule } = useMasterAgent();
  
  // Auto-validación y sincronización de marca cada 5 minutos
  useBrandSyncValidator({ enabled: true, intervalMinutes: 5, skipInitialSync: true });

  useEffect(() => {
    // Listen for inventory updates
    const unsubscribe = EventBus.subscribe('inventory.updated', () => {
      refreshModule('inventario');
    });

    return () => unsubscribe();
  }, [refreshModule]);

  return <ShopDashboard />;
};