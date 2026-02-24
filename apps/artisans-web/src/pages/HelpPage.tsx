import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  ArrowLeft,
  Video,
  FileText,
  Users
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();

  const helpResources = [
    {
      icon: BookOpen,
      title: 'Centro de Ayuda',
      description: 'Explora guías y tutoriales detallados',
      action: () => window.open('https://docs.telar.la', '_blank')
    },
    {
      icon: Video,
      title: 'Video Tutoriales',
      description: 'Aprende visualmente con nuestros videos',
      action: () => window.open('https://youtube.com/@telar', '_blank')
    },
    {
      icon: MessageSquare,
      title: 'Chat en Vivo',
      description: 'Habla con nuestro equipo de soporte',
      action: () => navigate('/dashboard/coordinator-chat')
    },
    {
      icon: Mail,
      title: 'Contacto por Email',
      description: 'Envíanos tus preguntas a aloha@telar.la',
      action: () => window.location.href = 'mailto:aloha@telar.la'
    },
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Únete a nuestra comunidad de artesanos',
      action: () => window.open('https://community.telar.la', '_blank')
    },
    {
      icon: FileText,
      title: 'Preguntas Frecuentes',
      description: 'Encuentra respuestas rápidas a dudas comunes',
      action: () => navigate('/faq')
    }
  ];

  const quickGuides = [
    {
      title: '¿Cómo crear mi primera tienda?',
      description: 'Guía paso a paso para configurar tu tienda artesanal',
      link: '/dashboard/create-shop'
    },
    {
      title: '¿Cómo subir productos?',
      description: 'Aprende a agregar tus creaciones al catálogo',
      link: '/productos/subir'
    },
    {
      title: '¿Cómo usar el Coordinador Maestro?',
      description: 'Tu asistente IA para gestionar tu negocio',
      link: '/dashboard/coordinator-chat'
    },
    {
      title: '¿Cómo gestionar mi inventario?',
      description: 'Mantén control de tus productos y stock',
      link: '/dashboard/inventory'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Centro de Ayuda | TELAR</title>
        <meta name="description" content="Encuentra ayuda y recursos para gestionar tu negocio artesanal en TELAR" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  ¿Cómo podemos ayudarte?
                </h1>
                <p className="text-muted-foreground text-lg">
                  Encuentra recursos y soporte para tu negocio
                </p>
              </div>
            </div>
          </div>

          {/* Help Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {helpResources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={resource.action}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Quick Guides Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Guías Rápidas</CardTitle>
              <CardDescription>
                Comienza con estos tutoriales paso a paso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickGuides.map((guide, index) => (
                <div
                  key={index}
                  onClick={() => navigate(guide.link)}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <h3 className="font-semibold text-foreground mb-1">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {guide.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Support CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                ¿Aún necesitas ayuda?
              </h2>
              <p className="mb-6 opacity-90">
                Nuestro equipo de soporte está listo para asistirte
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/dashboard/coordinator-chat')}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Abrir Chat
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = 'mailto:aloha@telar.la'}
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Enviar Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default HelpPage;
