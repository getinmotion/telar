import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Globe } from 'lucide-react';
import { getLanguageConfig } from '@/types/language';
import { useLanguage } from '@/context/LanguageContext';

interface LanguageSwitcherButtonProps {
  onClick: () => void;
  variant?: 'desktop' | 'mobile' | 'login';
  className?: string;
}

export const LanguageSwitcherButton: React.FC<LanguageSwitcherButtonProps> = ({ 
  onClick, 
  variant = 'desktop',
  className = '' 
}) => {
  const { language, isLoading } = useLanguage();
  const currentConfig = getLanguageConfig(language);

  if (variant === 'mobile') {
    return (
      <Button
        variant="ghost"
        onClick={onClick}
        disabled={isLoading}
        className={`w-full justify-start gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 font-medium transition-all duration-200 hover:bg-purple-50 rounded-xl ${className}`}
      >
        <Globe className="w-4 h-4" />
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentConfig.flag}</span>
          <span>{currentConfig.nativeName}</span>
        </div>
        <ChevronDown className="w-4 h-4 ml-auto" />
      </Button>
    );
  }

  if (variant === 'login') {
    return (
      <Button
        variant="ghost"
        onClick={onClick}
        disabled={isLoading}
        className={`flex items-center gap-2 text-indigo-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200 ${className}`}
      >
        <Globe className="w-4 h-4" />
        <div className="flex items-center gap-2">
          <span className="text-sm">{currentConfig.flag}</span>
          <span className="hidden sm:inline text-sm">{currentConfig.nativeName}</span>
        </div>
        <ChevronDown className="w-3 h-3" />
      </Button>
    );
  }

  // Desktop variant
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-105 transform ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{currentConfig.flag}</span>
        <span className="hidden sm:inline text-sm font-medium">{currentConfig.nativeName}</span>
      </div>
      <ChevronDown className="w-3 h-3" />
    </Button>
  );
};