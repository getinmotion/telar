/**
 * BackofficeOrdenesPage
 * Wrapper de la sección Órdenes para el backoffice unificado.
 */
import React from 'react';
import { AdminOrdersPanel } from '@/components/admin/AdminOrdersPanel';

const BackofficeOrdenesPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Gestión de Órdenes</h1>
      <AdminOrdersPanel />
    </div>
  );
};

export default BackofficeOrdenesPage;
