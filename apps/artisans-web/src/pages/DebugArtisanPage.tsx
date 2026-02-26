import React, { useState, useMemo, useEffect } from 'react';
import { useDebugArtisanData } from '@/hooks/useDebugArtisanData';
import { useAuth } from '@/context/AuthContext';
import { confirmAndReset } from '@/lib/utils/resetUserProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
import { getUserMaturityScoresByUserId } from '@/services/userMaturityScores.actions';
import { getUserMasterContextByUserId } from '@/services/userMasterContext.actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  RefreshCw, 
  Download, 
  Trash2, 
  Activity, 
  Database,
  Eye,
  Code,
  BarChart3,
  CheckCircle2,
  Users,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DebugHealthCheck } from '@/components/debug/DebugHealthCheck';
import { DebugMetricsCard } from '@/components/debug/DebugMetricsCard';
import { DebugDataTable } from '@/components/debug/DebugDataTable';
import { DebugProfileCard } from '@/components/debug/DebugProfileCard';
import { DebugTimeline } from '@/components/debug/DebugTimeline';
import { ExecutiveSummaryCard } from '@/components/debug/ExecutiveSummaryCard';
import { artisanAgentsDatabase } from '@/data/artisanAgentsDatabase';
import { SystemIntegrityDashboard } from '@/components/debug/SystemIntegrityDashboard';

type ViewMode = 'friendly' | 'technical' | 'analytics' | 'integrity';

// Helper to check if object is empty
const isEmpty = (obj: any): boolean => {
  if (!obj) return true;
  if (typeof obj !== 'object') return false;
  return Object.keys(obj).length === 0;
};

interface DataCounts {
  maturityScores: number;
  tasks: number;
  agents: number;
  conversations: number;
  deliverables: number;
  shops: number;
  products: number;
  materials: number;
  loading: boolean;
}

export default function DebugArtisanPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('friendly');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debug log para verificar cambios en showDeleteDialog
  useEffect(() => {
    console.log('🔴 [DEBUG] Estado showDeleteDialog cambió a:', showDeleteDialog);
  }, [showDeleteDialog]);
  const [dataCounts, setDataCounts] = useState<DataCounts>({
    maturityScores: 0,
    tasks: 0,
    agents: 0,
    conversations: 0,
    deliverables: 0,
    shops: 0,
    products: 0,
    materials: 0,
    loading: false
  });
  const { data, loading, error, refresh, exportData } = useDebugArtisanData(autoRefresh);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchDataCounts = async () => {
    if (!user) return;
    
    setDataCounts(prev => ({ ...prev, loading: true }));
    
    try {
      // Log Supabase queries
      
      // Run all queries in parallel
      const [
        { count: scoresCount },
        { count: tasksCount },
        { count: agentsCount },
        { count: conversationsCount },
        { count: deliverablesCount },
        { count: shopsCount },
        { count: materialsCount }
      ] = await Promise.all([
        // ✅ Migrado a endpoint NestJS (GET /user-maturity-scores/user/{user_id})
        getUserMaturityScoresByUserId(user.id).then(scores => ({ count: scores.length })).catch(() => ({ count: 0 })),
        supabase.from('agent_tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_agents').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('agent_chat_conversations').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('agent_deliverables').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('artisan_shops').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('materials').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      // Get products count if shop exists
      let productsCount = 0;
      if (shopsCount && shopsCount > 0) {
        const { data: shopData } = await supabase
          .from('artisan_shops')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (shopData) {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shopData.id);
          productsCount = count || 0;
        }
      }

      setDataCounts({
        maturityScores: scoresCount || 0,
        tasks: tasksCount || 0,
        agents: agentsCount || 0,
        conversations: conversationsCount || 0,
        deliverables: deliverablesCount || 0,
        shops: shopsCount || 0,
        products: productsCount,
        materials: materialsCount || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching data counts:', error);
      setDataCounts(prev => ({ ...prev, loading: false }));
    }
  };

  const createBackup = async () => {
    if (!user) {
      toast.error('Usuario no autenticado');
      return null;
    }

    console.log('💾 [BACKUP] Iniciando backup completo...');
    
    try {
      // Fetch all user data in parallel
      const [
        { data: maturityScores },
        { data: maturityActions },
        { data: tasks },
        { data: deliverables },
        { data: agents },
        { data: conversations },
        { data: userProfile },
        { data: masterContext },
        { data: coordinatorContext },
        { data: shops },
        { data: materials },
        { data: wishlists },
        { data: globalProfiles },
        { data: onboardingProfiles }
      ] = await Promise.all([
        // ✅ Migrado a endpoint NestJS (GET /user-maturity-scores/user/{user_id})
        getUserMaturityScoresByUserId(user.id).then(scores => ({ data: scores })).catch(() => ({ data: [] })),
        supabase.from('user_maturity_actions').select('*').eq('user_id', user.id),
        supabase.from('agent_tasks').select('*').eq('user_id', user.id),
        supabase.from('agent_deliverables').select('*').eq('user_id', user.id),
        supabase.from('user_agents').select('*').eq('user_id', user.id),
        supabase.from('agent_chat_conversations').select('*').eq('user_id', user.id),
        getUserProfileByUserId(user.id).catch(() => null),
        getUserMasterContextByUserId(user.id).catch(() => null),
        supabase.from('master_coordinator_context').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('artisan_shops').select('*').eq('user_id', user.id),
        supabase.from('materials').select('*').eq('user_id', user.id),
        supabase.from('wishlists').select('*').eq('user_id', user.id),
        supabase.from('artisan_global_profiles').select('*').eq('artisan_id', user.id),
        supabase.from('user_onboarding_profiles').select('*').eq('user_id', user.id)
      ]);

      // Get products if shop exists
      let products = [];
      let productVariants = [];
      if (shops && shops.length > 0) {
        const shopIds = shops.map(s => s.id);
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .in('shop_id', shopIds);
        products = productsData || [];

        if (products.length > 0) {
          const productIds = products.map(p => p.id);
          const { data: variantsData } = await supabase
            .from('product_variants')
            .select('*')
            .in('product_id', productIds);
          productVariants = variantsData || [];
        }
      }

      // Get messages for conversations
      let messages = [];
      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        const { data: messagesData } = await supabase
          .from('agent_messages')
          .select('*')
          .in('conversation_id', conversationIds);
        messages = messagesData || [];
      }

      // Get localStorage data
      const localStorageData: Record<string, any> = {};
      const prefix = `user_${user.id}_`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          try {
            const value = localStorage.getItem(key);
            localStorageData[key] = value ? JSON.parse(value) : value;
          } catch {
            localStorageData[key] = localStorage.getItem(key);
          }
        }
      }

      const backup = {
        metadata: {
          userId: user.id,
          userEmail: user.email,
          backupDate: new Date().toISOString(),
          version: '1.0'
        },
        database: {
          maturityScores: maturityScores || [],
          maturityActions: maturityActions || [],
          tasks: tasks || [],
          deliverables: deliverables || [],
          agents: agents || [],
          conversations: conversations || [],
          messages: messages || [],
          userProfile: userProfile || null,
          masterContext: masterContext || null,
          coordinatorContext: coordinatorContext || null,
          shops: shops || [],
          products: products || [],
          productVariants: productVariants || [],
          materials: materials || [],
          wishlists: wishlists || [],
          globalProfiles: globalProfiles || [],
          onboardingProfiles: onboardingProfiles || []
        },
        localStorage: localStorageData
      };

      console.log('✅ [BACKUP] Backup creado exitosamente');
      return backup;
    } catch (error: any) {
      console.error('❌ [BACKUP] Error creando backup:', error);
      toast.error('Error creando backup', {
        description: error.message
      });
      return null;
    }
  };

  const downloadBackup = (backup: any) => {
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `artisan-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Backup descargado', {
      description: 'Tus datos han sido guardados en un archivo JSON'
    });
  };

  const handleShowDeleteDialog = () => {
    console.log('🔴 [DEBUG] Botón "Limpiar Todo" clickeado');
    console.log('🔴 [DEBUG] Estado actual showDeleteDialog:', showDeleteDialog);
    fetchDataCounts();
    setShowDeleteDialog(true);
    console.log('🔴 [DEBUG] Después de setShowDeleteDialog(true)');
  };

  const handleClearAll = async () => {
    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }
    
    console.log('🗑️ [DEBUG-PAGE] Iniciando proceso de limpieza para user:', user.id);
    setIsDeleting(true);
    
    try {
      // Step 1: Create and download backup
      toast.info('💾 Creando backup de tus datos...', {
        description: 'Esto tomará unos segundos'
      });
      
      const backup = await createBackup();
      
      if (!backup) {
        setIsDeleting(false);
        return;
      }
      
      // Download backup
      downloadBackup(backup);
      
      // Wait a moment to ensure download started
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Proceed with deletion
      toast.info('🧹 Limpiando datos...', {
        description: 'Tu backup ha sido descargado'
      });
      
      const result = await confirmAndReset(user.id);
      console.log('🗑️ [DEBUG-PAGE] Resultado del reset:', result);
      
      if (result?.success) {
        toast.success('✅ Todo limpiado correctamente', {
          description: 'Backup guardado. Base de datos y localStorage eliminados. Recargando...'
        });
        
        // Close dialog and reload after a short delay
        setShowDeleteDialog(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error('❌ [DEBUG-PAGE] Reset falló:', result);
        toast.error('Error al limpiar datos', {
          description: result?.message || 'Error desconocido'
        });
        setIsDeleting(false);
      }
    } catch (error: any) {
      console.error('❌ [DEBUG-PAGE] Excepción durante reset:', error);
      toast.error('Error al limpiar datos', {
        description: error?.message || 'Error desconocido'
      });
      setIsDeleting(false);
    }
  };

  const progressPercentage = data.metrics.progressPercentage;
  
  // Calculate health check items
  const healthCheckItems = useMemo(() => {
    const items = [];
    
    items.push({
      label: 'Usuario autenticado',
      status: 'success' as const,
      message: 'Sesión activa'
    });
    
    items.push({
      label: 'Perfil artesanal creado',
      status: data.profileData ? 'success' as const : 'warning' as const,
      message: data.profileData ? 'Perfil completo' : 'Perfil incompleto'
    });
    
    items.push({
      label: 'Datos sincronizados con BD',
      status: data.databaseContext ? 'success' as const : 'warning' as const,
      message: data.databaseContext ? 'Sincronizado' : 'No sincronizado'
    });
    
    const pendingQuestions = data.metrics.totalQuestions - data.metrics.answeredQuestions;
    items.push({
      label: `Preguntas respondidas`,
      status: pendingQuestions === 0 ? 'success' as const : pendingQuestions <= 4 ? 'warning' as const : 'info' as const,
      message: `${data.metrics.answeredQuestions} de ${data.metrics.totalQuestions} completadas`
    });
    
    items.push({
      label: 'Tipo de artesanía',
      status: data.profileData?.craftType ? 'success' as const : 'warning' as const,
      message: data.profileData?.craftType || 'No detectado aún'
    });
    
    if (error) {
      items.push({
        label: 'Estado del sistema',
        status: 'error' as const,
        message: error
      });
    }
    
    return items;
  }, [data, error]);

  const getLastUpdate = () => {
    if (data.events.length > 0) {
      const lastEvent = data.events[0];
      const date = new Date(lastEvent.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Hace menos de 1 minuto';
      if (diffMins === 1) return 'Hace 1 minuto';
      if (diffMins < 60) return `Hace ${diffMins} minutos`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return 'Hace 1 hora';
      return `Hace ${diffHours} horas`;
    }
    return 'Sin actualizaciones';
  };

  if (loading && !data.profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando datos de debug...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Debug Artisan Data | Artisan Platform</title>
      </Helmet>
      
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Activity className="w-6 h-6" />
                    Debug: Artisan Data Monitor
                  </CardTitle>
                  <CardDescription>
                    Monitoreo en tiempo real de la recopilación de datos del calculador de madurez
                  </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Volver al Taller Digital
              </Button>
            </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={refresh} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button onClick={exportData} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar JSON
                  </Button>
                  <Button 
                    onClick={(e) => {
                      console.log('🔴 [DEBUG] Click en botón Limpiar Todo');
                      e.preventDefault();
                      handleShowDeleteDialog();
                    }} 
                    variant="destructive" 
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpiar Todo
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh (2s)</Label>
                  <Switch
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                </div>
              </div>
              
              {/* View Mode Selector */}
              <div className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-lg">
                <Button
                  variant={viewMode === 'friendly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('friendly')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vista Amigable
                </Button>
                <Button
                  variant={viewMode === 'technical' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('technical')}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Vista Técnica
                </Button>
                <Button
                  variant={viewMode === 'analytics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('analytics')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Vista Analítica
                </Button>
                <Button
                  variant={viewMode === 'integrity' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('integrity')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  System Integrity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Friendly View */}
          {viewMode === 'friendly' && (
            <>
              {/* Health Check */}
              <DebugHealthCheck items={healthCheckItems} lastUpdate={getLastUpdate()} />
              
              {/* Executive Summary - Solo si existe */}
              {data.executiveSummary && (
                <ExecutiveSummaryCard summary={data.executiveSummary} />
              )}
              
              {/* Metrics Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DebugMetricsCard
                  title="Bloque Actual"
                  value={`${data.currentBlock} / ${data.totalBlocks}`}
                  icon={Activity}
                  progress={(data.currentBlock / data.totalBlocks) * 100}
                  status={data.currentBlock === data.totalBlocks ? 'success' : 'neutral'}
                  subtitle={`${Math.round((data.currentBlock / data.totalBlocks) * 100)}% completado`}
                />
                
                <DebugMetricsCard
                  title="Preguntas"
                  value={`${data.metrics.answeredQuestions} / ${data.metrics.totalQuestions}`}
                  icon={CheckCircle2}
                  progress={data.metrics.progressPercentage}
                  status={data.metrics.answeredQuestions === data.metrics.totalQuestions ? 'success' : data.metrics.progressPercentage > 50 ? 'warning' : 'neutral'}
                  subtitle={`${data.metrics.progressPercentage}% respondidas`}
                />
                
                <DebugMetricsCard
                  title="Agentes Desbloqueados"
                  value={data.metrics.agentsUnlocked}
                  icon={Users}
                  subtitle={`De ${artisanAgentsDatabase.length} disponibles`}
                  status={data.metrics.agentsUnlocked > 5 ? 'success' : 'neutral'}
                />
                
                <DebugMetricsCard
                  title="IA Procesando"
                  value={data.isProcessing ? 'Activo' : 'En espera'}
                  icon={Target}
                  status={data.isProcessing ? 'warning' : 'neutral'}
                  subtitle={data.isProcessing ? 'Procesando datos...' : 'Listo'}
                />
              </div>
              
              {/* Profile Card */}
              <DebugProfileCard profileData={data.profileData} />
              
              {/* Data Sources - 3 Fuentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Database className="w-6 h-6" />
                    Fuentes de Datos de la Tienda (3 Fuentes)
                  </CardTitle>
                  <CardDescription>
                    Estas son las 3 fuentes de donde ConversationalShopCreation obtiene datos pre-llenados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fuente 1: user_profiles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        1️⃣ user_profiles (Base de Datos)
                      </h3>
                      <Badge variant={
                        !data.profileData?.brandName && 
                        !data.profileData?.businessDescription && 
                        !data.profileData?.businessLocation 
                        ? 'default' : 'destructive'
                      }>
                        {!data.profileData?.brandName && 
                         !data.profileData?.businessDescription && 
                         !data.profileData?.businessLocation 
                         ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">brand_name:</span>
                        <span className="font-mono">{data.profileData?.brandName || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">business_description:</span>
                        <span className="font-mono truncate max-w-[300px]">{data.profileData?.businessDescription || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">business_type:</span>
                        <span className="font-mono">{data.profileData?.businessType || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">business_location:</span>
                        <span className="font-mono">{data.profileData?.businessLocation || 'null'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fuente 2: user_master_context.business_profile */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        2️⃣ user_master_context.business_profile (JSONB)
                      </h3>
                      <Badge variant={isEmpty(data.databaseContext?.business_profile) ? 'default' : 'destructive'}>
                        {isEmpty(data.databaseContext?.business_profile) ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(data.databaseContext?.business_profile || {}, null, 2)}
                    </pre>
                  </div>
                  
                  {/* Fuente 3: localStorage cache */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        3️⃣ localStorage Cache
                      </h3>
                      <Badge variant={Object.keys(data.localStorage).length === 0 ? 'default' : 'destructive'}>
                        {Object.keys(data.localStorage).length === 0 ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items en cache:</span>
                        <span className="font-mono">{Object.keys(data.localStorage).length}</span>
                      </div>
                      {Object.keys(data.localStorage).length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Keys: {Object.keys(data.localStorage).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-500/10 rounded-md border border-blue-500/20">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold mt-0.5">ℹ️</span>
                      <div className="text-xs text-blue-700">
                        <strong>Cómo funciona:</strong> ConversationalShopCreation primero busca en localStorage (más rápido), 
                        luego en user_profiles, y finalmente en user_master_context.business_profile. 
                        Si alguna fuente tiene datos, los usa para pre-llenar el formulario.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Master Context Raw Data */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Master Context - business_profile
                      </CardTitle>
                      <Badge variant={isEmpty(data.databaseContext?.business_profile) ? 'default' : 'destructive'}>
                        {isEmpty(data.databaseContext?.business_profile) ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.databaseContext?.business_profile || {}, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Master Context - task_generation_context
                      </CardTitle>
                      <Badge variant={isEmpty(data.databaseContext?.task_generation_context) ? 'default' : 'destructive'}>
                        {isEmpty(data.databaseContext?.task_generation_context) ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.databaseContext?.task_generation_context || {}, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
              
              {/* Timeline */}
              <DebugTimeline events={data.events} />
            </>
          )}
          
          {/* Technical View */}
          {viewMode === 'technical' && (
            <>
              {/* Data Tables */}
              <div className="grid md:grid-cols-2 gap-6">
                <DebugDataTable
                  title="localStorage Data"
                  data={data.localStorage}
                  icon={<Database className="w-5 h-5" />}
                />
                
                <DebugDataTable
                  title="Database Context"
                  data={data.databaseContext || {}}
                  icon={<Database className="w-5 h-5" />}
                />
              </div>
              
              {/* Raw Profile Data */}
              {data.profileData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Profile Data (Raw)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.profileData, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
              
              {/* Data Sources - 3 Fuentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Database className="w-6 h-6" />
                    Fuentes de Datos de la Tienda (3 Fuentes)
                  </CardTitle>
                  <CardDescription>
                    Estas son las 3 fuentes de donde ConversationalShopCreation obtiene datos pre-llenados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fuente 1: user_profiles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        1️⃣ user_profiles (Base de Datos)
                      </h3>
                      <Badge variant={
                        !data.profileData?.brandName && 
                        !data.profileData?.businessDescription && 
                        !data.profileData?.businessLocation 
                        ? 'default' : 'destructive'
                      }>
                        {!data.profileData?.brandName && 
                         !data.profileData?.businessDescription && 
                         !data.profileData?.businessLocation 
                         ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">brand_name:</span>
                        <span className="font-mono">{data.profileData?.brandName || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">business_description:</span>
                        <span className="font-mono truncate max-w-[300px]">{data.profileData?.businessDescription || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">business_type:</span>
                        <span className="font-mono">{data.profileData?.businessType || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">business_location:</span>
                        <span className="font-mono">{data.profileData?.businessLocation || 'null'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fuente 2: user_master_context.business_profile */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        2️⃣ user_master_context.business_profile (JSONB)
                      </h3>
                      <Badge variant={isEmpty(data.databaseContext?.business_profile) ? 'default' : 'destructive'}>
                        {isEmpty(data.databaseContext?.business_profile) ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(data.databaseContext?.business_profile || {}, null, 2)}
                    </pre>
                  </div>
                  
                  {/* Fuente 3: localStorage cache */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        3️⃣ localStorage Cache
                      </h3>
                      <Badge variant={Object.keys(data.localStorage).length === 0 ? 'default' : 'destructive'}>
                        {Object.keys(data.localStorage).length === 0 ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items en cache:</span>
                        <span className="font-mono">{Object.keys(data.localStorage).length}</span>
                      </div>
                      {Object.keys(data.localStorage).length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Keys: {Object.keys(data.localStorage).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-500/10 rounded-md border border-blue-500/20">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold mt-0.5">ℹ️</span>
                      <div className="text-xs text-blue-700">
                        <strong>Cómo funciona:</strong> ConversationalShopCreation primero busca en localStorage (más rápido), 
                        luego en user_profiles, y finalmente en user_master_context.business_profile. 
                        Si alguna fuente tiene datos, los usa para pre-llenar el formulario.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Master Context Raw Data */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Master Context - business_profile
                      </CardTitle>
                      <Badge variant={isEmpty(data.databaseContext?.business_profile) ? 'default' : 'destructive'}>
                        {isEmpty(data.databaseContext?.business_profile) ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      Este campo debe estar vacío después del reset
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.databaseContext?.business_profile || {}, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Master Context - task_generation_context
                      </CardTitle>
                      <Badge variant={isEmpty(data.databaseContext?.task_generation_context) ? 'default' : 'destructive'}>
                        {isEmpty(data.databaseContext?.task_generation_context) ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      Este campo debe estar vacío después del reset
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.databaseContext?.task_generation_context || {}, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
              
              {/* Timeline */}
              <DebugTimeline events={data.events} />
            </>
          )}
          
          {/* Analytics View */}
          {viewMode === 'analytics' && (
            <>
              {/* Health Check */}
              <DebugHealthCheck items={healthCheckItems} lastUpdate={getLastUpdate()} />
              
              {/* Metrics Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DebugMetricsCard
                  title="Bloque Actual"
                  value={`${data.currentBlock} / ${data.totalBlocks}`}
                  icon={Activity}
                  progress={(data.currentBlock / data.totalBlocks) * 100}
                  status={data.currentBlock === data.totalBlocks ? 'success' : 'neutral'}
                />
                
                <DebugMetricsCard
                  title="Preguntas Respondidas"
                  value={`${data.metrics.answeredQuestions}`}
                  icon={CheckCircle2}
                  progress={data.metrics.progressPercentage}
                  status={data.metrics.answeredQuestions === data.metrics.totalQuestions ? 'success' : 'warning'}
                  trend={{
                    value: data.metrics.answeredQuestions - (data.metrics.totalQuestions / 2),
                    label: 'vs objetivo'
                  }}
                />
                
                <DebugMetricsCard
                  title="Eventos Totales"
                  value={data.events.length}
                  icon={Activity}
                  subtitle="Últimos 20 eventos"
                  status="neutral"
                />
                
                <DebugMetricsCard
                  title="Claridad Promedio"
                  value={data.profileData ? 
                    Math.round(((data.profileData.customerClarity || 0) + (data.profileData.profitClarity || 0)) / 2) : 
                    0
                  }
                  icon={Target}
                  progress={data.profileData ? 
                    (((data.profileData.customerClarity || 0) + (data.profileData.profitClarity || 0)) / 2) * 10 : 
                    0
                  }
                  status="neutral"
                  subtitle="De 10"
                />
              </div>
              
              {/* Data Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de Datos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Datos en localStorage</span>
                      <Badge>{Object.keys(data.localStorage).length} items</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Datos en Database</span>
                      <Badge>{data.databaseContext ? Object.keys(data.databaseContext).length : 0} items</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Eventos registrados</span>
                      <Badge>{data.events.length} eventos</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Perfil completo</span>
                      <Badge variant={data.profileData ? 'default' : 'secondary'}>
                        {data.profileData ? 'Sí' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Estado del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Checkpoint activo</span>
                      <Badge variant={data.checkpointActive ? 'default' : 'secondary'}>
                        {data.checkpointActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">IA procesando</span>
                      <Badge variant={data.isProcessing ? 'default' : 'secondary'}>
                        {data.isProcessing ? 'Sí' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Auto-refresh</span>
                      <Badge variant={autoRefresh ? 'default' : 'secondary'}>
                        {autoRefresh ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Última actualización</span>
                      <span className="text-xs text-muted-foreground">{getLastUpdate()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Data Sources - 3 Fuentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Database className="w-6 h-6" />
                    Fuentes de Datos de la Tienda (3 Fuentes)
                  </CardTitle>
                  <CardDescription>
                    Estas son las 3 fuentes de donde ConversationalShopCreation obtiene datos pre-llenados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fuente 1: user_profiles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        1️⃣ user_profiles (Base de Datos)
                      </h3>
                      <Badge variant={
                        !data.profileData?.brandName && 
                        !data.profileData?.businessDescription && 
                        !data.profileData?.businessLocation 
                        ? 'default' : 'destructive'
                      }>
                        {!data.profileData?.brandName && 
                         !data.profileData?.businessDescription && 
                         !data.profileData?.businessLocation 
                         ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">brand_name:</span>
                        <span className="font-mono">{data.profileData?.brandName || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">business_description:</span>
                        <span className="font-mono truncate max-w-[300px]">{data.profileData?.businessDescription || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">business_type:</span>
                        <span className="font-mono">{data.profileData?.businessType || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">business_location:</span>
                        <span className="font-mono">{data.profileData?.businessLocation || 'null'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fuente 2: user_master_context.business_profile */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        2️⃣ user_master_context.business_profile (JSONB)
                      </h3>
                      <Badge variant={isEmpty(data.databaseContext?.business_profile) ? 'default' : 'destructive'}>
                        {isEmpty(data.databaseContext?.business_profile) ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(data.databaseContext?.business_profile || {}, null, 2)}
                    </pre>
                  </div>
                  
                  {/* Fuente 3: localStorage cache */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        3️⃣ localStorage Cache
                      </h3>
                      <Badge variant={Object.keys(data.localStorage).length === 0 ? 'default' : 'destructive'}>
                        {Object.keys(data.localStorage).length === 0 ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items en cache:</span>
                        <span className="font-mono">{Object.keys(data.localStorage).length}</span>
                      </div>
                      {Object.keys(data.localStorage).length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Keys: {Object.keys(data.localStorage).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-500/10 rounded-md border border-blue-500/20">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold mt-0.5">ℹ️</span>
                      <div className="text-xs text-blue-700">
                        <strong>Cómo funciona:</strong> ConversationalShopCreation primero busca en localStorage (más rápido), 
                        luego en user_profiles, y finalmente en user_master_context.business_profile. 
                        Si alguna fuente tiene datos, los usa para pre-llenar el formulario.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Master Context Raw Data */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Master Context - business_profile
                      </CardTitle>
                      <Badge variant={isEmpty(data.databaseContext?.business_profile) ? 'default' : 'destructive'}>
                        {isEmpty(data.databaseContext?.business_profile) ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.databaseContext?.business_profile || {}, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Master Context - task_generation_context
                      </CardTitle>
                      <Badge variant={isEmpty(data.databaseContext?.task_generation_context) ? 'default' : 'destructive'}>
                        {isEmpty(data.databaseContext?.task_generation_context) ? '✅ VACÍO' : '⚠️ CON DATOS'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(data.databaseContext?.task_generation_context || {}, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
              
              {/* Timeline */}
              <DebugTimeline events={data.events} />
            </>
          )}

          {/* System Integrity View */}
          {viewMode === 'integrity' && (
            <SystemIntegrityDashboard />
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteDialog} 
        onOpenChange={(open) => {
          console.log('🔴 [DEBUG] AlertDialog onOpenChange llamado con:', open);
          setShowDeleteDialog(open);
        }}
      >
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-2xl">
              <Trash2 className="w-6 h-6 text-destructive" />
              ⚠️ Confirmar Eliminación Total
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-6 pt-4">
              <div className="p-4 bg-amber-500/10 rounded-lg border-2 border-amber-500/30">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <div className="font-bold text-amber-900 dark:text-amber-100 text-lg mb-1">
                      Esta acción es IRREVERSIBLE
                    </div>
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      Se eliminarán TODOS los datos listados abajo. No hay forma de recuperarlos.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-semibold text-base flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Datos que se eliminarán:
                </div>
                
                {dataCounts.loading ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Calculando cantidades...</span>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <span className="text-destructive font-bold">✗</span>
                        <span className="font-medium">Evaluaciones de madurez</span>
                      </div>
                      <Badge variant="destructive" className="text-base px-3 py-1">
                        {dataCounts.maturityScores}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <span className="text-destructive font-bold">✗</span>
                        <span className="font-medium">Tareas generadas</span>
                      </div>
                      <Badge variant="destructive" className="text-base px-3 py-1">
                        {dataCounts.tasks}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <span className="text-destructive font-bold">✗</span>
                        <span className="font-medium">Agentes desbloqueados</span>
                      </div>
                      <Badge variant="destructive" className="text-base px-3 py-1">
                        {dataCounts.agents}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <span className="text-destructive font-bold">✗</span>
                        <span className="font-medium">Conversaciones con IA</span>
                      </div>
                      <Badge variant="destructive" className="text-base px-3 py-1">
                        {dataCounts.conversations}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <span className="text-destructive font-bold">✗</span>
                        <span className="font-medium">Entregables generados</span>
                      </div>
                      <Badge variant="destructive" className="text-base px-3 py-1">
                        {dataCounts.deliverables}
                      </Badge>
                    </div>

                    {dataCounts.shops > 0 && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                          <div className="flex items-center gap-2">
                            <span className="text-destructive font-bold">✗</span>
                            <span className="font-medium">Tiendas artesanales</span>
                          </div>
                          <Badge variant="destructive" className="text-base px-3 py-1">
                            {dataCounts.shops}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                          <div className="flex items-center gap-2">
                            <span className="text-destructive font-bold">✗</span>
                            <span className="font-medium">Productos en catálogo</span>
                          </div>
                          <Badge variant="destructive" className="text-base px-3 py-1">
                            {dataCounts.products}
                          </Badge>
                        </div>
                      </>
                    )}

                    {dataCounts.materials > 0 && (
                      <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                        <div className="flex items-center gap-2">
                          <span className="text-destructive font-bold">✗</span>
                          <span className="font-medium">Materiales registrados</span>
                        </div>
                        <Badge variant="destructive" className="text-base px-3 py-1">
                          {dataCounts.materials}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <span className="text-destructive font-bold">✗</span>
                        <span className="font-medium">Progreso en localStorage</span>
                      </div>
                      <Badge variant="destructive" className="text-base px-3 py-1">
                        TODO
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <span className="text-destructive font-bold">✗</span>
                        <span className="font-medium">Perfil de negocio</span>
                      </div>
                      <Badge variant="destructive" className="text-base px-3 py-1">
                        {data.profileData ? 'LIMPIADO' : 'VACÍO'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg border-2 border-green-500/30">
                <div className="flex items-start gap-3">
                  <span className="text-xl">✓</span>
                  <div>
                    <div className="font-bold text-green-700 dark:text-green-300 mb-1">
                      Lo que SE MANTIENE:
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      • Tu cuenta de usuario y email<br/>
                      • Tu contraseña y autenticación<br/>
                      • Tu nombre registrado
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-lg border-2 border-purple-500/30">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💾</span>
                  <div>
                    <div className="font-bold text-purple-700 dark:text-purple-300 mb-1">
                      Backup automático incluido:
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">
                      • Se creará un archivo JSON con todos tus datos<br/>
                      • Se descargará automáticamente antes de limpiar<br/>
                      • Podrás restaurar tu información cuando quieras<br/>
                      • El archivo incluye: base de datos + localStorage
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">💡</span>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Después de limpiar:</strong> La página se recargará automáticamente 
                    y podrás comenzar de nuevo con el test de madurez desde cero.
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAll} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={dataCounts.loading || isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando datos...
                </>
              ) : dataCounts.loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sí, eliminar TODO
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
