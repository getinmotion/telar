
import React, { useState } from 'react';
import { Lightbulb, User, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
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
  const { t } = useTranslations();
  const navigate = useNavigate();
  const userLocalStorage = useUserLocalStorage();

  const handleSelect = (type: ProfileType) => {
    setSelectedProfile(type);
  };

  const handleConfirm = () => {
    if (selectedProfile) {
      onProfileSelected(selectedProfile);
      
      // Guardamos el perfil seleccionado en user-namespaced localStorage
      userLocalStorage.setItem('userProfile', selectedProfile);
      
      toast({
        title: t.profileSelector.selectedMessage,
        description: new Date().toLocaleTimeString(),
      });
      
      // Redireccionamos al onboarding con el tipo de perfil
      navigate('/dashboard', { state: { startOnboarding: true, profileType: selectedProfile } });
    }
  };

  return (
    <div className="py-16 bg-[var(--gradient-subtle)] rounded-2xl backdrop-blur-sm shadow-[var(--shadow-elegant)]" id="profile-selector">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-[var(--gradient-primary)] font-serif">{t.profileSelector.title}</h2>
          <p className="text-lg text-foreground max-w-3xl mx-auto">{t.profileSelector.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Option 1: Just have the idea */}
          <Card 
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedProfile === 'idea' 
                ? 'ring-2 ring-primary shadow-[var(--shadow-elegant)] scale-105' 
                : 'hover:shadow-[var(--shadow-hover)] hover:-translate-y-1'
            } bg-card border-border`}
            onClick={() => handleSelect('idea')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--gradient-primary)] flex items-center justify-center mr-4 shadow-sm">
                  <Lightbulb className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{t.profileSelector.ideaTitle}</h3>
              </div>
              
              <RadioGroup className="mb-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="idea" 
                    id="idea" 
                    checked={selectedProfile === 'idea'}
                    className="border-primary text-primary"
                  />
                  <Label htmlFor="idea" className="text-muted-foreground">{t.profileSelector.ideaDescription}</Label>
                </div>
              </RadioGroup>
              
              {selectedProfile === 'idea' && (
                <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary">
                  Copilot: Definamos tu visión
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Option 2: Working alone */}
          <Card 
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedProfile === 'solo' 
                ? 'ring-2 ring-primary shadow-[var(--shadow-elegant)] scale-105' 
                : 'hover:shadow-[var(--shadow-hover)] hover:-translate-y-1'
            } bg-card border-border`}
            onClick={() => handleSelect('solo')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--gradient-primary)] flex items-center justify-center mr-4 shadow-sm">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{t.profileSelector.soloTitle}</h3>
              </div>
              
              <RadioGroup className="mb-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="solo" 
                    id="solo" 
                    checked={selectedProfile === 'solo'}
                    className="border-primary text-primary"
                  />
                  <Label htmlFor="solo" className="text-muted-foreground">{t.profileSelector.soloDescription}</Label>
                </div>
              </RadioGroup>
              
              {selectedProfile === 'solo' && (
                <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary">
                  Copilot: Liberá tu tiempo
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Option 3: Have a team */}
          <Card 
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedProfile === 'team' 
                ? 'ring-2 ring-primary shadow-[var(--shadow-elegant)] scale-105' 
                : 'hover:shadow-[var(--shadow-hover)] hover:-translate-y-1'
            } bg-card border-border`}
            onClick={() => handleSelect('team')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--gradient-primary)] flex items-center justify-center mr-4 shadow-sm">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{t.profileSelector.teamTitle}</h3>
              </div>
              
              <RadioGroup className="mb-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="team" 
                    id="team" 
                    checked={selectedProfile === 'team'}
                    className="border-primary text-primary"
                  />
                  <Label htmlFor="team" className="text-muted-foreground">{t.profileSelector.teamDescription}</Label>
                </div>
              </RadioGroup>
              
              {selectedProfile === 'team' && (
                <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary">
                  Copilot: Organizá tu equipo
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
            variant={selectedProfile ? "default" : "outline"}
            className={`px-10 py-6 text-lg transition-all duration-300 ${
              selectedProfile 
                ? 'shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] hover:scale-105' 
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            {t.profileSelector.confirmButton}
          </Button>
        </div>
      </div>
    </div>
  );
};
