import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '@/types/language';
import { useLanguage } from '@/context/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, setLanguage, isLoading } = useLanguage();
  const currentConfig = getLanguageConfig(language);

  return (
    <Select
      value={language}
      onValueChange={setLanguage}
      disabled={isLoading}
    >
      <SelectTrigger className="w-auto min-w-[120px] bg-background/90 border-border hover:border-primary transition-all duration-300 rounded-xl shadow-sm">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-sm">{currentConfig.flag}</span>
            <span className="hidden sm:inline text-sm font-medium text-foreground">{currentConfig.nativeName}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background border-2 border-border shadow-[var(--shadow-elegant)] rounded-xl z-[9999]">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code}
            className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};