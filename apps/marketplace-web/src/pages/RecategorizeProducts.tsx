import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function RecategorizeProducts() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRecategorize = async () => {
    setLoading(true);
    setProgress(0);
    setResults(null);

    try {
      toast.info("Iniciando recategorización inteligente...");

      const { data, error } = await supabase.functions.invoke('recategorize-products');

      if (error) {
        console.error('Error:', error);
        toast.error('Error al recategorizar productos');
        return;
      }

      setResults(data);
      setProgress(100);

      if (data.successCount > 0) {
        toast.success(`✓ ${data.successCount} productos categorizados correctamente`);
      }
      
      if (data.errorCount > 0) {
        toast.error(`✗ ${data.errorCount} productos con errores`);
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al recategorizar productos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="container mx-auto max-w-4xl py-16 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-primary" />
              Recategorización Inteligente
            </CardTitle>
            <p className="text-muted-foreground">
              Usa Lovable AI para categorizar automáticamente todos los productos existentes
              y generar embeddings para búsqueda semántica.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h3 className="font-semibold text-foreground">¿Qué hace esta herramienta?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Analiza el nombre y descripción de cada producto</li>
                <li>Asigna la categoría más apropiada usando IA</li>
                <li>Genera embeddings vectoriales para búsqueda semántica</li>
                <li>Actualiza la base de datos automáticamente</li>
              </ul>
            </div>

            <Button
              onClick={handleRecategorize}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Iniciar Recategorización
                </>
              )}
            </Button>

            {loading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Procesando productos...
                </p>
              </div>
            )}

            {results && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-foreground">{results.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-green-600">{results.successCount}</div>
                      <div className="text-sm text-muted-foreground">Éxito</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-red-600">{results.errorCount}</div>
                      <div className="text-sm text-muted-foreground">Errores</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {results.results?.map((result: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.status === 'success'
                          ? 'border-green-200 bg-green-50 dark:bg-green-950'
                          : 'border-red-200 bg-red-50 dark:bg-red-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-medium">{result.name}</span>
                          {result.category && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              → {result.category}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${
                          result.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      {result.error && (
                        <p className="text-xs text-red-600 mt-1">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}