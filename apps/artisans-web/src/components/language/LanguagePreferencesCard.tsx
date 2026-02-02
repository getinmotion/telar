import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Languages, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Zap,
  RefreshCw
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, type Language, getLanguageConfig } from '@/types/language';
import { useLanguageSystem } from '@/hooks/useLanguageSystem';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface LanguageStatus {
  coordinatorSync: boolean;
  lastSyncTime: Date;
  translationQuality: number;
  totalInteractions: number;
}

export const LanguagePreferencesCard: React.FC = () => {
  const { language, setLanguage, isLoading, updateMasterCoordinatorLanguage } = useLanguageSystem();
  const { toast } = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [preserveTechnical, setPreserveTechnical] = useState(false);
  
  const currentConfig = getLanguageConfig(language);
  
  // Mock status data - in real implementation, this would come from your backend
  const languageStatus: LanguageStatus = {
    coordinatorSync: true,
    lastSyncTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    translationQuality: 94,
    totalInteractions: 247
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      toast({
        title: "Actualizando idioma...",
        description: "Sincronizando con el Coordinador Maestro"
      });
      
      await setLanguage(newLanguage);
      await updateMasterCoordinatorLanguage(newLanguage);
      
      toast({
        title: "✅ Idioma actualizado",
        description: `Cambiado a ${getLanguageConfig(newLanguage).nativeName}`
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo cambiar el idioma. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleSyncCoordinator = async () => {
    try {
      toast({
        title: "🔄 Sincronizando...",
        description: "Actualizando Coordinador Maestro"
      });
      
      await updateMasterCoordinatorLanguage(language);
      
      toast({
        title: "✅ Sincronizado",
        description: "Coordinador Maestro actualizado correctamente"
      });
    } catch (error) {
      toast({
        title: "❌ Error de sincronización",
        description: "No se pudo sincronizar. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Estado del Idioma
              </CardTitle>
              {languageStatus.coordinatorSync ? (
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Sincronizado
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Desincronizado
                </Badge>
              )}
            </div>
            <CardDescription>
              Configuración actual y estado de sincronización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentConfig.flag}</span>
                <div>
                  <p className="font-semibold">{currentConfig.nativeName}</p>
                  <p className="text-sm text-muted-foreground">{currentConfig.name}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-1">
                  <Globe className="w-3 h-3 mr-1" />
                  Coordinador Maestro
                </Badge>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Sync hace {Math.floor((Date.now() - languageStatus.lastSyncTime.getTime()) / 60000)}m
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Calidad de traducción</span>
                  <span className="font-medium">{languageStatus.translationQuality}%</span>
                </div>
                <Progress value={languageStatus.translationQuality} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Interacciones totales</span>
                  <span className="font-medium">{languageStatus.totalInteractions}</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-gradient-primary rounded-full" 
                    style={{ width: '67%' }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language Selection Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Idioma</CardTitle>
            <CardDescription>
              Selecciona el idioma para la plataforma y el Coordinador Maestro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? "default" : "outline"}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isLoading}
                  className="flex flex-col p-4 h-auto space-y-2 hover:scale-105 transition-all duration-200"
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs opacity-70">{lang.name}</span>
                  {language === lang.code && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuración Avanzada
                </CardTitle>
                <CardDescription>
                  Personaliza el comportamiento de las traducciones
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Auto-traducción</label>
                  <p className="text-xs text-muted-foreground">
                    Traduce automáticamente el contenido generado
                  </p>
                </div>
                <Switch
                  checked={autoTranslate}
                  onCheckedChange={setAutoTranslate}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Preservar términos técnicos</label>
                  <p className="text-xs text-muted-foreground">
                    Mantener palabras técnicas en inglés cuando sea apropiado
                  </p>
                </div>
                <Switch
                  checked={preserveTechnical}
                  onCheckedChange={setPreserveTechnical}
                />
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Sincronización manual</p>
                  <p className="text-xs text-muted-foreground">
                    Forzar actualización del Coordinador Maestro
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncCoordinator}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Sincronizar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Impact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Impacto del cambio de idioma</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Toda la interfaz se actualizará al nuevo idioma</li>
                  <li>• El Coordinador Maestro generará respuestas en el idioma seleccionado</li>
                  <li>• Los reportes y análisis se mostrarán en el nuevo idioma</li>
                  <li>• La configuración se guardará para futuras sesiones</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};