/**
 * Growth Validation Page - DEPRECATED
 * 
 * Esta página ha sido reemplazada por System Integrity Dashboard.
 * Por favor use /debug-artisan con viewMode='integrity' en su lugar.
 * 
 * Redirige automáticamente a la nueva ubicación.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SystemIntegrityDashboard } from '@/components/debug/SystemIntegrityDashboard';
import { NewDashboardHeader } from '@/components/dashboard/NewDashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function GrowthValidation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <NewDashboardHeader 
        onMaturityCalculatorClick={() => navigate('/maturity-calculator')}
      />
      <div className="container mx-auto py-8 pt-24 space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Esta página ha migrado a System Integrity Dashboard en Debug Artisan.
            Accede a /debug-artisan y selecciona la vista "System Integrity" para ver las validaciones completas del sistema.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>System Integrity Validation</CardTitle>
            <CardDescription>
              Validación completa de salud del sistema (anteriormente Growth Module Validator)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SystemIntegrityDashboard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
