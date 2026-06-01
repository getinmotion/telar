import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArtisanProfileWizard } from '@/components/shop/wizards/ArtisanProfileWizard';

const ArtisanProfileWizardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return <ArtisanProfileWizard onComplete={handleComplete} />;
};

export default ArtisanProfileWizardPage;
