import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardBackground } from '@/components/dashboard/DashboardBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEO_CONFIG } from '@/config/seo';

const AgentDetails = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user, isAuthorized } = useAuth();
  const navigate = useNavigate();

  

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not authorized (but don't block rendering)
  useEffect(() => {
    if (!isAuthorized && !user) {
      console.log('AgentDetails: Not authorized, redirecting...');
      navigate('/login', { replace: true });
    }
  }, [isAuthorized, user, navigate]);

  // Special handling for master-coordinator
  if (agentId === 'master-coordinator') {
    navigate('/dashboard', { replace: true });
    return null;
  }

  if (!agentId) {
    console.error('AgentDetails: No agent ID provided');
    return (
      <DashboardBackground>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p>No se proporcionó ID de agente</p>
          </div>
        </div>
      </DashboardBackground>
    );
  }

  const seoData = SEO_CONFIG.pages.dashboard.es; // Default to Spanish

  // Sub-agents are now accessed through Task Execution Interface
  return (
    <>
      <SEOHead
        title={`${seoData.title} - Especialista ${agentId}`}
        description={seoData.description}
        keywords={seoData.keywords}
        url={`${SEO_CONFIG.siteUrl}/dashboard/agent/${agentId}`}
        type="website"
        noIndex={true}
      />
      
      <DashboardBackground>
        <div className="min-h-screen">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <Card className="border-warning/20 bg-warning/10">
              <div className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  Acceso Restringido
                </h1>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Los especialistas solo pueden ser accedidos a través del Coordinador Maestro 
                  para asegurar un flujo de trabajo guiado y estructurado.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Coordinador Maestro
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard/tasks')}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Ver Mis Tareas
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DashboardBackground>
    </>
  );
};

export default AgentDetails;