
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Settings, User, Bell, Globe, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserSettingsProps {
  language: 'en' | 'es';
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({
  language,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    theme: 'dark',
    language: language,
    autoSave: true,
    showTips: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const t = {
    en: {
      userSettings: 'User Settings',
      general: 'General',
      notifications: 'Notifications',
      appearance: 'Appearance',
      language: 'Language',
      theme: 'Theme',
      pushNotifications: 'Push Notifications',
      emailUpdates: 'Email Updates',
      autoSave: 'Auto-save',
      showTips: 'Show Tips',
      cancel: 'Cancel',
      save: 'Save Settings',
      dark: 'Dark',
      light: 'Light',
      system: 'System',
      english: 'English',
      spanish: 'Spanish'
    },
    es: {
      userSettings: 'Configuración de Usuario',
      general: 'General',
      notifications: 'Notificaciones',
      appearance: 'Apariencia',
      language: 'Idioma',
      theme: 'Tema',
      pushNotifications: 'Notificaciones Push',
      emailUpdates: 'Actualizaciones por Email',
      autoSave: 'Guardado Automático',
      showTips: 'Mostrar Consejos',
      cancel: 'Cancelar',
      save: 'Guardar Configuración',
      dark: 'Oscuro',
      light: 'Claro',
      system: 'Sistema',
      english: 'Inglés',
      spanish: 'Español'
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here we would normally save to user preferences in Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: language === 'es' ? 'Configuración guardada' : 'Settings saved',
        description: language === 'es' ? 'Tu configuración se ha actualizado' : 'Your settings have been updated'
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: language === 'es' ? 'No se pudo guardar la configuración' : 'Could not save settings',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t[language].userSettings}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto">
          {/* General Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <h3 className="font-medium">{t[language].general}</h3>
            </div>
            
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoSave">{t[language].autoSave}</Label>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showTips">{t[language].showTips}</Label>
                <Switch
                  id="showTips"
                  checked={settings.showTips}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showTips: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <h3 className="font-medium">{t[language].notifications}</h3>
            </div>
            
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">{t[language].pushNotifications}</Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emailUpdates">{t[language].emailUpdates}</Label>
                <Switch
                  id="emailUpdates"
                  checked={settings.emailUpdates}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailUpdates: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <h3 className="font-medium">{t[language].appearance}</h3>
            </div>
            
            <div className="space-y-3 pl-6">
              <div className="space-y-2">
                <Label>{t[language].theme}</Label>
                <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">{t[language].dark}</SelectItem>
                    <SelectItem value="light">{t[language].light}</SelectItem>
                    <SelectItem value="system">{t[language].system}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t[language].language}</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value: 'en' | 'es') => setSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t[language].english}</SelectItem>
                    <SelectItem value="es">{t[language].spanish}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t[language].cancel}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : t[language].save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
