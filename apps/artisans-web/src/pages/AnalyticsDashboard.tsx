import React from 'react';
import { DashboardBackground } from '@/components/dashboard/DashboardBackground';
import { TaskRoutingDashboard } from '@/components/analytics/TaskRoutingDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Task Routing Analytics | Dashboard"
        description="Métricas detalladas sobre el routing de tareas a wizards especializados"
        noIndex={true}
      />
      
      <DashboardBackground>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="border-b bg-card">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Taller Digital
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto">
            <TaskRoutingDashboard />
          </div>
        </div>
      </DashboardBackground>
    </>
  );
};

export default AnalyticsDashboard;
