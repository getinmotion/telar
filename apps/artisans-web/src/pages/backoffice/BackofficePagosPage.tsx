import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminShopsPanel } from '@/components/admin/shops/AdminShopsPanel';

const BackofficePagosPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pagos (Cobre)</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/backoffice/pagos/payments-svc')}
          className="gap-2"
        >
          <Coins className="w-4 h-4" />
          Configurar cargos sobre ventas
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      <AdminShopsPanel />
    </div>
  );
};

export default BackofficePagosPage;
