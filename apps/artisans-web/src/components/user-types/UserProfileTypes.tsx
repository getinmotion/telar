
import React from 'react';
import { Lightbulb, User, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';

export const UserProfileTypes: React.FC = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Where are you today with your project?",
      subtitle: "Get in Motion grows with you, wherever you are.",
      ideaTitle: "I just have the idea",
      ideaDescription: "I have an idea, but I don't know where to start and don't have anything set up yet.",
      soloTitle: "I'm working on this, but alone",
      soloDescription: "I've already started, but I do everything myself: sell, create, collect, publish.",
      teamTitle: "I have a team",
      teamDescription: "I work with more people and need to coordinate or delegate tasks.",
      copilot1: "Copilot: Let's define your vision",
      copilot2: "Copilot: Free up your time",
      copilot3: "Copilot: Organize your team"
    },
    es: {
      title: "¿Dónde estás hoy con tu proyecto?",
      subtitle: "Get in Motion crece con vos. Estés donde estés.",
      ideaTitle: "Apenas tengo la idea",
      ideaDescription: "Tengo una idea, pero no sé por dónde empezar ni tengo nada montado todavía.",
      soloTitle: "Estoy trabajando en esto, pero solo/a",
      soloDescription: "Ya empecé, pero todo lo hago yo: vender, crear, cobrar, publicar.",
      teamTitle: "Tengo un equipo",
      teamDescription: "Trabajo con más personas y necesito coordinar o delegar tareas.",
      copilot1: "Copilot: Definamos tu visión",
      copilot2: "Copilot: Liberá tu tiempo",
      copilot3: "Copilot: Organizá tu equipo"
    }
  };

  const t = translations[language];

  return (
    <div className="w-full py-16 bg-gradient-to-br from-indigo-900/70 to-purple-900/70 rounded-xl backdrop-blur-sm" id="profile-types">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 font-serif">{t.title}</h2>
          <p className="text-lg text-indigo-100 max-w-3xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* User Type 1: Just have the idea */}
          <Card 
            className="group relative transition-all hover:shadow-md hover:-translate-y-1 bg-indigo-900/50 border-indigo-800/30"
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mr-4">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-pink-200">{t.ideaTitle}</h3>
              </div>
              
              <p className="text-indigo-100 mb-4">{t.ideaDescription}</p>
              
              <Badge className="bg-pink-500/30 text-pink-200 hover:bg-pink-500/40">
                {t.copilot1}
              </Badge>
            </CardContent>
          </Card>

          {/* User Type 2: Working alone */}
          <Card 
            className="group relative transition-all hover:shadow-md hover:-translate-y-1 bg-indigo-900/50 border-indigo-800/30"
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-200">{t.soloTitle}</h3>
              </div>
              
              <p className="text-indigo-100 mb-4">{t.soloDescription}</p>
              
              <Badge className="bg-purple-500/30 text-purple-200 hover:bg-purple-500/40">
                {t.copilot2}
              </Badge>
            </CardContent>
          </Card>

          {/* User Type 3: Have a team */}
          <Card 
            className="group relative transition-all hover:shadow-md hover:-translate-y-1 bg-indigo-900/50 border-indigo-800/30"
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-indigo-200">{t.teamTitle}</h3>
              </div>
              
              <p className="text-indigo-100 mb-4">{t.teamDescription}</p>
              
              <Badge className="bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/40">
                {t.copilot3}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
