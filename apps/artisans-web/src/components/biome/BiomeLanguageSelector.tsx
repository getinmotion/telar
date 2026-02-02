import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Check, Code, FileText, Zap } from 'lucide-react';
import { BIOME_SUPPORTED_LANGUAGES, DEFAULT_BIOME_CONFIG, type BiomeLanguage, type BiomeConfig } from '@/types/biome';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

export const BiomeLanguageSelector: React.FC = () => {
  const { language: appLanguage } = useLanguage();
  const [biomeConfig, setBiomeConfig] = useState<BiomeConfig>(DEFAULT_BIOME_CONFIG);
  const [isApplying, setIsApplying] = useState(false);

  const handleLanguageChange = (newLanguage: BiomeLanguage) => {
    setBiomeConfig(prev => ({
      ...prev,
      language: newLanguage
    }));
  };

  const handleConfigChange = (key: keyof BiomeConfig, value: any) => {
    setBiomeConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedConfigChange = (section: 'formatter' | 'linter' | 'organizeImports', key: string, value: any) => {
    setBiomeConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const applyConfiguration = async () => {
    setIsApplying(true);
    try {
      // Simulate API call to apply biome configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedLang = BIOME_SUPPORTED_LANGUAGES.find(lang => lang.code === biomeConfig.language);
      toast.success(
        appLanguage === 'es' 
          ? `Configuración de Biome aplicada para ${selectedLang?.nativeName}`
          : `Biome configuration applied for ${selectedLang?.nativeName}`
      );
    } catch (error) {
      toast.error(
        appLanguage === 'es' 
          ? 'Error al aplicar la configuración de Biome'
          : 'Error applying Biome configuration'
      );
    } finally {
      setIsApplying(false);
    }
  };

  const currentLangConfig = BIOME_SUPPORTED_LANGUAGES.find(lang => lang.code === biomeConfig.language);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">
          {appLanguage === 'es' ? 'Configurador de Biome' : 'Biome Configuration'}
        </h1>
        <p className="text-muted-foreground">
          {appLanguage === 'es' 
            ? 'Configura Biome para diferentes idiomas y regiones'
            : 'Configure Biome for different languages and regions'
          }
        </p>
      </motion.div>

      {/* Language Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {appLanguage === 'es' ? 'Selección de Idioma' : 'Language Selection'}
            </CardTitle>
            <CardDescription>
              {appLanguage === 'es' 
                ? 'Elige el idioma para las configuraciones de Biome'
                : 'Choose the language for Biome configurations'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BIOME_SUPPORTED_LANGUAGES.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    biomeConfig.language === lang.code
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50 bg-background/50'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl">{lang.flag}</div>
                    <div className="font-medium text-sm">{lang.nativeName}</div>
                    <div className="text-xs text-muted-foreground">{lang.biomeLocale}</div>
                    {biomeConfig.language === lang.code && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        {appLanguage === 'es' ? 'Seleccionado' : 'Selected'}
                      </Badge>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Configuration Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Formatter Settings */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {appLanguage === 'es' ? 'Formateador' : 'Formatter'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {appLanguage === 'es' ? 'Habilitado' : 'Enabled'}
              </label>
              <Switch
                checked={biomeConfig.formatter.enabled}
                onCheckedChange={(checked) => handleNestedConfigChange('formatter', 'enabled', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {appLanguage === 'es' ? 'Ancho de línea' : 'Line Width'}
              </label>
              <Select
                value={biomeConfig.formatter.lineWidth.toString()}
                onValueChange={(value) => handleNestedConfigChange('formatter', 'lineWidth', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80">80</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="120">120</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {appLanguage === 'es' ? 'Estilo de indentación' : 'Indent Style'}
              </label>
              <Select
                value={biomeConfig.formatter.indentStyle}
                onValueChange={(value: 'space' | 'tab') => handleNestedConfigChange('formatter', 'indentStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="space">
                    {appLanguage === 'es' ? 'Espacios' : 'Spaces'}
                  </SelectItem>
                  <SelectItem value="tab">Tabs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Linter Settings */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              {appLanguage === 'es' ? 'Linter' : 'Linter'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {appLanguage === 'es' ? 'Habilitado' : 'Enabled'}
              </label>
              <Switch
                checked={biomeConfig.linter.enabled}
                onCheckedChange={(checked) => handleNestedConfigChange('linter', 'enabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {appLanguage === 'es' ? 'Nivel de severidad' : 'Severity Level'}
              </label>
              <Select
                value={biomeConfig.linter.level}
                onValueChange={(value: 'error' | 'warn' | 'info') => handleNestedConfigChange('linter', 'level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {appLanguage === 'es' ? 'Organizar imports' : 'Organize Imports'}
              </label>
              <Switch
                checked={biomeConfig.organizeImports.enabled}
                onCheckedChange={(checked) => handleNestedConfigChange('organizeImports', 'enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Apply Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  {appLanguage === 'es' ? 'Aplicar Configuración' : 'Apply Configuration'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {appLanguage === 'es' 
                    ? `Aplicar configuración para ${currentLangConfig?.nativeName} (${currentLangConfig?.biomeLocale})`
                    : `Apply configuration for ${currentLangConfig?.nativeName} (${currentLangConfig?.biomeLocale})`
                  }
                </p>
              </div>
              <Button 
                onClick={applyConfiguration}
                disabled={isApplying}
                className="bg-primary hover:bg-primary/90"
              >
                {isApplying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"
                    />
                    {appLanguage === 'es' ? 'Aplicando...' : 'Applying...'}
                  </>
                ) : (
                  appLanguage === 'es' ? 'Aplicar' : 'Apply'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};