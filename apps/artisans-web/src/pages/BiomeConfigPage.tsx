import React from 'react';
import { BiomeLanguageSelector } from '@/components/biome/BiomeLanguageSelector';

export const BiomeConfigPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <BiomeLanguageSelector />
    </div>
  );
};