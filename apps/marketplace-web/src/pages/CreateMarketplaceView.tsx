import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const CreateMarketplaceView = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string; sql?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const createView = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-marketplace-view`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, message: data.message, sql: data.sql });
        toast({
          title: "✅ Vista creada",
          description: "La vista marketplace_products está lista",
        });
      } else {
        setResult({ 
          success: false, 
          error: data.error || 'Error al crear vista',
          sql: data.sql
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al conectar'
      });
    } finally {
      setLoading(false);
    }
  };

  const copySQL = () => {
    if (result?.sql) {
      navigator.clipboard.writeText(result.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "SQL copiado",
        description: "El SQL se ha copiado al portapapeles",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Configurar Vista de Marketplace</CardTitle>
            <CardDescription>
              Crea una vista SQL que mapea los productos de telar.co al formato del marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">¿Qué hace?</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Extrae correctamente <code className="bg-muted px-1 py-0.5 rounded">image_url</code> desde <code className="bg-muted px-1 py-0.5 rounded">images[0].url</code></li>
                <li>Incluye <code className="bg-muted px-1 py-0.5 rounded">shop_id</code> para filtrar productos por tienda</li>
                <li>Incluye <code className="bg-muted px-1 py-0.5 rounded">banner_url</code>, <code className="bg-muted px-1 py-0.5 rounded">craft</code>, <code className="bg-muted px-1 py-0.5 rounded">region</code> de artisan_shops</li>
                <li>Mapea <code className="bg-muted px-1 py-0.5 rounded">inventory</code> → <code className="bg-muted px-1 py-0.5 rounded">stock</code></li>
                <li>Une <code className="bg-muted px-1 py-0.5 rounded">artisan_shops</code> para nombre y logo de tienda</li>
                <li>Convierte JSONB a arrays compatibles</li>
                <li>Filtra productos activos</li>
              </ul>
            </div>

            {result && result.success && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>¡Vista creada!</AlertTitle>
                <AlertDescription>
                  <p className="mb-3">La vista marketplace_products está lista.</p>
                  <Button
                    onClick={() => window.location.href = '/productos'}
                  >
                    Ver Productos
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {result && !result.success && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Creación Manual Requerida</AlertTitle>
                <AlertDescription className="space-y-4">
                  <p className="text-sm">
                    {result.error}
                  </p>
                  <ol className="list-decimal list-inside text-sm space-y-2 mt-4">
                    <li>Ve al dashboard de Supabase de telar.co</li>
                    <li>Abre el <strong>SQL Editor</strong></li>
                    <li>Copia y pega el SQL de abajo</li>
                    <li>Haz clic en <strong>Run</strong></li>
                    <li>Recarga <strong>/productos</strong></li>
                  </ol>
                  
                  {result.sql && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold">SQL:</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copySQL}
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-96 border">
{result.sql}
                      </pre>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={createView} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando vista...
                </>
              ) : (
                'Crear Vista Marketplace'
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CreateMarketplaceView;
