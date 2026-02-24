import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DataManagementPanel = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<any>(null);

  const handleResetDummyData = async () => {
    setIsResetting(true);
    setResetResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('reset-to-dummy-data', {
        body: {}
      });

      if (error) throw error;

      setResetResult(data);
      
      toast.success('¡Base de datos reseteada exitosamente!', {
        description: `${data.summary.totalUsers} usuarios y ${data.summary.totalProducts} productos creados`
      });

    } catch (error: any) {
      console.error('Error resetting dummy data:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Gestión de Datos de Prueba
          </CardTitle>
          <CardDescription>
            Herramientas para resetear y crear datos dummy en la base de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Advertencia:</strong> Esta operación eliminará TODOS los usuarios no-admin existentes 
              y sus datos asociados, luego creará 10 usuarios de prueba completos con tiendas y 100 productos.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Esta operación:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Elimina usuarios existentes (excepto admin)</li>
              <li>Elimina todas las tiendas y productos</li>
              <li>Crea 10 usuarios de prueba autenticados</li>
              <li>Crea 10 tiendas con logos, banners y hero slides</li>
              <li>Crea 100 productos con imágenes (10 por tienda)</li>
              <li>Configura datos de madurez y tareas iniciales</li>
            </ul>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                className="w-full"
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Reseteando base de datos...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-5 w-5" />
                    Resetear Base de Datos
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente todos los usuarios no-admin y sus datos.
                  Luego creará 10 usuarios de prueba completos. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetDummyData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sí, resetear base de datos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {resetResult && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Operación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{resetResult.summary.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Usuarios</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{resetResult.summary.totalShops}</p>
                    <p className="text-sm text-muted-foreground">Tiendas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{resetResult.summary.totalProducts}</p>
                    <p className="text-sm text-muted-foreground">Productos</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Credenciales de Acceso:</h4>
                  <div className="bg-muted p-3 rounded-lg space-y-1 max-h-48 overflow-y-auto">
                    {resetResult.summary.credentials.map((cred: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm py-1 border-b last:border-b-0">
                        <code className="font-mono">{cred.email}</code>
                        <code className="text-xs bg-background px-2 py-0.5 rounded">{cred.password}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
