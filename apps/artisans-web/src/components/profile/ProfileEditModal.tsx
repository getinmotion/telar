import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserBusinessProfile, BusinessModel, BusinessStage, SalesChannel, TimeAvailability, FinancialResources, TeamSize, BusinessGoal } from '@/types/profile';
import { useLanguage } from '@/context/LanguageContext';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessProfile: UserBusinessProfile;
  onSave: (updatedProfile: Partial<UserBusinessProfile>) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  businessProfile,
  onSave
}) => {
  const { language } = useLanguage();
  const currentLang = mapToLegacyLanguage(language);
  const [formData, setFormData] = useState({
    fullName: businessProfile.fullName,
    businessModel: businessProfile.businessModel,
    businessStage: businessProfile.businessStage,
    currentChannels: businessProfile.currentChannels,
    timeAvailability: businessProfile.timeAvailability,
    financialResources: businessProfile.financialResources,
    teamSize: businessProfile.teamSize,
    primaryGoals: businessProfile.primaryGoals,
    monthlyRevenueGoal: businessProfile.monthlyRevenueGoal,
    urgentNeeds: businessProfile.urgentNeeds.join(', ')
  });

  const t = {
    en: {
      editProfile: 'Edit Profile',
      fullName: 'Full Name',
      businessModel: 'Business Model',
      businessStage: 'Business Stage',
      currentChannels: 'Current Sales Channels',
      timeAvailability: 'Time Availability',
      financialResources: 'Financial Resources',
      teamSize: 'Team Size',
      primaryGoals: 'Primary Goals',
      monthlyRevenueGoal: 'Monthly Revenue Goal',
      urgentNeeds: 'Urgent Needs (comma separated)',
      save: 'Save Changes',
      cancel: 'Cancel',
      businessModels: {
        artisan: 'Artisan',
        services: 'Services',
        ecommerce: 'E-commerce',
        saas: 'SaaS',
        consulting: 'Consulting',
        retail: 'Retail',
        content: 'Content',
        other: 'Other'
      },
      stages: {
        idea: 'Idea',
        mvp: 'MVP',
        early: 'Early',
        growth: 'Growth',
        established: 'Established'
      },
      channels: {
        instagram: 'Instagram',
        facebook: 'Facebook',
        whatsapp: 'WhatsApp',
        website: 'Website',
        marketplace: 'Marketplace',
        physical_store: 'Physical Store',
        word_of_mouth: 'Word of Mouth',
        email: 'Email'
      }
    },
    es: {
      editProfile: 'Editar Perfil',
      fullName: 'Nombre Completo',
      businessModel: 'Modelo de Negocio',
      businessStage: 'Etapa del Negocio',
      currentChannels: 'Canales de Venta Actuales',
      timeAvailability: 'Disponibilidad de Tiempo',
      financialResources: 'Recursos Financieros',
      teamSize: 'Tamaño del Equipo',
      primaryGoals: 'Objetivos Principales',
      monthlyRevenueGoal: 'Meta de Ingresos Mensuales',
      urgentNeeds: 'Necesidades Urgentes (separadas por comas)',
      save: 'Guardar Cambios',
      cancel: 'Cancelar',
      businessModels: {
        artisan: 'Artesanal',
        services: 'Servicios',
        ecommerce: 'E-commerce',
        saas: 'SaaS',
        consulting: 'Consultoría',
        retail: 'Comercio',
        content: 'Contenido',
        other: 'Otro'
      },
      stages: {
        idea: 'Idea',
        mvp: 'MVP',
        early: 'Temprano',
        growth: 'Crecimiento',
        established: 'Establecido'
      },
      channels: {
        instagram: 'Instagram',
        facebook: 'Facebook',
        whatsapp: 'WhatsApp',
        website: 'Sitio Web',
        marketplace: 'Marketplace',
        physical_store: 'Tienda Física',
        word_of_mouth: 'Boca a Boca',
        email: 'Email'
      }
    }
  };

  const handleSave = () => {
    const updatedProfile: Partial<UserBusinessProfile> = {
      fullName: formData.fullName,
      businessModel: formData.businessModel,
      businessStage: formData.businessStage,
      currentChannels: formData.currentChannels,
      timeAvailability: formData.timeAvailability,
      financialResources: formData.financialResources,
      teamSize: formData.teamSize,
      primaryGoals: formData.primaryGoals,
      monthlyRevenueGoal: formData.monthlyRevenueGoal,
      urgentNeeds: formData.urgentNeeds.split(',').map(need => need.trim()).filter(Boolean)
    };

    onSave(updatedProfile);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t[currentLang].editProfile}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">{t[currentLang].fullName}</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            />
          </div>

          {/* Business Model */}
          <div>
            <Label>{t[currentLang].businessModel}</Label>
            <Select
              value={formData.businessModel}
              onValueChange={(value: BusinessModel) => setFormData(prev => ({ ...prev, businessModel: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t[currentLang].businessModels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Stage */}
          <div>
            <Label>{t[currentLang].businessStage}</Label>
            <Select
              value={formData.businessStage}
              onValueChange={(value: BusinessStage) => setFormData(prev => ({ ...prev, businessStage: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t[currentLang].stages).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Channels */}
          <div>
            <Label>{t[currentLang].currentChannels}</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(t[currentLang].channels).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={formData.currentChannels.includes(key as SalesChannel)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData(prev => ({
                          ...prev,
                          currentChannels: [...prev.currentChannels, key as SalesChannel]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          currentChannels: prev.currentChannels.filter(c => c !== key)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue Goal */}
          <div>
            <Label htmlFor="revenueGoal">{t[currentLang].monthlyRevenueGoal}</Label>
            <Input
              id="revenueGoal"
              type="number"
              value={formData.monthlyRevenueGoal || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                monthlyRevenueGoal: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
            />
          </div>

          {/* Urgent Needs */}
          <div>
            <Label htmlFor="urgentNeeds">{t[currentLang].urgentNeeds}</Label>
            <Textarea
              id="urgentNeeds"
              value={formData.urgentNeeds}
              onChange={(e) => setFormData(prev => ({ ...prev, urgentNeeds: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {t[currentLang].save}
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              {t[currentLang].cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};