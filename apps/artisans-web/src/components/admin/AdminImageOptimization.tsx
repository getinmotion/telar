import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  HardDrive,
  Zap,
  FileImage,
  TrendingDown,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OptimizationStats {
  bucket_id: string;
  total_files: number;
  completed_count: number;
  skipped_count: number;
  failed_count: number;
  pending_count: number;
  total_original_bytes: number;
  total_optimized_bytes: number;
  total_savings_bytes: number;
  average_savings_percent: number;
}

interface OptimizationLog {
  id: string;
  bucket_id: string;
  original_path: string;
  optimized_path: string | null;
  original_size_bytes: number;
  optimized_size_bytes: number | null;
  savings_percent: number | null;
  status: string;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

interface BatchResult {
  processed: number;
  skipped: number;
  failed: number;
  totalSavingsBytes: number;
  details: Array<{
    path: string;
    originalSize: number;
    optimizedSize?: number;
    savingsPercent?: number;
    status: string;
    error?: string;
  }>;
}

const BUCKETS = [
  { id: 'images', name: 'Imágenes Generales', description: 'Imágenes subidas desde el gestor' },
  { id: 'product-images', name: 'Imágenes de Productos', description: 'Fotos de productos' },
  { id: 'hero-images', name: 'Imágenes Hero', description: 'Banners y slides de hero' },
  { id: 'brand-assets', name: 'Activos de Marca', description: 'Logos y recursos de marca' },
  { id: 'artisan-profiles', name: 'Perfiles de Artesanos', description: 'Fotos de perfil de artesanos' },
  { id: 'shop-images', name: 'Imágenes de Tiendas', description: 'Logos, banners y fotos de tiendas' },
  { id: 'site-images', name: 'Imágenes del Sitio', description: 'Imágenes generales del sitio' },
];

// Telar shop ID for testing
const TELAR_SHOP_ID = 'bb7cba66-9413-4709-8268-480f68fc9257';

interface ShopOptimizationResult {
  shop_name: string;
  total_images: number;
  successful: number;
  failed: number;
  total_original_size: number;
  total_optimized_size: number;
  total_savings: number;
  savings_percent: number;
  dry_run: boolean;
  results: Array<{
    path: string;
    type: string;
    originalSize: number;
    optimizedSize?: number;
    savingsPercent?: number;
    newUrl?: string;
    status: string;
    error?: string;
  }>;
}

export const AdminImageOptimization: React.FC = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [replaceOriginal, setReplaceOriginal] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [maxWidth, setMaxWidth] = useState(1200);
  const [quality, setQuality] = useState(75);
  const [stats, setStats] = useState<OptimizationStats | null>(null);
  const [logs, setLogs] = useState<OptimizationLog[]>([]);
  const [lastResult, setLastResult] = useState<BatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [shopOptResult, setShopOptResult] = useState<ShopOptimizationResult | null>(null);
  const [isOptimizingShop, setIsOptimizingShop] = useState(false);

  // Load stats for selected bucket
  useEffect(() => {
    if (selectedBucket) {
      loadStats();
      loadLogs();
    }
  }, [selectedBucket]);

  const loadStats = async () => {
    if (!selectedBucket) return;
    
    const { data, error } = await supabase
      .from('image_optimization_stats')
      .select('*')
      .eq('bucket_id', selectedBucket)
      .single();

    if (data) {
      setStats(data as unknown as OptimizationStats);
    }
  };

  const loadLogs = async () => {
    if (!selectedBucket) return;
    
    const { data, error } = await supabase
      .from('image_optimization_log')
      .select('*')
      .eq('bucket_id', selectedBucket)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setLogs(data as unknown as OptimizationLog[]);
    }
  };

  const runOptimization = async () => {
    if (!selectedBucket) {
      toast.error('Selecciona un bucket primero');
      return;
    }

    setIsRunning(true);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Sesión no válida');
        return;
      }

      const response = await supabase.functions.invoke('optimize-existing-images', {
        body: {
          bucketId: selectedBucket,
          batchSize,
          dryRun,
          maxWidth,
          quality,
          replaceOriginal,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      if (result.success) {
        setLastResult(result.result);
        
        const message = dryRun 
          ? `[Simulación] ${result.result.processed} archivos analizados, ahorro estimado: ${formatBytes(result.result.totalSavingsBytes)}`
          : `${result.result.processed} archivos optimizados, ${result.result.skipped} omitidos, ahorro: ${formatBytes(result.result.totalSavingsBytes)}`;
        
        toast.success(message);
        
        // Reload stats and logs
        await loadStats();
        await loadLogs();
      } else {
        toast.error(result.error || 'Error durante la optimización');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al ejecutar optimización');
    } finally {
      setIsRunning(false);
      setLoading(false);
    }
  };

  const resetLogs = async () => {
    if (!selectedBucket) return;
    
    if (!confirm('¿Estás seguro de que deseas limpiar el historial de optimización para este bucket?')) {
      return;
    }

    const { error } = await supabase
      .from('image_optimization_log')
      .delete()
      .eq('bucket_id', selectedBucket);

    if (error) {
      toast.error('Error al limpiar historial');
    } else {
      toast.success('Historial limpiado');
      setLogs([]);
      setStats(null);
      await loadStats();
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Completado</Badge>;
      case 'skipped':
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Omitido</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Fallido</Badge>;
      case 'pending':
      case 'pending_client':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const optimizeTelarShop = async (isDryRun: boolean) => {
    setIsOptimizingShop(true);
    setShopOptResult(null);

    try {
      console.log(`[AdminImageOptimization] Starting Telar optimization, dry_run: ${isDryRun}`);
      
      const { data, error } = await supabase.functions.invoke('optimize-shop-images', {
        body: {
          shop_id: TELAR_SHOP_ID,
          dry_run: isDryRun
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setShopOptResult(data);
      
      const message = isDryRun 
        ? `[Simulación] ${data.total_images} imágenes analizadas de "${data.shop_name}". Ahorro estimado: ${formatBytes(data.total_savings)} (${data.savings_percent}%)`
        : `✓ ${data.successful} imágenes optimizadas de "${data.shop_name}". Ahorro real: ${formatBytes(data.total_savings)} (${data.savings_percent}%)`;
      
      toast.success(message);

    } catch (error) {
      console.error('[AdminImageOptimization] Error optimizing shop:', error);
      toast.error(error instanceof Error ? error.message : 'Error al optimizar tienda');
    } finally {
      setIsOptimizingShop(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Telar Test Section */}
      <Card className="border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <Zap className="w-5 h-5" />
            🧪 Prueba de Optimización - Tienda "Telar"
          </CardTitle>
          <CardDescription>
            Prueba controlada con las 6 imágenes PNG de la tienda Telar antes de optimizar todo el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={() => optimizeTelarShop(true)}
              disabled={isOptimizingShop}
              variant="outline"
              className="flex-1"
            >
              {isOptimizingShop ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Simular (sin cambios)
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => optimizeTelarShop(false)}
              disabled={isOptimizingShop}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {isOptimizingShop ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Optimizando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Ejecutar Optimización Real
                </>
              )}
            </Button>
          </div>

          {/* Shop Optimization Result */}
          {shopOptResult && (
            <Alert className={shopOptResult.dry_run ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
              <AlertTitle className="flex items-center gap-2">
                {shopOptResult.dry_run ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                {shopOptResult.dry_run ? 'Simulación Completada' : 'Optimización Completada'} - {shopOptResult.shop_name}
              </AlertTitle>
              <AlertDescription className="mt-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="bg-white/50 rounded p-2">
                    <span className="text-muted-foreground block">Imágenes:</span>
                    <span className="font-bold text-lg">{shopOptResult.total_images}</span>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <span className="text-muted-foreground block">Exitosas:</span>
                    <span className="font-bold text-lg text-green-600">{shopOptResult.successful}</span>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <span className="text-muted-foreground block">Tamaño Original:</span>
                    <span className="font-bold text-lg">{formatBytes(shopOptResult.total_original_size)}</span>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <span className="text-muted-foreground block">Ahorro:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatBytes(shopOptResult.total_savings)} ({shopOptResult.savings_percent}%)
                    </span>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="mt-4 border-t pt-3">
                  <p className="text-sm font-medium mb-2">Detalle por archivo:</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {shopOptResult.results.map((result, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white/70 rounded px-2 py-1">
                        <div className="flex items-center gap-2">
                          {result.status === 'success' ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-500" />
                          )}
                          <span className="truncate max-w-[200px]" title={result.path}>
                            {result.path.split('/').pop()}
                          </span>
                          <Badge variant="outline" className="text-[10px]">{result.type}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>{formatBytes(result.originalSize)}</span>
                          {result.optimizedSize && (
                            <>
                              <span>→</span>
                              <span className="text-green-600">{formatBytes(result.optimizedSize)}</span>
                              <span className="text-blue-600">(-{result.savingsPercent}%)</span>
                            </>
                          )}
                          {result.error && (
                            <span className="text-red-500">{result.error}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Optimización de Imágenes en Lote
          </CardTitle>
          <CardDescription>
            Optimiza imágenes existentes en Storage para mejorar el rendimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bucket Selection */}
          <div className="space-y-2">
            <Label>Bucket de Storage</Label>
            <Select value={selectedBucket} onValueChange={setSelectedBucket}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un bucket" />
              </SelectTrigger>
              <SelectContent>
                {BUCKETS.map((bucket) => (
                  <SelectItem key={bucket.id} value={bucket.id}>
                    <div className="flex flex-col">
                      <span>{bucket.name}</span>
                      <span className="text-xs text-muted-foreground">{bucket.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileImage className="w-4 h-4" />
                    Total Archivos
                  </div>
                  <p className="text-2xl font-bold">{stats.total_files || 0}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 dark:bg-green-900/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Completados
                  </div>
                  <p className="text-2xl font-bold text-green-700">{stats.completed_count || 0}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <TrendingDown className="w-4 h-4" />
                    Ahorro Total
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{formatBytes(stats.total_savings_bytes || 0)}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 dark:bg-purple-900/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Zap className="w-4 h-4" />
                    Ahorro Promedio
                  </div>
                  <p className="text-2xl font-bold text-purple-700">{Math.round(stats.average_savings_percent || 0)}%</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Simulación</Label>
                  <p className="text-xs text-muted-foreground">No modifica archivos, solo analiza</p>
                </div>
                <Switch checked={dryRun} onCheckedChange={setDryRun} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reemplazar Original</Label>
                  <p className="text-xs text-muted-foreground">Sobrescribe el archivo original</p>
                </div>
                <Switch 
                  checked={replaceOriginal} 
                  onCheckedChange={setReplaceOriginal}
                  disabled={dryRun}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tamaño de Lote: {batchSize}</Label>
                <Slider 
                  value={[batchSize]} 
                  onValueChange={([v]) => setBatchSize(v)} 
                  min={1} 
                  max={50} 
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Ancho Máximo: {maxWidth}px</Label>
                <Slider 
                  value={[maxWidth]} 
                  onValueChange={([v]) => setMaxWidth(v)} 
                  min={400} 
                  max={2000} 
                  step={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Calidad: {quality}%</Label>
                <Slider 
                  value={[quality]} 
                  onValueChange={([v]) => setQuality(v)} 
                  min={50} 
                  max={95} 
                  step={5}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={runOptimization}
              disabled={!selectedBucket || isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {dryRun ? 'Simular Optimización' : 'Ejecutar Optimización'}
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={loadStats} disabled={!selectedBucket}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Button variant="destructive" onClick={resetLogs} disabled={!selectedBucket}>
              Limpiar Historial
            </Button>
          </div>

          {/* Last Result */}
          {lastResult && (
            <Alert className={dryRun ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
              <AlertTitle className="flex items-center gap-2">
                {dryRun ? <AlertTriangle className="w-4 h-4 text-yellow-600" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                {dryRun ? 'Resultado de Simulación' : 'Resultado de Optimización'}
              </AlertTitle>
              <AlertDescription className="mt-2">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Procesados:</span>
                    <span className="ml-2 font-medium">{lastResult.processed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Omitidos:</span>
                    <span className="ml-2 font-medium">{lastResult.skipped}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fallidos:</span>
                    <span className="ml-2 font-medium">{lastResult.failed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ahorro:</span>
                    <span className="ml-2 font-medium">{formatBytes(lastResult.totalSavingsBytes)}</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Logs Table */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de Optimización</CardTitle>
            <CardDescription>Últimas 50 operaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Archivo</th>
                    <th className="text-left py-2 px-2">Original</th>
                    <th className="text-left py-2 px-2">Optimizado</th>
                    <th className="text-left py-2 px-2">Ahorro</th>
                    <th className="text-left py-2 px-2">Estado</th>
                    <th className="text-left py-2 px-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 max-w-[200px] truncate" title={log.original_path}>
                        {log.original_path.split('/').pop()}
                      </td>
                      <td className="py-2 px-2">{formatBytes(log.original_size_bytes)}</td>
                      <td className="py-2 px-2">
                        {log.optimized_size_bytes ? formatBytes(log.optimized_size_bytes) : '-'}
                      </td>
                      <td className="py-2 px-2">
                        {log.savings_percent ? `${log.savings_percent}%` : '-'}
                      </td>
                      <td className="py-2 px-2">{getStatusBadge(log.status)}</td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {log.processed_at 
                          ? new Date(log.processed_at).toLocaleDateString('es-CO', { 
                              day: '2-digit', 
                              month: 'short', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
