import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

import { MasterCoordinatorCommandCenter } from '@/components/master-coordinator/MasterCoordinatorCommandCenter';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEO_CONFIG } from '@/config/seo';

const MasterCoordinatorChat = () => {
  const { user, isAuthorized } = useAuth();
  const navigate = useNavigate();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not authorized (but don't block rendering)
  useEffect(() => {
    if (!isAuthorized && !user) {
      console.log('MasterCoordinatorChat: No autorizado, redirigiendo...');
      navigate('/login', { replace: true });
    }
  }, [isAuthorized, user, navigate]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <SEOHead
        title="Tu Coordinador Artesanal - Conversemos"
        description="Conversa con tu coordinador digital personalizado"
        keywords="coordinador artesanal, chat, asistente digital, artesanos"
        url={`${SEO_CONFIG.siteUrl}/dashboard/agent/master-coordinator`}
        type="website"
        noIndex={true}
      />
      
      <MasterCoordinatorCommandCenter 
        language="es"
        onBack={handleBack}
      />
    </>
  );
};

export default MasterCoordinatorChat;