import React from 'react';
import { IntelligentBrandWizard } from '@/components/brand/IntelligentBrandWizard';
import { BrandWizardHeader } from '@/components/brand/BrandWizardHeader';

const IntelligentBrandWizardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <BrandWizardHeader />
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <IntelligentBrandWizard />
        </div>
      </div>
    </div>
  );
};

export default IntelligentBrandWizardPage;
