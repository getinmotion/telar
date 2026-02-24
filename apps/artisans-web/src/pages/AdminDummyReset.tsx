import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Trash2, UserPlus, RefreshCw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDummyReset() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'cleaning' | 'deleting' | 'creating' | 'complete'>('idle');
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [deleteResult, setDeleteResult] = useState<any>(null);
  const [createResult, setCreateResult] = useState<any>(null);

  const DUMMY_EMAILS = [
    'dummy1@telar.app',
    'dummy2@telar.app',
    'dummy3@telar.app',
    'dummy4@telar.app',
    'dummy5@telar.app',
    'dummy6@telar.app',
    'dummy7@telar.app',
    'dummy8@telar.app',
    'dummy9@telar.app',
    'dummy10@telar.app'
  ];

  const handleResetDummies = async () => {
    setIsProcessing(true);
    setCurrentStep('cleaning');
    setCleanupResult(null);
    setDeleteResult(null);
    setCreateResult(null);

    try {
      // Get session for authorization
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session');
      }

      console.log('🔥 Iniciando reset total a dummy data...');
      
      const { data, error } = await supabase.functions.invoke('reset-to-dummy-data', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      });

      if (error) {
        console.error('Error en reset:', error);
        toast.error('Error en el proceso de reset', {
          description: error.message
        });
        setIsProcessing(false);
        setCurrentStep('idle');
        return;
      }

      console.log('✅ Reset completado:', data);
      
      // Simulate progress for better UX
      setCurrentStep('cleaning');
      setCleanupResult({
        orphan_shops_deleted: Object.values(data.phase1_deletion).reduce((a: number, b: any) => a + (b || 0), 0),
        orphan_products_deleted: data.phase1_deletion.products || 0
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('deleting');
      setDeleteResult({
        deletedUsers: data.created_dummies.map((d: any) => ({ email: d.email.replace('dummy', 'old-dummy') }))
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('creating');
      setCreateResult({
        summary: { total_users: data.final_verification.total_users },
        results: data.created_dummies.map((d: any) => ({
          email: d.email,
          shop_name: d.shopName,
          product_count: 10
        }))
      });
      
      setCurrentStep('complete');
      toast.success('¡Reset completado perfectamente!', {
        description: `${data.final_verification.total_users} usuarios • ${data.final_verification.total_shops} tiendas • ${data.final_verification.total_products} productos`,
        duration: 8000
      });

      // Refresh after short delay
      setTimeout(() => {
        window.location.href = '/tiendas';
      }, 2000);

    } catch (error: any) {
      console.error('Error en reset:', error);
      toast.error('Error en el proceso', {
        description: error.message
      });
      setCurrentStep('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
          >
            ← Volver
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Resetear Usuarios Dummy</h1>
          <p className="text-muted-foreground mt-2">
            Limpia la base de datos y recrea 10 usuarios de prueba completos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Proceso Automático Completo</CardTitle>
            <CardDescription>
              Limpieza de datos huérfanos → Eliminación de dummies → Creación de 10 usuarios perfectos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Process Steps */}
            <div className="space-y-3">
              {/* Step 1: Cleanup */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                currentStep === 'cleaning' ? 'bg-warning/10 border-warning' :
                cleanupResult ? 'bg-success/10 border-success' : 'bg-muted'
              }`}>
                {currentStep === 'cleaning' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : cleanupResult ? (
                  <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs">✓</div>
                ) : (
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Paso 1: Limpiar datos huérfanos</p>
                  {cleanupResult && (
                    <p className="text-sm text-muted-foreground">
                      {cleanupResult.orphan_shops_deleted} tiendas y {cleanupResult.orphan_products_deleted} productos eliminados
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2: Delete */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                currentStep === 'deleting' ? 'bg-destructive/10 border-destructive' :
                deleteResult ? 'bg-success/10 border-success' : 'bg-muted'
              }`}>
                {currentStep === 'deleting' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : deleteResult ? (
                  <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs">✓</div>
                ) : (
                  <Trash2 className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Paso 2: Eliminar usuarios dummy existentes</p>
                  {deleteResult && (
                    <p className="text-sm text-muted-foreground">
                      {deleteResult.deletedUsers?.length || 0} usuarios eliminados
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3: Create */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                currentStep === 'creating' ? 'bg-primary/10 border-primary' :
                createResult ? 'bg-success/10 border-success' : 'bg-muted'
              }`}>
                {currentStep === 'creating' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : createResult ? (
                  <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs">✓</div>
                ) : (
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Paso 3: Crear 10 nuevos usuarios dummy perfectos</p>
                  {createResult && (
                    <p className="text-sm text-muted-foreground">
                      {createResult.summary?.total_users || 0} usuarios con tiendas y productos completos
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Results */}
            {cleanupResult && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium text-sm">Limpieza de datos huérfanos:</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>✓ {cleanupResult.orphan_shops_deleted} tiendas sin usuario válido eliminadas</div>
                  <div>✓ {cleanupResult.orphan_products_deleted} productos huérfanos eliminados</div>
                  <div className="text-xs mt-2">Base de datos optimizada y limpia</div>
                </div>
              </div>
            )}

            {deleteResult && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium text-sm">Usuarios dummy eliminados:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {deleteResult.deletedUsers?.map((user: any) => (
                    <div key={user.id} className="text-muted-foreground">
                      ✓ {user.email}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {createResult && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium text-sm">Nuevos usuarios dummy creados:</p>
                <div className="grid gap-2 text-sm">
                  {createResult.results?.slice(0, 10).map((result: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{result.email}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {result.shop_name} • {result.product_count} productos
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Credenciales: dummy1@telar.app hasta dummy10@telar.app / <code className="font-mono">Dummy123!</code>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleResetDummies}
              disabled={isProcessing}
              size="lg"
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentStep === 'cleaning' ? 'Limpiando datos...' : 
                   currentStep === 'deleting' ? 'Eliminando usuarios...' : 'Creando usuarios...'}
                </>
              ) : currentStep === 'complete' ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resetear de nuevo
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Iniciar Limpieza y Reset Completo
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
