export type BiomeLanguage = 'es' | 'en' | 'pt' | 'fr';

export interface BiomeConfig {
  language: BiomeLanguage;
  enabled: boolean;
  formatter: {
    enabled: boolean;
    indentStyle: 'space' | 'tab';
    indentWidth: number;
    lineWidth: number;
  };
  linter: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info';
  };
  organizeImports: {
    enabled: boolean;
  };
}

export interface BiomeLanguageConfig {
  code: BiomeLanguage;
  name: string;
  nativeName: string;
  flag: string;
  biomeLocale: string;
}

export const BIOME_SUPPORTED_LANGUAGES: BiomeLanguageConfig[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', biomeLocale: 'es-ES' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', biomeLocale: 'en-US' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', biomeLocale: 'pt-BR' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', biomeLocale: 'fr-FR' }
];

export const DEFAULT_BIOME_CONFIG: BiomeConfig = {
  language: 'es',
  enabled: true,
  formatter: {
    enabled: true,
    indentStyle: 'space',
    indentWidth: 2,
    lineWidth: 100
  },
  linter: {
    enabled: true,
    level: 'error'
  },
  organizeImports: {
    enabled: true
  }
};