
import React from 'react';
import { UserProfileData } from '../types/wizardTypes';
import { IconOption } from '../wizard-components/IconOption';
import { CheckboxCards } from '../wizard-components/CheckboxCards';
import { RadioCards } from '../wizard-components/RadioCards';
import { Separator } from '@/components/ui/separator';
import { Music, PaintBucket, Wrench, Projector, Package, Palette, MoreHorizontal } from 'lucide-react';
import { StepContainer } from '../wizard-components/StepContainer';

interface ProfileStepProps {
  profileData: UserProfileData;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  language: 'en' | 'es';
}

export const ProfileStep: React.FC<ProfileStepProps> = ({ 
  profileData, 
  updateProfileData, 
  language 
}) => {
  const t = {
    en: {
      title: "Let's get to know your cultural project",
      subtitle: "Tell us about your creative field and experience",
      industryQuestion: "What's your main creative industry or field?",
      activitiesQuestion: "What kind of activities do you do as part of your work?",
      experienceQuestion: "How long have you been working in this field?",
      industries: {
        music: "Music",
        visual_arts: "Visual or Plastic Arts",
        crafts: "Traditional or Modern Crafts",
        theater: "Theater / Dance / Performance",
        personal_care: "Personal or Home Care Products",
        events: "Cultural Production or Events",
        other: "Other"
      },
      activities: {
        physical_products: "I produce and sell physical objects",
        classes: "I teach classes or workshops",
        services: "I offer in-person services",
        live_shows: "I live from live shows or performances",
        selling_online: "I manage online sales through social media or platforms",
        export: "I export or sell to other countries",
        other: "Other"
      },
      experience: {
        less_than_6_months: "Less than 6 months",
        '6_months_to_2_years': "Between 6 months and 2 years",
        more_than_2_years: "More than 2 years"
      }
    },
    es: {
      title: "Conozcamos tu proyecto cultural",
      subtitle: "Cuéntanos sobre tu campo creativo y experiencia",
      industryQuestion: "¿Cuál es tu industria o campo creativo principal?",
      activitiesQuestion: "¿Qué tipo de cosas hacés hoy como parte de tu trabajo?",
      experienceQuestion: "¿Hace cuánto tiempo trabajás en esto?",
      industries: {
        music: "Música",
        visual_arts: "Artes visuales o plásticas",
        crafts: "Artesanía tradicional o moderna",
        theater: "Teatro / danza / performance",
        personal_care: "Productos para el cuidado personal o la casa",
        events: "Producción o eventos culturales",
        other: "Otro"
      },
      activities: {
        physical_products: "Produzco y vendo objetos físicos",
        classes: "Doy clases o talleres",
        services: "Ofrezco servicios presenciales",
        live_shows: "Vivo de funciones o shows en vivo",
        selling_online: "Manejo ventas por redes o plataformas",
        export: "Exporto o vendo a otros países",
        other: "Otro"
      },
      experience: {
        less_than_6_months: "Menos de 6 meses",
        '6_months_to_2_years': "Entre 6 meses y 2 años",
        more_than_2_years: "Más de 2 años"
      }
    }
  };
  
  const industryOptions = [
    { id: 'music', icon: <Music className="w-6 h-6" />, label: t[language].industries.music },
    { id: 'visual_arts', icon: <PaintBucket className="w-6 h-6" />, label: t[language].industries.visual_arts },
    { id: 'crafts', icon: <Wrench className="w-6 h-6" />, label: t[language].industries.crafts },
    { id: 'theater', icon: <Projector className="w-6 h-6" />, label: t[language].industries.theater },
    { id: 'personal_care', icon: <Package className="w-6 h-6" />, label: t[language].industries.personal_care },
    { id: 'events', icon: <Palette className="w-6 h-6" />, label: t[language].industries.events },
    { id: 'other', icon: <MoreHorizontal className="w-6 h-6" />, label: t[language].industries.other }
  ];
  
  const activityOptions = [
    { id: 'physical_products', label: t[language].activities.physical_products },
    { id: 'classes', label: t[language].activities.classes },
    { id: 'services', label: t[language].activities.services },
    { id: 'live_shows', label: t[language].activities.live_shows },
    { id: 'selling_online', label: t[language].activities.selling_online },
    { id: 'export', label: t[language].activities.export },
    { id: 'other', label: t[language].activities.other }
  ];
  
  const experienceOptions = [
    { id: 'less_than_6_months', label: t[language].experience.less_than_6_months },
    { id: '6_months_to_2_years', label: t[language].experience['6_months_to_2_years'] },
    { id: 'more_than_2_years', label: t[language].experience.more_than_2_years }
  ];
  
  const handleIndustrySelect = (industry: string) => {
    updateProfileData({ industry });
  };
  
  const handleActivityToggle = (activity: string, isChecked: boolean) => {
    const currentActivities = [...(profileData.activities || [])];
    
    if (isChecked && !currentActivities.includes(activity)) {
      // Add the activity
      updateProfileData({ activities: [...currentActivities, activity] });
    } else if (!isChecked && currentActivities.includes(activity)) {
      // Remove the activity
      updateProfileData({ activities: currentActivities.filter(item => item !== activity) });
    }
  };
  
  const handleExperienceSelect = (experience: string) => {
    updateProfileData({ experience });
  };
  
  return (
    <StepContainer
      title={t[language].title}
      subtitle={t[language].subtitle}
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t[language].industryQuestion}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {industryOptions.map(option => (
              <IconOption
                key={option.id}
                id={option.id}
                icon={option.icon}
                label={option.label}
                selected={profileData.industry === option.id}
                onClick={handleIndustrySelect}
              />
            ))}
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t[language].activitiesQuestion}</h3>
          <CheckboxCards
            options={activityOptions}
            selectedValues={profileData.activities || []}
            onChange={handleActivityToggle}
            withIcons={false}
          />
        </div>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t[language].experienceQuestion}</h3>
          <RadioCards
            name="experience"
            options={experienceOptions}
            selectedValue={profileData.experience}
            onChange={handleExperienceSelect}
          />
        </div>
      </div>
    </StepContainer>
  );
};
