/**
 * BackofficeTiendasPage
 * Wrapper del panel de tiendas para el backoffice unificado.
 */
import React from 'react';
import { AdminShopsPanel } from '@/components/admin/shops/AdminShopsPanel';

const BackofficeTiendasPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Gestión de Tiendas</h1>
      <AdminShopsPanel />
    </div>
  );
};

export default BackofficeTiendasPage;
