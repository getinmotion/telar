
import React, { useState } from 'react';
import { Lightbulb, User, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

type ProfileType = 'idea' | 'solo' | 'team' | null;

interface ProfileSelectorProps {
  onProfileSelected: (profileType: ProfileType) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onProfileSelected }) => {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const userLocalStorage = useUserLocalStorage();

  const translations = {
    en: {
      title: "Where are you today with your project?",
      subtitle: "We'll help you move forward from where you are. Choose the option that best represents you right now.",
      ideaTitle: "I just have the idea",
      ideaDescription: "I have an idea, but I don't know where to start and don't have anything set up yet.",
      soloTitle: "I'm working on this, but alone",
      soloDescription: "I've already started, but I do everything myself: sell, create, collect, publish.",
      teamTitle: "I have a team",
      teamDescription: "I work with more people and need to coordinate or delegate tasks.",
      confirmButton: "Confirm Selection",
      selectedMessage: "Ready! This helps us help you better!",
    },
    es: {
      title: "¿Dónde estás hoy con tu proyecto?",
      subtitle: "Te ayudamos a avanzar desde donde estés. Elige la opción que mejor te representa ahora.",
      ideaTitle: "Apenas tengo la idea",
      ideaDescription: "Tengo una idea, pero no sé por dónde empezar ni tengo nada montado todavía.",
      soloTitle: "Estoy trabajando en esto, pero solo/a",
      soloDescription: "Ya empecé, pero todo lo hago yo: vender, crear, cobrar, publicar.",
      teamTitle: "Tengo un equipo",
      teamDescription: "Trabajo con más personas y necesito coordinar o delegar tareas.",
      confirmButton: "Confirmar Selección",
      selectedMessage: "¡Listo, esto nos ayuda a ayudarte mejor!",
    }
  };

  const t = translations[language];

  const handleSelect = (type: ProfileType) => {
    setSelectedProfile(type);
  };

  const handleConfirm = () => {
    if (selectedProfile) {
      onProfileSelected(selectedProfile);
      
      // Save the selected profile to user-namespaced localStorage
      userLocalStorage.setItem('userProfile', selectedProfile);
      
      toast({
        title: t.selectedMessage,
        description: new Date().toLocaleTimeString(),
      });
      
      // Navigate to dashboard with onboarding flag and profile type
      navigate('/dashboard', { state: { startOnboarding: true, profileType: selectedProfile } });
    }
  };

  return (
    <div className="py-16 bg-gradient-to-br from-primary/70 to-secondary/70 rounded-xl backdrop-blur-sm" id="profile-selector">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary font-serif">{t.title}</h2>
          <p className="text-lg text-primary-foreground/90 max-w-3xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Option 1: Just have the idea */}
          <Card 
            className={`relative group cursor-pointer transition-all ${
              selectedProfile === 'idea' 
                ? 'ring-2 ring-accent shadow-lg shadow-accent/20 scale-105' 
                : 'hover:shadow-md hover:-translate-y-1'
            } bg-card/50 border-border`}
            onClick={() => handleSelect('idea')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mr-4">
                  <Lightbulb className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold text-accent">{t.ideaTitle}</h3>
              </div>
              
              <RadioGroup className="mb-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="idea" 
                    id="idea" 
                    checked={selectedProfile === 'idea'}
                    className="border-accent text-accent"
                  />
                  <Label htmlFor="idea" className="text-foreground/90">{t.ideaDescription}</Label>
                </div>
              </RadioGroup>
              
              {selectedProfile === 'idea' && (
                <Badge className="mt-2 bg-accent/30 text-accent hover:bg-accent/40">
                  Copilot: {language === 'en' ? "Let's define your vision" : "Definamos tu visión"}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Option 2: Working alone */}
          <Card 
            className={`relative group cursor-pointer transition-all ${
              selectedProfile === 'solo' 
                ? 'ring-2 ring-primary shadow-lg shadow-primary/20 scale-105' 
                : 'hover:shadow-md hover:-translate-y-1'
            } bg-card/50 border-border`}
            onClick={() => handleSelect('solo')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-primary">{t.soloTitle}</h3>
              </div>
              
              <RadioGroup className="mb-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="solo" 
                    id="solo" 
                    checked={selectedProfile === 'solo'}
                    className="border-primary text-primary"
                  />
                  <Label htmlFor="solo" className="text-foreground/90">{t.soloDescription}</Label>
                </div>
              </RadioGroup>
              
              {selectedProfile === 'solo' && (
                <Badge className="mt-2 bg-primary/30 text-primary hover:bg-primary/40">
                  Copilot: {language === 'en' ? "Free up your time" : "Liberá tu tiempo"}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Option 3: Have a team */}
          <Card 
            className={`relative group cursor-pointer transition-all ${
              selectedProfile === 'team' 
                ? 'ring-2 ring-secondary shadow-lg shadow-secondary/20 scale-105' 
                : 'hover:shadow-md hover:-translate-y-1'
            } bg-card/50 border-border`}
            onClick={() => handleSelect('team')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-secondary">{t.teamTitle}</h3>
              </div>
              
              <RadioGroup className="mb-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="team" 
                    id="team" 
                    checked={selectedProfile === 'team'}
                    className="border-secondary text-secondary"
                  />
                  <Label htmlFor="team" className="text-foreground/90">{t.teamDescription}</Label>
                </div>
              </RadioGroup>
              
              {selectedProfile === 'team' && (
                <Badge className="mt-2 bg-secondary/30 text-secondary hover:bg-secondary/40">
                  Copilot: {language === 'en' ? "Organize your team" : "Organizá tu equipo"}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <Button
            onClick={handleConfirm}
            disabled={!selectedProfile}
            size="lg"
            className={`transition-all duration-300 ${
              selectedProfile 
                ? 'bg-gradient-to-r from-accent to-primary hover:from-accent/80 hover:to-primary/80 border-none' 
                : 'bg-muted cursor-not-allowed'
            }`}
          >
            {t.confirmButton}
          </Button>
        </div>
      </div>
    </div>
  );
};
