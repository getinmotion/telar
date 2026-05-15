import React from 'react';
import { AdminShopsPanel } from '@/components/admin/shops/AdminShopsPanel';

const BackofficePagosPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Pagos (Cobre)</h1>
      <AdminShopsPanel />
    </div>
  );
};

export default BackofficePagosPage;
