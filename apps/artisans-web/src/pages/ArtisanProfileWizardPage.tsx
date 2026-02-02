import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { ArtisanProfileWizard } from '@/components/shop/wizards/ArtisanProfileWizard';

const ArtisanProfileWizardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/mi-tienda');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <ShopHeader 
        title="PERFIL ARTESANAL"
        subtitle="Cuenta tu historia como artesano"
        showBackButton={true}
      />
      
      <div className="max-w-4xl mx-auto p-4 py-8">
        <ArtisanProfileWizard onComplete={handleComplete} />
      </div>
    </div>
  );
};

export default ArtisanProfileWizardPage;
